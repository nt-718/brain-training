/* ===== 数字並べ (num-order) ===== */

const NOR_BEST_KEYS = { easy: 'nor_best_easy', normal: 'nor_best_normal', hard: 'nor_best_hard' };
const NOR_TOTAL_TIME = 60;
const NOR_CONFIGS = {
  easy:   { count: 6,  min: 1,  max: 30 },
  normal: { count: 9,  min: 1,  max: 60 },
  hard:   { count: 12, min: 1,  max: 99 },
};

let norRunning = false;
let norScore = 0;
let norTimeLeft = NOR_TOTAL_TIME;
let norTimerInterval = null;
let norDiff = 'easy';
let norNums = [];
let norNextIndex = 0;
let norSorted = [];

function norLoadBest() {
  const b = localStorage.getItem(NOR_BEST_KEYS[norDiff]);
  document.getElementById('nor-best').textContent = b !== null ? b : '0';
}

function norSetDiff(btn, diff) {
  norDiff = diff;
  document.querySelectorAll('#nor-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  norLoadBest();
}

function norStop() {
  norRunning = false;
  clearInterval(norTimerInterval);
  norTimerInterval = null;
  document.getElementById('nor-start-btn').style.display = '';
  document.getElementById('nor-start-btn').textContent = 'スタート';
  document.getElementById('nor-stage').style.visibility = 'hidden';
  document.getElementById('nor-timer-fill').style.width = '100%';
  document.getElementById('nor-time').textContent = NOR_TOTAL_TIME;
  document.getElementById('nor-hint').textContent = '小さい順にタップ！';
}

function norStart() {
  norScore = 0;
  norTimeLeft = NOR_TOTAL_TIME;
  norRunning = true;
  document.getElementById('nor-score').textContent = 0;
  document.getElementById('nor-start-btn').style.display = 'none';
  document.getElementById('nor-stage').style.visibility = 'visible';
  norLoadBest();

  clearInterval(norTimerInterval);
  norTimerInterval = setInterval(() => {
    norTimeLeft -= 0.1;
    norUpdateTimer();
    document.getElementById('nor-time').textContent = Math.ceil(norTimeLeft);
    if (norTimeLeft <= 0) {
      clearInterval(norTimerInterval);
      norTimerInterval = null;
      norTimeUp();
    }
  }, 100);

  norNextRound();
}

function norNextRound() {
  if (!norRunning) return;
  const cfg = NOR_CONFIGS[norDiff];

  // Generate unique random numbers
  const pool = new Set();
  while (pool.size < cfg.count) pool.add(rand(cfg.min, cfg.max));
  norNums = shuffle([...pool]);
  norSorted = [...norNums].sort((a, b) => a - b);
  norNextIndex = 0;

  const grid = document.getElementById('nor-grid');
  grid.innerHTML = '';
  norNums.forEach((n, i) => {
    const btn = document.createElement('button');
    btn.className = 'nor-num-btn nor-pop';
    btn.style.animationDelay = (i * 0.04) + 's';
    btn.textContent = n;
    btn.dataset.value = n;
    btn.onclick = () => norTap(btn, n);
    grid.appendChild(btn);
  });

  document.getElementById('nor-hint').textContent = `次にタップ: ${norSorted[0]}`;
}

function norTap(btn, val) {
  if (!norRunning) return;
  if (parseInt(btn.dataset.value) === norSorted[norNextIndex]) {
    sfx.correct();
    btn.classList.add('nor-correct');
    norNextIndex++;
    if (norNextIndex < norSorted.length) {
      document.getElementById('nor-hint').textContent = `次にタップ: ${norSorted[norNextIndex]}`;
    } else {
      // Round complete
      norScore++;
      document.getElementById('nor-score').textContent = norScore;
      document.getElementById('nor-hint').textContent = '✓ クリア！';
      setTimeout(() => { if (norRunning) norNextRound(); }, 500);
    }
  } else {
    sfx.wrong();
    btn.classList.remove('nor-wrong');
    void btn.offsetWidth;
    btn.classList.add('nor-wrong');
  }
}

function norUpdateTimer() {
  const pct = Math.max(0, (norTimeLeft / NOR_TOTAL_TIME) * 100);
  const fill = document.getElementById('nor-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function norTimeUp() {
  norRunning = false;
  document.getElementById('nor-start-btn').style.display = '';
  document.getElementById('nor-start-btn').textContent = 'もう一度';
  document.getElementById('nor-stage').style.visibility = 'hidden';
  document.getElementById('nor-hint').textContent = '小さい順にタップ！';

  const key = NOR_BEST_KEYS[norDiff];
  const prev = parseInt(localStorage.getItem(key)) || 0;
  const record = norScore > prev;
  if (record) {
    localStorage.setItem(key, norScore);
    document.getElementById('nor-best').textContent = norScore;
  }
  showResult(
    record ? '🏆' : '⏰',
    '時間切れ！',
    `スコア: ${norScore}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    norStart
  );
}
