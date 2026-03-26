/* ===== 等式判定 (eq-judge) ===== */

var EQT_RANKS = [
  { min: 48, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 38, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 28, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 20, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 13, label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 6,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const EQT_BEST_KEYS = { easy: 'eqt_best_easy', normal: 'eqt_best_normal', hard: 'eqt_best_hard' };
const EQT_TOTAL_TIME = 60;

let eqtRunning = false;
let eqtScore = 0;
let eqtTimeLeft = EQT_TOTAL_TIME;
let eqtTimerInterval = null;
let eqtDiff = 'easy';
let eqtIsCorrect = false;
let eqtAnswered = false;

function eqtLoadBest() {
  const b = localStorage.getItem(EQT_BEST_KEYS[eqtDiff]);
  document.getElementById('eqt-best').textContent = b !== null ? b : '0';
}

function eqtSetDiff(btn, diff) {
  eqtDiff = diff;
  document.querySelectorAll('#eqt-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  eqtLoadBest();
}

function eqtStop() {
  eqtRunning = false;
  clearInterval(eqtTimerInterval);
  eqtTimerInterval = null;
  document.getElementById('eqt-start-btn').style.display = '';
  document.getElementById('eqt-start-btn').textContent = 'スタート';
  document.getElementById('eqt-stage').style.visibility = 'hidden';
  document.getElementById('eqt-btns').style.display = 'none';
  document.getElementById('eqt-timer-fill').style.width = '100%';
  document.getElementById('eqt-time').textContent = EQT_TOTAL_TIME;
}

function eqtGenEasy() {
  const ops = ['+', '-'];
  const op = ops[rand(0, 1)];
  let a = rand(1, 15), b = rand(1, 10);
  if (op === '-' && b > a) [a, b] = [b, a];
  const correct = op === '+' ? a + b : a - b;
  const isTrue = Math.random() < 0.5;
  const offset = (rand(1, 4)) * (Math.random() < 0.5 ? 1 : -1);
  const shown = isTrue ? correct : correct + offset;
  return { expr: `${a} ${op} ${b} = ${shown}`, isTrue };
}

function eqtGenNormal() {
  const ops = ['+', '-', '×'];
  const op = ops[rand(0, 2)];
  let a, b, correct;
  if (op === '×') {
    a = rand(2, 12); b = rand(2, 9);
    correct = a * b;
  } else {
    a = rand(5, 30); b = rand(2, 15);
    if (op === '-' && b > a) [a, b] = [b, a];
    correct = op === '+' ? a + b : a - b;
  }
  const isTrue = Math.random() < 0.5;
  const offset = rand(1, 5) * (Math.random() < 0.5 ? 1 : -1);
  const shown = isTrue ? correct : correct + offset;
  return { expr: `${a} ${op} ${b} = ${shown}`, isTrue };
}

function eqtGenHard() {
  const ops1 = ['+', '-', '×'];
  const op1 = ops1[rand(0, 2)];
  const op2 = Math.random() < 0.5 ? '+' : '-';
  let a = rand(2, 12), b = rand(2, 9), c = rand(1, 9);
  let mid, correct;
  if (op1 === '×') {
    mid = a * b;
  } else {
    if (op1 === '-' && b > a) [a, b] = [b, a];
    mid = op1 === '+' ? a + b : a - b;
  }
  correct = op2 === '+' ? mid + c : mid - c;
  const isTrue = Math.random() < 0.5;
  const offset = rand(1, 7) * (Math.random() < 0.5 ? 1 : -1);
  const shown = isTrue ? correct : correct + offset;
  const displayOp1 = op1 === '×' ? '×' : op1;
  return { expr: `${a} ${displayOp1} ${b} ${op2} ${c} = ${shown}`, isTrue };
}

function eqtStart() {
  eqtScore = 0;
  eqtTimeLeft = EQT_TOTAL_TIME;
  eqtRunning = true;
  eqtAnswered = false;
  document.getElementById('eqt-score').textContent = 0;
  document.getElementById('eqt-start-btn').style.display = 'none';
  document.getElementById('eqt-stage').style.visibility = 'visible';
  document.getElementById('eqt-btns').style.display = 'flex';
  eqtLoadBest();

  clearInterval(eqtTimerInterval);
  eqtTimerInterval = setInterval(() => {
    eqtTimeLeft -= 0.1;
    eqtUpdateTimer();
    document.getElementById('eqt-time').textContent = Math.ceil(eqtTimeLeft);
    if (eqtTimeLeft <= 0) {
      clearInterval(eqtTimerInterval);
      eqtTimerInterval = null;
      eqtTimeUp();
    }
  }, 100);

  eqtNextQuestion();
}

function eqtNextQuestion() {
  if (!eqtRunning) return;
  eqtAnswered = false;
  let q;
  if (eqtDiff === 'easy') q = eqtGenEasy();
  else if (eqtDiff === 'normal') q = eqtGenNormal();
  else q = eqtGenHard();
  eqtIsCorrect = q.isTrue;

  const exprEl = document.getElementById('eqt-expr');
  exprEl.textContent = q.expr;
  exprEl.className = 'eqt-expr';
  void exprEl.offsetWidth;
  exprEl.classList.add('eqt-pop');
}

function eqtTap(answer) {
  if (!eqtRunning || eqtAnswered) return;
  eqtAnswered = true;
  const correct = answer === eqtIsCorrect;
  const exprEl = document.getElementById('eqt-expr');
  exprEl.classList.remove('eqt-pop');

  if (correct) {
    sfx.correct();
    eqtScore++;
    document.getElementById('eqt-score').textContent = eqtScore;
    exprEl.classList.add('eqt-flash-correct');
    setTimeout(() => { if (eqtRunning) eqtNextQuestion(); }, 350);
  } else {
    sfx.wrong();
    exprEl.classList.add('eqt-flash-wrong');
    setTimeout(() => { if (eqtRunning) eqtNextQuestion(); }, 500);
  }
}

function eqtUpdateTimer() {
  const pct = Math.max(0, (eqtTimeLeft / EQT_TOTAL_TIME) * 100);
  const fill = document.getElementById('eqt-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function eqtTimeUp() {
  eqtRunning = false;
  document.getElementById('eqt-start-btn').style.display = '';
  document.getElementById('eqt-start-btn').textContent = 'もう一度';
  document.getElementById('eqt-stage').style.visibility = 'hidden';
  document.getElementById('eqt-btns').style.display = 'none';

  const key = EQT_BEST_KEYS[eqtDiff];
  const prev = parseInt(localStorage.getItem(key)) || 0;
  const record = eqtScore > prev;
  if (record) {
    localStorage.setItem(key, eqtScore);
    document.getElementById('eqt-best').textContent = eqtScore;
  }
  const rank = getScoreRank(eqtScore, EQT_RANKS);
  showResult(
    record ? '🏆' : '⏰',
    '時間切れ！',
    `スコア: ${eqtScore}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    eqtStart,
    rank
  );
}
