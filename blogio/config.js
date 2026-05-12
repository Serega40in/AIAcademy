// ================================================
// BLOGIO CONFIG — заполни свои ключи Supabase
// ================================================
// 1. Зайди на supabase.com → New project
// 2. Settings → API → скопируй URL и anon key
// 3. Вставь сюда

const SUPABASE_URL  = 'https://bilivmphgfzrsqpwygfk.supabase.co';
const SUPABASE_ANON = 'sb_publishable_NYdSkTt4qkJf0fwpl51fdA_dX7dMkGg';

// Claude API key для ИИ-помощника
const CLAUDE_API_KEY = 'YOUR_CLAUDE_API_KEY';

// ================================================
// НЕ ТРОГАЙ НИЖЕ
// ================================================
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
