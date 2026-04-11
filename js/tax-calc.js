/* ===== 消費税計算ゲーム (tax-calc) ===== */

var TC_RANKS = [
  { min: 25, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 20, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 16, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 12, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 8,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 4,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

let tcDiff = 'normal';
let tcScore = 0;
let tcBest = 0;
let tcTimer = null;
let tcTimeLeft = 60;
let tcTotalTime = 60;
let tcIsPlaying = false;
let tcCorrectAnswer = 0;

function tcSetDiff(btn, diff) {
  if (tcIsPlaying) return;
  document.querySelectorAll('#tc-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  tcDiff = diff;
  tcLoadBest();
}

function tcLoadBest() {
  const k = `tc_best_${tcDiff}`;
  const saved = localStorage.getItem(k);
  tcBest = saved ? parseInt(saved, 10) : 0;
  const el = document.getElementById('tc-best');
  if (el) el.textContent = tcBest;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('tc-best')) tcLoadBest();
});

function tcGetPricePool() {
  if (tcDiff === 'easy') {
    return [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000, 3000, 5000, 10000];
  }
  if (tcDiff === 'normal') {
    return [150, 250, 350, 450, 550, 650, 750, 850, 950,
            1200, 1500, 1800, 2500, 3500, 4500, 6000, 8000];
  }
  return [130, 160, 180, 230, 270, 380, 460, 480, 580, 680,
          780, 880, 980, 1280, 1480, 1680, 2300, 3800, 4800, 9800];
}

function tcStart() {
  if (tcIsPlaying) return;
  sfx.start();

  tcScore = 0;
  tcTimeLeft = tcTotalTime;

  document.getElementById('tc-score').textContent = 0;
  document.getElementById('tc-message').style.display = 'none';
  document.getElementById('tc-start-btn').style.display = 'none';
  document.getElementById('tc-question-area').style.display = 'flex';
  document.getElementById('tc-answers').style.display = 'grid';

  tcIsPlaying = true;
  tcUpdateTimer();
  tcNextRound();

  tcTimer = setInterval(() => {
    tcTimeLeft -= 1;
    tcUpdateTimer();
    if (tcTimeLeft <= 0) tcGameOver();
  }, 1000);
}

function tcUpdateTimer() {
  const pct = Math.max(0, (tcTimeLeft / tcTotalTime) * 100);
  const fill = document.getElementById('tc-timer-fill');
  if (!fill) return;
  fill.style.width = pct + '%';
  fill.style.background = pct < 20
    ? 'linear-gradient(90deg, #f43f5e, #e11d48)'
    : 'linear-gradient(90deg, var(--secondary), var(--primary))';
}

function tcNextRound() {
  const pool = tcGetPricePool();
  const base = pool[Math.floor(Math.random() * pool.length)];
  const tax = Math.round(base * 0.1);
  tcCorrectAnswer = base + tax;

  const qEl = document.getElementById('tc-question');
  qEl.textContent = `¥${base.toLocaleString()}`;

  tcRenderOptions(base, tcCorrectAnswer);
}

function tcRenderOptions(base, correct) {
  const options = new Set([correct]);
  let tries = 0;
  while (options.size < 4 && tries < 200) {
    tries++;
    const offset = (Math.floor(Math.random() * 8) + 1) * (base >= 1000 ? 100 : base >= 100 ? 10 : 1);
    const sign = Math.random() < 0.5 ? 1 : -1;
    const wrong = correct + sign * offset;
    if (wrong > base && wrong !== correct) options.add(wrong);
  }

  const opts = shuffle(Array.from(options));
  document.querySelectorAll('.tc-answer-btn').forEach((btn, i) => {
    const val = opts[i];
    btn.textContent = `¥${val.toLocaleString()}`;
    btn.dataset.value = val;
    btn.className = 'tc-answer-btn';
    btn.onclick = () => tcAnswer(val);
  });
}

function tcAnswer(selected) {
  if (!tcIsPlaying) return;
  if (selected === tcCorrectAnswer) {
    sfx.correct();
    tcScore++;
    document.getElementById('tc-score').textContent = tcScore;
    setTimeout(tcNextRound, 200);
  } else {
    sfx.wrong();
    tcTimeLeft = Math.max(0, tcTimeLeft - 3);
    tcUpdateTimer();
  }
}

function tcGameOver() {
  clearInterval(tcTimer);
  tcIsPlaying = false;

  document.getElementById('tc-question-area').style.display = 'none';
  document.getElementById('tc-answers').style.display = 'none';
  document.getElementById('tc-message').style.display = 'block';
  document.getElementById('tc-message').textContent = '終了！';
  document.getElementById('tc-start-btn').style.display = 'inline-block';
  document.getElementById('tc-start-btn').textContent = 'もう一度';

  const k = `tc_best_${tcDiff}`;
  const prev = parseInt(localStorage.getItem(k)) || 0;
  const record = tcScore > prev;
  if (record) {
    localStorage.setItem(k, tcScore);
    const el = document.getElementById('tc-best');
    if (el) el.textContent = tcScore;
    tcBest = tcScore;
  }

  const rank = getScoreRank(tcScore, TC_RANKS);
  saveScore('tax-calc', tcDiff, tcScore);
  showResult(
    record ? '🏆' : '🧾',
    'タイムアップ',
    `正解数: ${tcScore}回\n難易度: ${tcDiff}${record ? '\n🏆 新記録!' : '\nベスト: ' + prev}`,
    () => tcStart(),
    rank
  );
  refreshBestScores();
}

function tcStop() {
  if (tcIsPlaying) {
    clearInterval(tcTimer);
    tcIsPlaying = false;
    document.getElementById('tc-question-area').style.display = 'none';
    document.getElementById('tc-answers').style.display = 'none';
    document.getElementById('tc-message').style.display = 'block';
    document.getElementById('tc-message').textContent = 'スタートを押してください';
    document.getElementById('tc-start-btn').style.display = 'inline-block';
    document.getElementById('tc-start-btn').textContent = 'スタート';
  }
}
