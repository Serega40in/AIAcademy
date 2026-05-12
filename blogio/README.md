# Blogio — MVP (полностью бесплатный стек)

## Стек
```
GitHub Pages   — фронтенд       (бесплатно навсегда)
Supabase       — база + auth + storage  (бесплатно)
Gemini API     — ИИ-помощник    (1500 req/день бесплатно)
```

---

## 🚀 Запуск за 3 шага

### Шаг 1 — Supabase

1. Зайди на https://supabase.com → New project
2. Database → SQL Editor → New query → вставь и выполни:

```sql
create table profiles (
  id uuid references auth.users primary key,
  name text,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text not null,
  image_url text,
  youtube_url text,
  slug text unique not null,
  published boolean default true,
  created_at timestamptz default now()
);

alter table posts enable row level security;
alter table profiles enable row level security;

create policy "Posts are public" on posts for select using (published = true);
create policy "Users insert own posts" on posts for insert with check (auth.uid() = user_id);
create policy "Profiles are public" on profiles for select using (true);

insert into storage.buckets (id, name, public) values ('images', 'images', true);
create policy "Anyone can upload images" on storage.objects for insert with check (bucket_id = 'images');
create policy "Images are public" on storage.objects for select using (bucket_id = 'images');
```

3. Settings → API → скопируй **Project URL** и **anon public key**

---

### Шаг 2 — Gemini API (бесплатно)

1. Зайди на https://aistudio.google.com
2. Нажми **Get API key** → Create API key
3. Скопируй ключ

---

### Шаг 3 — Заполни js/config.js

```js
const SUPABASE_URL   = 'https://xxxxxx.supabase.co';
const SUPABASE_ANON  = 'eyJxxxxxx...';
const GEMINI_API_KEY = 'AIzaSyxxxxxx';
```

---

### Шаг 4 — Деплой на GitHub Pages

1. Залей папку в репозиторий GitHub (например `serega40in/blogio`)
2. Settings → Pages → Source: **Deploy from branch**
3. Branch: `main`, folder: `/ (root)` → Save
4. Через минуту сайт живёт на `https://serega40in.github.io/blogio/`

> ⚠️ Supabase: добавь свой GitHub Pages URL в
> Authentication → URL Configuration → Site URL

---

## ✅ Что работает

- Регистрация / вход по email
- Создание поста: текст + картинка + YouTube embed
- ИИ-помощник на Gemini (бесплатно)
- Публичная страница по ссылке
- Лента всех публикаций
- Поделиться в Telegram

## 🔜 Следующий шаг

- Лайки и комментарии
- Профиль автора
- Telegram бот
- Подписки