# Blogio — MVP

## Структура файлов
```
index.html      — лента публикаций + авторизация
create.html     — редактор + ИИ-помощник
post.html       — страница публикации
js/config.js    — СЮДА ВСТАВИТЬ КЛЮЧИ
js/auth.js      — логика авторизации
js/feed.js      — загрузка ленты
netlify.toml    — конфиг деплоя
```

---

## 🚀 Запуск за 3 шага

### 1. Supabase — создай проект

Зайди на https://supabase.com → New project

**Выполни в SQL Editor (Database → SQL Editor → New query):**

```sql
-- Таблица профилей
create table profiles (
  id uuid references auth.users primary key,
  name text,
  created_at timestamptz default now()
);

-- Автосоздание профиля при регистрации
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

-- Таблица постов
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

-- RLS политики
alter table posts enable row level security;
alter table profiles enable row level security;

create policy "Posts are public" on posts for select using (published = true);
create policy "Users insert own posts" on posts for insert with check (auth.uid() = user_id);
create policy "Profiles are public" on profiles for select using (true);

-- Storage для картинок
insert into storage.buckets (id, name, public) values ('images', 'images', true);
create policy "Anyone can upload images" on storage.objects for insert with check (bucket_id = 'images');
create policy "Images are public" on storage.objects for select using (bucket_id = 'images');
```

### 2. Заполни js/config.js

```js
const SUPABASE_URL  = 'https://xxxxxx.supabase.co';   // Settings → API
const SUPABASE_ANON = 'eyJxxxxxx...';                   // anon public key
const CLAUDE_API_KEY = 'sk-ant-xxxxxx';                 // console.anthropic.com
```

### 3. Деплой на Netlify

**Вариант А — через GitHub:**
1. Залей папку в репозиторий GitHub
2. Netlify → Add new site → Import from Git
3. Build command: (пусто)
4. Publish directory: `.`
5. Deploy!

**Вариант Б — перетащи папку:**
Netlify → Sites → перетащи папку `blog` прямо в браузер

---

## ✅ Что работает в MVP

- Регистрация / вход по email
- Создание публикации (текст + картинка + YouTube)
- ИИ-помощник прямо в редакторе (Claude)
- Публичная страница по ссылке
- Лента всех публикаций
- Поделиться в Telegram

## 🔜 Следующий шаг

- Лайки и комментарии
- Профиль автора
- Telegram бот
- Подписки
