// AUTH
let currentUser = null;

async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) setUser(session.user);

  supabase.auth.onAuthStateChange((_e, session) => {
    if (session) setUser(session.user);
    else clearUser();
  });
}

function setUser(user) {
  currentUser = user;
  const nav = document.getElementById('navActions');
  const writeBtn = document.getElementById('writeBtn');
  const hero = document.getElementById('heroSection');
  const name = user.user_metadata?.name || user.email.split('@')[0];
  const initials = name.slice(0,2).toUpperCase();

  if (nav) nav.innerHTML = `
    <div class="user-pill">
      <div class="avatar-sm">${initials}</div>
      <span>${name}</span>
    </div>
    <button class="btn btn-outline btn-sm" onclick="doLogout()">Выйти</button>
  `;
  if (writeBtn) writeBtn.style.display = 'inline-block';
  if (hero) hero.style.display = 'none';
}

function clearUser() {
  currentUser = null;
  location.reload();
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  showMsg('', '');
  const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
  if (error) showMsg(error.message, 'error');
  else { document.getElementById('authOverlay').classList.remove('active'); }
}

async function doRegister() {
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass  = document.getElementById('regPass').value;
  if (!name) return showMsg('Введи имя', 'error');
  showMsg('', '');
  const { error } = await supabase.auth.signUp({
    email, password: pass,
    options: { data: { name } }
  });
  if (error) showMsg(error.message, 'error');
  else showMsg('Проверь почту и подтверди email ✉️', 'success');
}

async function doLogout() {
  await supabase.auth.signOut();
}

function openModal(tab) {
  document.getElementById('authOverlay').classList.add('active');
  switchTab(tab);
}

function closeModal(e) {
  if (e.target === document.getElementById('authOverlay'))
    document.getElementById('authOverlay').classList.remove('active');
}

function switchTab(tab) {
  document.getElementById('loginForm').style.display    = tab === 'login'    ? '' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? '' : 'none';
  document.getElementById('tabLogin').className    = 'tab' + (tab === 'login'    ? ' active' : '');
  document.getElementById('tabRegister').className = 'tab' + (tab === 'register' ? ' active' : '');
  document.getElementById('authMsg').innerHTML = '';
}

function showMsg(text, type) {
  const el = document.getElementById('authMsg');
  el.innerHTML = text ? `<div class="msg ${type}">${text}</div>` : '';
}

initAuth();
