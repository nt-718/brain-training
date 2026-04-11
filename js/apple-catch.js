/* ===== APPLE CATCH ===== */

var AC_RANKS = [
  { min: 28, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 22, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 16, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 12, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 7,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 3,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const AC_BEST_KEY   = 'acBest';
const AC_TIME_TOTAL = 30;
const AC_MAX_LIVES  = 3;

let acRunning    = false;
let acScore      = 0;
let acLives      = 0;
let acTimeLeft   = 0;
let acNextId     = 0;
let acApples     = []; // { id, type, el, tapped }
let acGameTimer  = null;
let acSpawnTimer = null;

/* ---- difficulty ---- */
function acGetDiff() {
  const lv = Math.floor(acScore / 5);
  return {
    spawnMs:  Math.max(350,  1000 - lv * 80),
    fallMs:   Math.max(1300, 3200 - lv * 200),
    redRatio: Math.min(0.45, 0.18  + lv * 0.03),
  };
}

/* ---- helpers ---- */
function acLoadBest() {
  document.getElementById('ac-best').textContent = localStorage.getItem(AC_BEST_KEY) || '0';
}

function acUpdateLives() {
  document.getElementById('ac-lives').textContent = '❤️'.repeat(Math.max(0, acLives));
}

/* ---- lifecycle ---- */
function acStop() {
  acRunning = false;
  clearInterval(acGameTimer);
  clearTimeout(acSpawnTimer);
  acGameTimer = acSpawnTimer = null;
  acApples.forEach(a => a.el.remove());
  acApples = [];
  document.getElementById('ac-overlay').style.display = 'flex';
  document.getElementById('ac-timer-fill').style.width = '100%';
  document.getElementById('ac-timer-fill').style.background =
    'linear-gradient(90deg, var(--accent), var(--primary))';
  acLoadBest();
}

function acStart() {
  acScore    = 0;
  acLives    = AC_MAX_LIVES;
  acTimeLeft = AC_TIME_TOTAL;
  acRunning  = true;
  acNextId   = 0;
  acApples   = [];

  document.getElementById('ac-score').textContent = 0;
  document.getElementById('ac-time').textContent  = AC_TIME_TOTAL;
  document.getElementById('ac-overlay').style.display = 'none';
  acUpdateLives();
  acLoadBest();

  clearInterval(acGameTimer);
  acGameTimer = setInterval(() => {
    acTimeLeft -= 0.1;
    const pct = Math.max(0, acTimeLeft / AC_TIME_TOTAL * 100);
    const fill = document.getElementById('ac-timer-fill');
    fill.style.width = pct + '%';
    fill.style.background = pct < 30 ? 'var(--secondary)'
      : 'linear-gradient(90deg, var(--accent), var(--primary))';
    document.getElementById('ac-time').textContent = Math.ceil(acTimeLeft);
    if (acTimeLeft <= 0) acTimeUp();
  }, 100);

  acScheduleSpawn();
}

/* ---- spawning ---- */
function acScheduleSpawn() {
  if (!acRunning) return;
  acSpawnTimer = setTimeout(() => {
    acSpawnApple();
    acScheduleSpawn();
  }, acGetDiff().spawnMs);
}

function acSpawnApple() {
  if (!acRunning) return;
  const { fallMs, redRatio } = acGetDiff();
  const isRed = Math.random() < redRatio;
  const type  = isRed ? '🍎' : '🍏';
  const id    = acNextId++;

  const el = document.createElement('div');
  el.className = 'ac-apple';
  el.textContent = type;
  el.style.left = (4 + Math.random() * 82) + '%';
  el.style.animationDuration = fallMs + 'ms';

  const apple = { id, type, el, tapped: false };
  acApples.push(apple);

  el.addEventListener('click', e => { e.stopPropagation(); acTap(id); });
  el.addEventListener('animationend', () => acAppleLanded(id));

  document.getElementById('ac-field').appendChild(el);
}

/* ---- tap ---- */
function acTap(id) {
  if (!acRunning) return;
  const apple = acApples.find(a => a.id === id);
  if (!apple || apple.tapped) return;
  apple.tapped = true;

  if (apple.type === '🍎') {
    acScore++;
    document.getElementById('ac-score').textContent = acScore;

    // floating +1
    const field = document.getElementById('ac-field');
    const fr    = field.getBoundingClientRect();
    const ar    = apple.el.getBoundingClientRect();
    const plus  = document.createElement('div');
    plus.className = 'ac-plus';
    plus.textContent = '+1';
    plus.style.left = (ar.left - fr.left + ar.width / 2) + 'px';
    plus.style.top  = (ar.top  - fr.top) + 'px';
    field.appendChild(plus);
    setTimeout(() => plus.remove(), 600);

    apple.el.remove();
    acApples = acApples.filter(a => a.id !== id);
  } else {
    acGameOver('wrong');
  }
}

/* ---- apple landed ---- */
function acAppleLanded(id) {
  if (!acRunning) return;
  const idx = acApples.findIndex(a => a.id === id);
  if (idx === -1) return;
  const apple = acApples.splice(idx, 1)[0];
  apple.el.remove();

  if (apple.type === '🍎' && !apple.tapped) {
    acLives--;
    acUpdateLives();
    if (acLives <= 0) acGameOver('miss');
  }
}

/* ---- end ---- */
function acTimeUp() {
  if (!acRunning) return;
  acRunning = false;
  clearInterval(acGameTimer);
  clearTimeout(acSpawnTimer);
  acApples.forEach(a => a.el.remove());
  acApples = [];
  acFinish('time');
}

function acGameOver(reason) {
  if (!acRunning) return;
  acRunning = false;
  clearInterval(acGameTimer);
  clearTimeout(acSpawnTimer);
  acApples.forEach(a => a.el.remove());
  acApples = [];
  acFinish(reason);
}

function acFinish(reason) {
  document.getElementById('ac-overlay').style.display = 'flex';

  const prev   = parseInt(localStorage.getItem(AC_BEST_KEY)) || 0;
  const record = acScore > prev;
  if (record) {
    localStorage.setItem(AC_BEST_KEY, acScore);
    acLoadBest();
  }

  const badge = record ? '🏆 新記録!' : `ベスト: ${prev}`;
  const icon  = record ? '🏆' : (reason === 'time' ? '⏰' : reason === 'wrong' ? '🍏' : '😢');
  const title = reason === 'time'  ? '時間切れ！'
              : reason === 'wrong' ? '🍏 をタップした！'
              :                      '🍎 を逃した！';

  const rank = getScoreRank(acScore, AC_RANKS);
  saveScore('apple-catch', 'default', acScore);
  showResult(icon, title, `スコア: ${acScore}\n${badge}`, acStart, rank);
}
