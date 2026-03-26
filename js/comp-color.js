/* ===== COMP COLOR ===== */

var CCOL_RANKS = [
  { min: 40, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 30, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 22, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 16, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 10, label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 5,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const CCOL_BEST_KEY = 'ccol_best_';
let ccolRunning = false;
let ccolScore = 0;
let ccolDiff = 'normal';
let ccolTimer = null;
let ccolTimeLeft = 0;
let ccolAnswering = false;

const CCOL_DIFF = {
  easy:   { time: 60, hueJitter: 18 },
  normal: { time: 45, hueJitter: 10 },
  hard:   { time: 30, hueJitter: 5  }
};

function ccolSetDiff(btn, diff) {
  if (ccolRunning) return;
  document.querySelectorAll('#ccol-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  ccolDiff = diff;
  ccolLoadBest();
}

function ccolLoadBest() {
  const b = localStorage.getItem(CCOL_BEST_KEY + ccolDiff) || '0';
  document.getElementById('ccol-best').textContent = b;
}

function ccolStop() {
  ccolRunning = false;
  if (ccolTimer) { clearInterval(ccolTimer); ccolTimer = null; }
  const btn = document.getElementById('ccol-start-btn');
  if (btn) { btn.style.display = ''; btn.textContent = 'スタート'; }
  const stage = document.getElementById('ccol-stage');
  if (stage) stage.style.display = 'none';
  const msg = document.getElementById('ccol-message');
  if (msg) msg.textContent = 'スタートを押してください';
  const fill = document.getElementById('ccol-timer-fill');
  if (fill) fill.style.width = '100%';
}

function ccolStart() {
  ccolScore = 0;
  ccolRunning = true;
  ccolTimeLeft = CCOL_DIFF[ccolDiff].time;
  document.getElementById('ccol-score').textContent = 0;
  document.getElementById('ccol-start-btn').style.display = 'none';
  document.getElementById('ccol-stage').style.display = 'flex';
  ccolLoadBest();
  ccolNextRound();
  if (ccolTimer) clearInterval(ccolTimer);
  ccolTimer = setInterval(() => {
    ccolTimeLeft -= 0.1;
    const pct = Math.max(0, ccolTimeLeft / CCOL_DIFF[ccolDiff].time) * 100;
    const fill = document.getElementById('ccol-timer-fill');
    fill.style.width = pct + '%';
    fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
    if (ccolTimeLeft <= 0) ccolGameOver();
  }, 100);
}

function ccolNextRound() {
  if (!ccolRunning) return;
  ccolAnswering = true;

  const hue = Math.floor(Math.random() * 360);
  const sat = 60 + Math.floor(Math.random() * 30);
  const lit = 45 + Math.floor(Math.random() * 20);
  const compHue = (hue + 180) % 360;
  const jitter = CCOL_DIFF[ccolDiff].hueJitter;

  // 3 distractors: shift complementary hue by offsets
  const offsets = shuffle([50, 80, 110, 130, -50, -80, -110, -130])
    .slice(0, 3)
    .map(o => {
      // add slight randomness within jitter range
      const j = Math.floor(Math.random() * jitter * 2) - jitter;
      return (compHue + o + j + 360) % 360;
    });

  const choices = shuffle([compHue, ...offsets]);
  const correctIdx = choices.indexOf(compHue);

  document.getElementById('ccol-swatch').style.backgroundColor = `hsl(${hue},${sat}%,${lit}%)`;
  document.getElementById('ccol-message').textContent = 'この色の補色はどれ？';

  const choiceEls = document.querySelectorAll('.ccol-choice');
  choiceEls.forEach((el, i) => {
    el.style.backgroundColor = `hsl(${choices[i]},${sat}%,${lit}%)`;
    el.className = 'ccol-choice';
    el.onclick = () => ccolTap(i === correctIdx, el, choiceEls[correctIdx]);
  });
}

function ccolTap(correct, el, correctEl) {
  if (!ccolRunning || !ccolAnswering) return;
  ccolAnswering = false;
  if (correct) {
    sfx.correct();
    el.classList.add('correct');
    ccolScore++;
    document.getElementById('ccol-score').textContent = ccolScore;
    document.getElementById('ccol-message').textContent = '正解！🎉';
    setTimeout(() => { if (ccolRunning) ccolNextRound(); }, 550);
  } else {
    sfx.wrong();
    el.classList.add('wrong');
    correctEl.classList.add('correct');
    document.getElementById('ccol-message').textContent = '残念… -5秒';
    ccolTimeLeft = Math.max(0, ccolTimeLeft - 5);
    setTimeout(() => { if (ccolRunning) ccolNextRound(); }, 1000);
  }
}

function ccolGameOver() {
  ccolRunning = false;
  if (ccolTimer) { clearInterval(ccolTimer); ccolTimer = null; }
  const btn = document.getElementById('ccol-start-btn');
  if (btn) { btn.style.display = ''; btn.textContent = 'もう一度'; }

  const key = CCOL_BEST_KEY + ccolDiff;
  const best = parseInt(localStorage.getItem(key) || '0');
  const newRecord = ccolScore > best;
  if (newRecord) {
    localStorage.setItem(key, ccolScore);
    document.getElementById('ccol-best').textContent = ccolScore;
    if (typeof refreshBestScores === 'function') refreshBestScores();
  }
  const diffLabel = { easy: 'かんたん', normal: 'ふつう', hard: 'むずかしい' }[ccolDiff];
  const rank = getScoreRank(ccolScore, CCOL_RANKS);
  showResult(
    newRecord ? '🏆' : '🎨',
    'タイムアップ！',
    `スコア: ${ccolScore}\n難易度: ${diffLabel}${newRecord ? '\n🌟自己ベスト更新！' : `\nベスト: ${best}`}`,
    ccolStart,
    rank
  );
}
