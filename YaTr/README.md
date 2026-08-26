---
title: Yandex Meeting Transcriber
emoji: 🎙️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# Yandex Meeting Transcriber (backend)

REST API для транскрибации видео/аудио из публичной папки Яндекс.Диска.

## Эндпоинты
- `POST /api/start` — `{"yandex_url": "..."}` → `{"job_id": "..."}`
- `GET /api/status/{job_id}`
- `GET /api/file/{job_id}/{name}`
- `GET /api/download/{job_id}`
