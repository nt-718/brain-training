/* ===== BALANCE SCALE (天秤パズル) ===== */

var BL_RANKS = [
  { min: 22, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 17, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 12, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 9,  label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 6,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 3,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const BL_BEST_KEY = 'blBest';

let blRunning = false;
let blScore = 0;
let blDiff = 'easy';
let blLeftSum = 0;
let blRightSum = 0;
let blAnswerTimer = null;
let blAnswerTimeLeft = 0;
let blAnswerTimeTotal = 0;
let blChipTimer = null;
let blChipQueue = [];
let blPhase = 'idle'; // 'showing' | 'answering' | 'idle'

const BL_DIFF = {
  easy:   { count: [2, 3], maxVal: 9,  chipMs: 800, answerSec: 6 },
  normal: { count: [3, 4], maxVal: 20, chipMs: 650, answerSec: 5 },
  hard:   { count: [4, 5], maxVal: 50, chipMs: 500, answerSec: 4 },
};

function blLoadBest() {
  const b = localStorage.getItem(BL_BEST_KEY);
  document.getElementById('bl-best').textContent = b !== null ? b : '0';
}

function blSetDiff(btn, diff) {
  blDiff = diff;
  document.querySelectorAll('#balance-scale .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function blStop() {
  blRunning = false;
  blPhase = 'idle';
  clearTimeout(blChipTimer);
  clearInterval(blAnswerTimer);
  blChipTimer = null;
  blAnswerTimer = null;
  document.getElementById('bl-start-btn').style.display = '';
  document.getElementById('bl-start-btn').textContent = 'スタート';
  document.getElementById('bl-answer-btns').style.display = 'none';
  document.getElementById('bl-question-label').textContent = 'スタートを押してください';
  document.getElementById('bl-left-chips').innerHTML = '';
  document.getElementById('bl-right-chips').innerHTML = '';
  document.getElementById('bl-left-sum').textContent = '?';
  document.getElementById('bl-right-sum').textContent = '?';
  document.getElementById('bl-timer-fill').style.width = '100%';
  document.getElementById('bl-timer-fill').style.background = 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function blStart() {
  blScore = 0;
  blRunning = true;
  document.getElementById('bl-score').textContent = 0;
  document.getElementById('bl-start-btn').style.display = 'none';
  blLoadBest();
  blNextRound();
}

function blGenRound() {
  const cfg = BL_DIFF[blDiff];
  const [cMin, cMax] = cfg.count;
  const countL = rand(cMin, cMax);
  const countR = rand(cMin, cMax);
  let leftNums, rightNums, leftSum, rightSum;
  // regenerate if tie
  let attempts = 0;
  do {
    leftNums = Array.from({ length: countL }, () => rand(1, cfg.maxVal));
    rightNums = Array.from({ length: countR }, () => rand(1, cfg.maxVal));
    leftSum = leftNums.reduce((a, b) => a + b, 0);
    rightSum = rightNums.reduce((a, b) => a + b, 0);
    attempts++;
  } while (leftSum === rightSum && attempts < 50);
  return { leftNums, rightNums, leftSum, rightSum };
}

function blNextRound() {
  if (!blRunning) return;
  blPhase = 'showing';

  const cfg = BL_DIFF[blDiff];
  const { leftNums, rightNums, leftSum, rightSum } = blGenRound();
  blLeftSum = leftSum;
  blRightSum = rightSum;

  // Clear displays
  document.getElementById('bl-left-chips').innerHTML = '';
  document.getElementById('bl-right-chips').innerHTML = '';
  document.getElementById('bl-left-sum').textContent = '?';
  document.getElementById('bl-right-sum').textContent = '?';
  document.getElementById('bl-answer-btns').style.display = 'none';
  document.getElementById('bl-question-label').textContent = '数字を覚えよう！';
  document.getElementById('bl-timer-fill').style.width = '100%';

  // Build interleaved queue: tag each item with 'L' or 'R'
  const queue = [];
  leftNums.forEach(n => queue.push({ side: 'L', val: n }));
  rightNums.forEach(n => queue.push({ side: 'R', val: n }));
  blChipQueue = shuffle(queue);

  blShowNextChip(cfg.chipMs);
}

function blShowNextChip(chipMs) {
  if (!blRunning) return;
  if (blChipQueue.length === 0) {
    blStartAnswerPhase();
    return;
  }
  const item = blChipQueue.shift();
  const containerId = item.side === 'L' ? 'bl-left-chips' : 'bl-right-chips';
  const container = document.getElementById(containerId);
  const chip = document.createElement('div');
  chip.className = 'bl-chip bl-chip-pop';
  chip.textContent = item.val;
  container.appendChild(chip);

  blChipTimer = setTimeout(() => blShowNextChip(chipMs), chipMs);
}

function blStartAnswerPhase() {
  if (!blRunning) return;
  blPhase = 'answering';
  document.getElementById('bl-question-label').textContent = 'どちらが重い？';
  document.getElementById('bl-answer-btns').style.display = 'flex';
  document.getElementById('bl-left-sum').textContent = '?';
  document.getElementById('bl-right-sum').textContent = '?';

  // Hide chip numbers
  document.querySelectorAll('.bl-chip').forEach(c => { c.textContent = ''; });

  const cfg = BL_DIFF[blDiff];
  blAnswerTimeTotal = cfg.answerSec;
  blAnswerTimeLeft = cfg.answerSec;
  blUpdateAnswerTimer();

  clearInterval(blAnswerTimer);
  blAnswerTimer = setInterval(() => {
    blAnswerTimeLeft -= 0.05;
    blUpdateAnswerTimer();
    if (blAnswerTimeLeft <= 0) {
      clearInterval(blAnswerTimer);
      blAnswerTimer = null;
      blGameOver('timeout');
    }
  }, 50);
}

function blUpdateAnswerTimer() {
  const pct = Math.max(0, (blAnswerTimeLeft / blAnswerTimeTotal) * 100);
  const fill = document.getElementById('bl-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function blAnswer(side) {
  if (!blRunning || blPhase !== 'answering') return;
  clearInterval(blAnswerTimer);
  blAnswerTimer = null;

  const correct = blLeftSum > blRightSum ? 'L' : 'R';
  if (side === correct) {
    blScore++;
    document.getElementById('bl-score').textContent = blScore;
    // Reveal sums briefly
    document.getElementById('bl-left-sum').textContent = blLeftSum;
    document.getElementById('bl-right-sum').textContent = blRightSum;
    blPhase = 'idle';
    setTimeout(() => {
      if (blRunning) blNextRound();
    }, 600);
  } else {
    // Reveal correct answer
    document.getElementById('bl-left-sum').textContent = blLeftSum;
    document.getElementById('bl-right-sum').textContent = blRightSum;
    blGameOver('wrong');
  }
}

function blGameOver(reason) {
  blRunning = false;
  blPhase = 'idle';
  clearTimeout(blChipTimer);
  clearInterval(blAnswerTimer);
  blChipTimer = null;
  blAnswerTimer = null;

  document.getElementById('bl-start-btn').style.display = '';
  document.getElementById('bl-start-btn').textContent = 'もう一度';
  document.getElementById('bl-answer-btns').style.display = 'none';

  const prev = parseInt(localStorage.getItem(BL_BEST_KEY)) || 0;
  const record = blScore > prev;
  if (record) {
    localStorage.setItem(BL_BEST_KEY, blScore);
    document.getElementById('bl-best').textContent = blScore;
  }

  const icon = record ? '🏆' : (reason === 'timeout' ? '⏰' : '⚖️');
  const title = reason === 'timeout' ? '時間切れ！' : 'ミス！';
  const correctSide = blLeftSum > blRightSum ? '左' : '右';
  const detail = reason === 'wrong'
    ? `スコア: ${blScore}\n正解は「${correctSide}が重い」\n左: ${blLeftSum}  右: ${blRightSum}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`
    : `スコア: ${blScore}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`;
  const rank = getScoreRank(blScore, BL_RANKS);
  saveScore('balance-scale', 'default', blScore);
  showResult(icon, title, detail, blStart, rank);
}
