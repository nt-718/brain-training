/* ===== VISUAL CALC GAME ===== */

// --- Constants ---
const VC_TOTAL = 10;
const VC_TIMER_SEC = { easy: 16, normal: 12, hard: 9 };

// Dot sizes (px) per unit type
const DOT_SIZE = { ten: 56, five: 32, one: 16 };
// Gap between dots of the same group, and extra gap between groups
const DOT_GAP        = 7;
const DOT_GROUP_GAP  = 14;
// Stage padding
const STAGE_PAD = 12;

// Number ranges per difficulty
const VC_RANGE = {
  easy:   { count: [1, 20],  add: [1, 10],  sub: [3, 20],  mul: null },
  normal: { count: [1, 50],  add: [1, 25],  sub: [5, 50],  mul: [1, 10] },
  hard:   { count: [1, 99],  add: [1, 50],  sub: [10, 99], mul: [1, 20] },
};

// Colors used in operations
const COLOR_BLUE  = '#6c63ff';
const COLOR_GREEN = '#43b89c';
const COLOR_PINK  = '#ff6584';

// --- Rank thresholds (highest first) ---
// Max score: easy≈420 / normal≈340 / hard≈280 (10問 × 最大42/34/28点)
var VC_RANKS = [
  { min: 320, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 250, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 190, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 140, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 90,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 40,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,   label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

// --- State ---
let vcDiff         = 'easy';
let vcScore        = 0;
let vcBest         = parseInt(localStorage.getItem('vcBest')) || 0;
let vcStreak       = 0;
let vcQNum         = 0;
let vcAnswer       = 0;
let vcTimerLeft    = 0;
let vcTimerTotal   = 12;
let vcTimerInterval = null;
let vcInputVal     = '';
let vcRunning      = false;

// --- Difficulty ---
function vcSetDiff(btn, diff) {
  document.querySelectorAll('#vc-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  vcDiff = diff;
}

// --- Game flow ---
function vcStart() {
  vcScore = 0; vcStreak = 0; vcQNum = 0; vcInputVal = '';
  document.getElementById('vc-start-btn').style.display = 'none';
  document.getElementById('vc-score').textContent  = 0;
  document.getElementById('vc-streak').textContent = 0;
  document.getElementById('vc-best').textContent = vcBest;
  vcRunning = true;
  vcNextQuestion();
}

function vcStop() {
  vcRunning = false;
  clearInterval(vcTimerInterval);
}

function vcNextQuestion() {
  if (vcQNum >= VC_TOTAL) { vcEnd(); return; }
  vcQNum++;
  vcInputVal = '';
  document.getElementById('vc-input').textContent  = '?';
  document.getElementById('vc-q-num').textContent  = vcQNum + '/' + VC_TOTAL;

  const range = VC_RANGE[vcDiff];
  const ops   = vcDiff === 'easy'
    ? ['count', 'add', 'sub']
    : ['count', 'add', 'sub', 'mul'];
  const op = ops[Math.floor(Math.random() * ops.length)];

  const stage = document.getElementById('vc-stage');
  stage.innerHTML = '';
  stage.classList.remove('split');

  let questionText = '';

  if (op === 'count') {
    const n    = rand(...range.count);
    vcAnswer   = n;
    renderNumber(stage, n, COLOR_BLUE);
    questionText = '丸はいくつ？';

  } else if (op === 'add') {
    const [lo, hi] = range.add;
    const a  = rand(lo, hi);
    const b  = rand(lo, Math.min(hi, 99 - a));
    vcAnswer = a + b;
    stage.classList.add('split');
    renderNumber(stage, a, COLOR_BLUE,  { x1: 0,    x2: 0.47 });
    renderNumber(stage, b, COLOR_GREEN, { x1: 0.53, x2: 1    });
    questionText = '青 ＋ 緑 ＝ ?';

  } else if (op === 'sub') {
    const [lo, hi] = range.sub;
    const a  = rand(lo, hi);
    const b  = rand(1, a - 1);
    vcAnswer = a - b;
    stage.classList.add('split');
    renderNumber(stage, a, COLOR_BLUE, { x1: 0,    x2: 0.47 });
    renderNumber(stage, b, COLOR_PINK, { x1: 0.53, x2: 1    });
    questionText = '青 － ピンク ＝ ?';

  } else { // mul
    const [lo, hi] = range.mul;
    const a  = rand(lo, hi);
    const b  = rand(2, 9);
    vcAnswer = a * b;
    renderNumber(stage, a, COLOR_BLUE);
    questionText = '丸の数 × ' + b + ' ＝ ?';
  }

  document.getElementById('vc-question').textContent = questionText;
  vcStartTimer();
}

// --- Timer ---
function vcStartTimer() {
  vcTimerTotal = VC_TIMER_SEC[vcDiff];
  vcTimerLeft  = vcTimerTotal;
  clearInterval(vcTimerInterval);
  updateTimerBar();
  vcTimerInterval = setInterval(() => {
    vcTimerLeft -= 0.1;
    updateTimerBar();
    if (vcTimerLeft <= 0) {
      clearInterval(vcTimerInterval);
      vcWrong();
    }
  }, 100);
}

function updateTimerBar() {
  const pct  = Math.max(0, vcTimerLeft / vcTimerTotal * 100);
  const fill = document.getElementById('vc-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30
    ? 'linear-gradient(90deg,#ff6584,#ff9a3c)'
    : 'linear-gradient(90deg,var(--accent),var(--primary))';
}

// --- Input ---
function vcNumpad(key) {
  if (!vcRunning) return;
  if (key === 'del') {
    vcInputVal = vcInputVal.slice(0, -1);
  } else if (key === 'ok') {
    vcSubmit();
    return;
  } else {
    if (vcInputVal.length >= 3) return;
    vcInputVal += key;
  }
  document.getElementById('vc-input').textContent = vcInputVal || '?';
}

function vcSubmit() {
  if (!vcRunning) return;
  const val = parseInt(vcInputVal, 10);
  if (isNaN(val)) return;
  clearInterval(vcTimerInterval);

  if (val === vcAnswer) {
    vcScore  += 10 + Math.floor(vcTimerLeft * 2);
    vcStreak += 1;
    document.getElementById('vc-score').textContent  = vcScore;
    document.getElementById('vc-streak').textContent = vcStreak;
    flashGameContent(true);
    document.getElementById('vc-question').textContent = '✅ 正解！　答えは ' + vcAnswer;
  } else {
    vcStreak = 0;
    document.getElementById('vc-streak').textContent = 0;
    flashGameContent(false);
    document.getElementById('vc-question').textContent = '❌ 不正解…　答えは ' + vcAnswer;
  }
  setTimeout(vcNextQuestion, 950);
}

function vcWrong() {
  if (!vcRunning) return;
  vcStreak = 0;
  document.getElementById('vc-streak').textContent = 0;
  flashGameContent(false);
  document.getElementById('vc-question').textContent = '⏰ 時間切れ！　答えは ' + vcAnswer;
  setTimeout(vcNextQuestion, 950);
}

function vcEnd() {
  vcRunning = false;
  clearInterval(vcTimerInterval);
  if (vcScore > vcBest) {
    vcBest = vcScore;
    document.getElementById('vc-best').textContent = vcBest;
    localStorage.setItem('vcBest', vcBest);
  }
  document.getElementById('vc-start-btn').style.display = '';
  const rank = getScoreRank(vcScore, VC_RANKS);
  saveScore('visual-calc', vcDiff, vcScore);
  showResult('assets/icons/dot-counter.svg', 'ゲーム終了!', `スコア: ${vcScore}点 (ベスト: ${vcBest})`, vcStart, rank);
}

function flashGameContent(correct) {
  const el = document.getElementById('vc-content');
  el.classList.remove('flash-correct', 'flash-wrong');
  void el.offsetWidth; // reflow to restart animation
  el.classList.add(correct ? 'flash-correct' : 'flash-wrong');
}

// --- Circle renderer ---
/**
 * Renders n circles inside `stage` using a 10/5/1 size system.
 * Circles flow left-to-right then wrap, within the given region.
 *
 * @param {HTMLElement} stage
 * @param {number}      n      - the number to represent
 * @param {string}      color  - CSS color
 * @param {{x1,x2}}    region - horizontal fractions (0–1). y always full height.
 */
function renderNumber(stage, n, color, region = { x1: 0, x2: 1 }) {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = (region.x1 * 100) + '%';
  container.style.width = ((region.x2 - region.x1) * 100) + '%';
  container.style.height = '100%';
  container.style.display = 'flex';
  container.style.flexWrap = 'wrap';
  container.style.justifyContent = 'center';
  container.style.alignContent = 'center';
  container.style.alignItems = 'center';
  container.style.gap = DOT_GAP + 'px';
  container.style.padding = STAGE_PAD + 'px';
  container.style.boxSizing = 'border-box';
  stage.appendChild(container);

  const tens  = Math.floor(n / 10);
  const fives = Math.floor((n % 10) / 5);
  const ones  = n % 5;

  const groups = [
    { count: tens,  size: DOT_SIZE.ten  },
    { count: fives, size: DOT_SIZE.five },
    { count: ones,  size: DOT_SIZE.one  },
  ].filter(g => g.count > 0);

  let isFirstGroup = true;

  for (const group of groups) {
    for (let i = 0; i < group.count; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      
      let extraMargin = '';
      if (!isFirstGroup && i === 0) {
        extraMargin = `margin-left: ${DOT_GROUP_GAP}px;`;
      }
      
      dot.style.cssText = [
        `position: relative !important`,
        `width:${group.size}px`,
        `height:${group.size}px`,
        `background:${color}`,
        'opacity:0.85',
        extraMargin
      ].filter(Boolean).join(';');
      container.appendChild(dot);
    }
    isFirstGroup = false;
  }
}

// --- Keyboard support ---
document.addEventListener('keydown', e => {
  if (currentScreen !== 'visual-calc') return;
  if (e.key >= '0' && e.key <= '9') vcNumpad(e.key);
  else if (e.key === 'Backspace')    vcNumpad('del');
  else if (e.key === 'Enter')        vcNumpad('ok');
});
