/* ===== NUM TAP GAME ===== */

const NT_RANKS = {
  easy: [
    { max: 4, label: '伝説', emoji: '👑', color: '#f59e0b' },
    { max: 6, label: '達人', emoji: '🏆', color: '#8b5cf6' },
    { max: 8, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
    { max: 11, label: '上級者', emoji: '⭐', color: '#10b981' },
    { max: 15, label: '中級者', emoji: '🌟', color: '#6ee7b7' },
    { max: 20, label: '見習い', emoji: '🔰', color: '#94a3b8' },
    { max: Infinity, label: 'まだまだ', emoji: '🌱', color: '#64748b' }
  ],
  normal: [
    { max: 7, label: '伝説', emoji: '👑', color: '#f59e0b' },
    { max: 10, label: '達人', emoji: '🏆', color: '#8b5cf6' },
    { max: 14, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
    { max: 18, label: '上級者', emoji: '⭐', color: '#10b981' },
    { max: 25, label: '中級者', emoji: '🌟', color: '#6ee7b7' },
    { max: 35, label: '見習い', emoji: '🔰', color: '#94a3b8' },
    { max: Infinity, label: 'まだまだ', emoji: '🌱', color: '#64748b' }
  ],
  hard: [
    { max: 15, label: '伝説', emoji: '👑', color: '#f59e0b' },
    { max: 20, label: '達人', emoji: '🏆', color: '#8b5cf6' },
    { max: 26, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
    { max: 33, label: '上級者', emoji: '⭐', color: '#10b981' },
    { max: 44, label: '中級者', emoji: '🌟', color: '#6ee7b7' },
    { max: 60, label: '見習い', emoji: '🔰', color: '#94a3b8' },
    { max: Infinity, label: 'まだまだ', emoji: '🌱', color: '#64748b' }
  ]
};
Object.keys(NT_RANKS).forEach(k => NT_RANKS[k].unit = '秒');

const NT_CONFIG = {
  easy: { count: 10 },
  normal: { count: 15 },
  hard: { count: 25 }
};

const NT_BEST_KEY  = 'nt_best_';

let ntDiff          = 'normal';
let ntNext          = 1;
let ntRound         = 1;
let ntStartTime     = 0;
let ntTimerInterval = null;
let ntRunning       = false;

function ntSetDiff(btn, diff) {
  if (ntRunning) return;
  document.querySelectorAll('#nt-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  ntDiff = diff;
  ntLoadBest();
}

function ntLoadBest() {
  const b = localStorage.getItem(NT_BEST_KEY + ntDiff);
  document.getElementById('nt-best').textContent = b ? b + 's' : '--';
}

// --- Game flow ---
function ntStart() {
  ntNext    = 1;
  ntRunning = true;
  document.getElementById('nt-start-btn').style.display = 'none';

  const diffRow = document.getElementById('nt-diff-row');
  if (diffRow) {
    diffRow.style.opacity = '0.5';
    diffRow.style.pointerEvents = 'none';
  }

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
  const diffRow = document.getElementById('nt-diff-row');
  if (diffRow) {
    diffRow.style.opacity = '1';
    diffRow.style.pointerEvents = 'auto';
  }
}

// --- Stage rendering ---
function ntRenderStage() {
  const stage = document.getElementById('nt-stage');
  stage.innerHTML = '';

  const count = NT_CONFIG[ntDiff].count;
  const nums = Array.from({ length: count }, (_, i) => i + 1);
  while (nums.length < 25) {
    nums.push(null);
  }
  shuffle(nums);

  nums.forEach(num => {
    if (num === null) {
      const div = document.createElement('div');
      div.className = 'tap-empty';
      stage.appendChild(div);
    } else {
      const btn = document.createElement('button');
      btn.className      = 'tap-btn';
      btn.textContent    = num;
      btn.dataset.num    = num;
      btn.addEventListener('click', () => ntTap(btn, num));
      stage.appendChild(btn);
    }
  });
}

// --- Tap logic ---
function ntTap(btn, num) {
  if (!ntRunning) return;

  if (num === ntNext) {
    btn.classList.add('tapped');
    ntNext++;
    const count = NT_CONFIG[ntDiff].count;
    document.getElementById('nt-next').textContent = ntNext <= count ? ntNext : '🎉';
    if (ntNext > count) ntComplete();
  } else {
    btn.classList.add('wrong-tap');
    setTimeout(() => btn.classList.remove('wrong-tap'), 350);
  }
}

// --- Completion ---
function ntComplete() {
  clearInterval(ntTimerInterval);
  ntRunning = false;

  const diffRow = document.getElementById('nt-diff-row');
  if (diffRow) {
    diffRow.style.opacity = '1';
    diffRow.style.pointerEvents = 'auto';
  }

  const elapsed = ((Date.now() - ntStartTime) / 1000).toFixed(1);
  document.getElementById('nt-time').textContent = elapsed + 's';

  const bestKey  = NT_BEST_KEY + ntDiff;
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
  const rankObj = NT_RANKS[ntDiff];
  const rank = getScoreRank(parseFloat(elapsed), rankObj);
  saveScore('num-tap', ntDiff, parseFloat(elapsed));
  showResult(icon, 'クリア!', elapsed + '秒　' + bestMsg, ntStart, rank);
}
