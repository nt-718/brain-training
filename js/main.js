/* ===== SCREEN ROUTING ===== */
let currentScreen = 'home';

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  currentScreen = id;
  if (typeof vcStop === 'function') vcStop();
  if (typeof ntStop === 'function') ntStop();
  if (typeof tsStop === 'function') tsStop();
  if (typeof slStop === 'function') slStop();
  if (typeof ssStop === 'function') ssStop();
  if (typeof sgStop === 'function') sgStop();
  if (typeof jsStop === 'function') jsStop();
  if (typeof wlStop === 'function') wlStop();
  if (typeof smStop === 'function') smStop();
}

/* ===== RESULT OVERLAY ===== */
let _retryFn = null;

function showResult(icon, title, detail, onRetry) {
  document.getElementById('res-icon').textContent   = icon;
  document.getElementById('res-title').textContent  = title;
  document.getElementById('res-detail').textContent = detail;
  _retryFn = onRetry;
  document.getElementById('result-overlay').classList.add('show');
}

function resultHome() {
  document.getElementById('result-overlay').classList.remove('show');
  showScreen('home');
}

function resultRetry() {
  document.getElementById('result-overlay').classList.remove('show');
  if (_retryFn) _retryFn();
}

/* ===== UTILITIES ===== */
function rand(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
