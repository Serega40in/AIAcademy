// ================================================
// BLOGIO CONFIG — заполни свои ключи Supabase
// ================================================
// 1. Зайди на supabase.com → New project
// 2. Settings → API → скопируй URL и anon key
// 3. Вставь сюда

const SUPABASE_URL  = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON = 'YOUR_ANON_KEY';

// Claude API key для ИИ-помощника
const CLAUDE_API_KEY = 'YOUR_CLAUDE_API_KEY';

// ================================================
// НЕ ТРОГАЙ НИЖЕ
// ================================================
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
