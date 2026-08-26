import os
import re
import time
import shutil
import zipfile
import tempfile
import threading
import uuid

import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse, JSONResponse
from pydantic import BaseModel
from faster_whisper import WhisperModel

# ============ НАСТРОЙКИ ============
MODEL_SIZE = os.environ.get("WHISPER_MODEL", "small")   # tiny/base/small на бесплатном CPU
LANGUAGE = os.environ.get("WHISPER_LANG", "ru")
JOBS_DIR = tempfile.mkdtemp(prefix="jobs_")

VIDEO_EXT = {".mp4", ".mov", ".mkv", ".avi", ".webm", ".m4a", ".mp3", ".wav"}
YA_API = "https://cloud-api.yandex.net/v1/disk/public/resources"
YA_DOWNLOAD_API = "https://cloud-api.yandex.net/v1/disk/public/resources/download"

print(f"Загружаю модель Whisper: {MODEL_SIZE} (CPU, int8)...")
model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
print("Модель загружена.")

# job_id -> {
#   "status": "running"/"done"/"error",
#   "started_at": float, "finished_at": float|None,
#   "total": int,
#   "files": [ {"name":..., "txt_name":..., "status":"ok"/"error", "seconds": float, "error": str|None} ],
#   "zip_path": str|None, "error": str|None,
# }
JOBS = {}


def safe_filename(name: str) -> str:
    name = os.path.splitext(name)[0]
    return re.sub(r'[\\/*?:"<>|]', "_", name).strip()[:150] or "file"


def list_all_files(public_key: str, path: str = "/", limit: int = 200):
    results = []
    offset = 0
    while True:
        params = {"public_key": public_key, "path": path, "limit": limit, "offset": offset}
        r = requests.get(YA_API, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
        items = data.get("_embedded", {}).get("items", [])
        for item in items:
            if item["type"] == "dir":
                results.extend(list_all_files(public_key, item["path"], limit))
            else:
                ext = os.path.splitext(item.get("name", ""))[1].lower()
                if ext in VIDEO_EXT:
                    results.append(item)
        if len(items) < limit:
            break
        offset += limit
    return results


def get_direct_link(public_key: str, item: dict) -> str:
    if item.get("file"):
        return item["file"]
    r = requests.get(YA_DOWNLOAD_API, params={"public_key": public_key, "path": item["path"]}, timeout=30)
    r.raise_for_status()
    return r.json()["href"]


def transcribe_source(source) -> str:
    segments, _info = model.transcribe(source, language=LANGUAGE, vad_filter=True, beam_size=1)
    lines = []
    for seg in segments:
        ts = time.strftime('%H:%M:%S', time.gmtime(seg.start))
        lines.append(f"[{ts}] {seg.text.strip()}")
    return "\n".join(lines)


def run_job(job_id: str, yandex_url: str):
    job = JOBS[job_id]
    out_dir = os.path.join(JOBS_DIR, job_id)
    os.makedirs(out_dir, exist_ok=True)

    try:
        files = list_all_files(yandex_url)
    except Exception as e:
        job["status"] = "error"
        job["error"] = f"Не удалось прочитать ссылку Яндекс.Диска: {e}"
        job["finished_at"] = time.time()
        return

    job["total"] = len(files)

    for item in files:
        name = item["name"]
        t0 = time.time()
        try:
            link = get_direct_link(yandex_url, item)
            try:
                text = transcribe_source(link)  # напрямую по ссылке, без сохранения
            except Exception:
                tmp_path = os.path.join(out_dir, "_tmp_" + safe_filename(name))
                with requests.get(link, stream=True, timeout=600) as r:
                    r.raise_for_status()
                    with open(tmp_path, "wb") as f:
                        shutil.copyfileobj(r.raw, f)
                text = transcribe_source(tmp_path)
                os.remove(tmp_path)

            txt_name = safe_filename(name) + ".txt"
            out_path = os.path.join(out_dir, txt_name)
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(f"# {name}\n\n{text}")

            job["files"].append({
                "name": name, "txt_name": txt_name, "status": "ok",
                "seconds": round(time.time() - t0, 1), "error": None,
            })
        except Exception as e:
            job["files"].append({
                "name": name, "txt_name": None, "status": "error",
                "seconds": round(time.time() - t0, 1), "error": str(e),
            })

    zip_path = os.path.join(JOBS_DIR, f"{job_id}.zip")
    with zipfile.ZipFile(zip_path, "w") as zf:
        for fn in os.listdir(out_dir):
            if fn.endswith(".txt"):
                zf.write(os.path.join(out_dir, fn), fn)

    job["zip_path"] = zip_path
    job["status"] = "done"
    job["finished_at"] = time.time()


# ============ REST API (для фронтенда на GitHub Pages) ============
api = FastAPI()
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class StartRequest(BaseModel):
    yandex_url: str


@api.post("/api/start")
def start_job(req: StartRequest):
    job_id = uuid.uuid4().hex[:12]
    JOBS[job_id] = {
        "status": "running", "started_at": time.time(), "finished_at": None,
        "total": 0, "files": [], "zip_path": None, "error": None,
    }
    t = threading.Thread(target=run_job, args=(job_id, req.yandex_url), daemon=True)
    t.start()
    return {"job_id": job_id, "started_at": JOBS[job_id]["started_at"]}


@api.get("/api/status/{job_id}")
def get_status(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        return JSONResponse({"status": "not_found"}, status_code=404)
    return {
        "status": job["status"],
        "started_at": job["started_at"],
        "finished_at": job["finished_at"],
        "total": job["total"],
        "done": len(job["files"]),
        "files": job["files"],
        "error": job["error"],
        "ready_to_download": job["zip_path"] is not None,
    }


@api.get("/api/download/{job_id}")
def download_zip(job_id: str):
    job = JOBS.get(job_id)
    if not job or not job["zip_path"]:
        return JSONResponse({"error": "not ready"}, status_code=404)
    return FileResponse(job["zip_path"], filename="transcripts.zip", media_type="application/zip")


@api.get("/api/file/{job_id}/{txt_name}")
def download_one(job_id: str, txt_name: str):
    path = os.path.join(JOBS_DIR, job_id, txt_name)
    if not os.path.isfile(path):
        return JSONResponse({"error": "not found"}, status_code=404)
    with open(path, encoding="utf-8") as f:
        content = f.read()
    return PlainTextResponse(content)


app = api

@app.get("/")
def root():
    return {"status": "ok", "info": "Backend для транскрибации встреч. См. /api/start, /api/status/{id}, /api/file/{id}/{name}, /api/download/{id}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
