/* ===== NUM TAP GAME ===== */

var NT_RANKS = [
  { max: 15,       label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { max: 20,       label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { max: 26,       label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { max: 33,       label: '上級者',      emoji: '⭐', color: '#10b981' },
  { max: 44,       label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { max: 60,       label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { max: Infinity, label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];
NT_RANKS.unit = '秒';

const NT_BEST_KEY  = 'nt_best_';
const NT_BTN_SIZE  = 52; // px, must match CSS
const NT_MIN_DIST  = 56; // minimum center-to-center distance between buttons

let ntCount         = 10;
let ntNext          = 1;
let ntRound         = 1;
let ntStartTime     = 0;
let ntTimerInterval = null;
let ntRunning       = false;

function ntLoadBest() {
  const b = localStorage.getItem(NT_BEST_KEY + 'random');
  document.getElementById('nt-best').textContent = b ? b + 's' : '--';
}

// --- Game flow ---
function ntStart() {
  ntCount   = Math.floor(Math.random() * 11) + 10; // 10 to 20
  ntNext    = 1;
  ntRunning = true;
  document.getElementById('nt-start-btn').style.display = 'none';
  document.getElementById('nt-next').textContent = '1';
  document.getElementById('nt-round').textContent = ntRound;
  ntLoadBest();
  ntRenderStage();
  ntStartTime = Date.now();
  clearInterval(ntTimerInterval);
  ntTimerInterval = setInterval(() => {
    const elapsed = ((Date.now() - ntStartTime) / 1000).toFixed(1);
    document.getElementById('nt-time').textContent = elapsed + 's';
  }, 100);
}

function ntStop() {
  ntRunning = false;
  clearInterval(ntTimerInterval);
}

// --- Stage rendering ---
function ntRenderStage() {
  const stage = document.getElementById('nt-stage');
  stage.innerHTML = '';

  const W      = stage.clientWidth  || 320;
  const H      = stage.clientHeight || 340;
  const half   = NT_BTN_SIZE / 2;
  const margin = half + 4;

  // Generate non-overlapping random positions
  const positions = [];
  let tries = 0;
  while (positions.length < ntCount && tries < 8000) {
    tries++;
    const x = margin + Math.random() * (W - margin * 2);
    const y = margin + Math.random() * (H - margin * 2);
    if (positions.every(p => Math.hypot(p.x - x, p.y - y) >= NT_MIN_DIST)) {
      positions.push({ x, y });
    }
  }

  // Assign shuffled numbers to positions
  const nums = Array.from({ length: ntCount }, (_, i) => i + 1);
  shuffle(nums);

  nums.forEach((num, i) => {
    const p   = positions[i] ?? { x: margin, y: margin + i * (NT_BTN_SIZE + 4) };
    const btn = document.createElement('button');
    btn.className      = 'tap-btn';
    btn.textContent    = num;
    btn.dataset.num    = num;
    btn.style.left     = (p.x - half) + 'px';
    btn.style.top      = (p.y - half) + 'px';
    btn.addEventListener('click', () => ntTap(btn, num));
    stage.appendChild(btn);
  });
}

// --- Tap logic ---
function ntTap(btn, num) {
  if (!ntRunning) return;

  if (num === ntNext) {
    btn.classList.add('tapped');
    ntNext++;
    document.getElementById('nt-next').textContent = ntNext <= ntCount ? ntNext : '🎉';
    if (ntNext > ntCount) ntComplete();
  } else {
    btn.classList.add('wrong-tap');
    setTimeout(() => btn.classList.remove('wrong-tap'), 350);
  }
}

// --- Completion ---
function ntComplete() {
  clearInterval(ntTimerInterval);
  ntRunning = false;

  const elapsed = ((Date.now() - ntStartTime) / 1000).toFixed(1);
  document.getElementById('nt-time').textContent = elapsed + 's';

  const bestKey  = NT_BEST_KEY + 'random';
  const prev     = parseFloat(localStorage.getItem(bestKey)) || Infinity;
  const isRecord = parseFloat(elapsed) < prev;

  if (isRecord) {
    localStorage.setItem(bestKey, elapsed);
    document.getElementById('nt-best').textContent = elapsed + 's';
  }

  ntRound++;
  document.getElementById('nt-round').textContent = ntRound;
  document.getElementById('nt-start-btn').style.display = '';

  const bestMsg = isRecord ? '🏆 新記録!' : 'ベスト: ' + prev + 's';
  const icon    = isRecord ? '🏆' : parseFloat(elapsed) < 20 ? '🥇' : '🎉';
  const rank = getScoreRank(parseFloat(elapsed), NT_RANKS);
  saveScore('num-tap', 'default', parseFloat(elapsed));
  showResult(icon, 'クリア!', elapsed + '秒　' + bestMsg, ntStart, rank);
}
