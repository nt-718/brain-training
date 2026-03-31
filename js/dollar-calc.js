/* ===== ドル換算 (dollar-calc) ===== */

var DCA_RANKS = [
  { min: 20, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 15, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 12, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 9,  label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 6,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 3,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const DCA_RATE = 150;

let dcaDiff = 'normal';
let dcaScore = 0;
let dcaBest = 0;
let dcaTimer = null;
let dcaTimeLeft = 60;
let dcaTotalTime = 60;
let dcaIsPlaying = false;
let dcaCorrectAnswer = 0;
let dcaIsYenToDollar = false;

function dcaSetDiff(btn, diff) {
  if (dcaIsPlaying) return;
  document.querySelectorAll('#dca-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  dcaDiff = diff;
  dcaLoadBest();
}

function dcaLoadBest() {
  const k = `dca_best_${dcaDiff}`;
  const saved = localStorage.getItem(k);
  dcaBest = saved ? parseInt(saved, 10) : 0;
  const el = document.getElementById('dca-best');
  if (el) el.textContent = dcaBest;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dca-best')) dcaLoadBest();
});

function dcaStart() {
  if (dcaIsPlaying) return;
  sfx.start();

  dcaScore = 0;
  dcaTimeLeft = dcaTotalTime;

  document.getElementById('dca-score').textContent = 0;
  document.getElementById('dca-message').style.display = 'none';
  document.getElementById('dca-start-btn').style.display = 'none';
  document.getElementById('dca-question-area').style.display = 'flex';
  document.getElementById('dca-answers').style.display = 'grid';

  dcaIsPlaying = true;
  dcaUpdateTimer();
  dcaNextRound();

  dcaTimer = setInterval(() => {
    dcaTimeLeft -= 1;
    dcaUpdateTimer();
    if (dcaTimeLeft <= 0) dcaGameOver();
  }, 1000);
}

function dcaUpdateTimer() {
  const pct = Math.max(0, (dcaTimeLeft / dcaTotalTime) * 100);
  const fill = document.getElementById('dca-timer-fill');
  if (!fill) return;
  fill.style.width = pct + '%';
  fill.style.background = pct < 20
    ? 'linear-gradient(90deg, #f43f5e, #e11d48)'
    : 'linear-gradient(90deg, var(--secondary), var(--primary))';
}

function dcaGetDollarPool() {
  if (dcaDiff === 'easy')   return [1, 2, 3, 4, 5, 6, 8, 10];
  if (dcaDiff === 'normal') return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20];
  return [1, 2, 3, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 100];
}

function dcaNextRound() {
  const pool = dcaGetDollarPool();
  const dollarVal = pool[Math.floor(Math.random() * pool.length)];
  dcaIsYenToDollar = Math.random() < 0.5;

  const qEl  = document.getElementById('dca-question');
  const tagEl = document.getElementById('dca-direction-tag');

  if (dcaIsYenToDollar) {
    const yenVal = dollarVal * DCA_RATE;
    dcaCorrectAnswer = dollarVal;
    qEl.innerHTML = `<span class="dca-currency yen">¥${yenVal.toLocaleString()}</span><span class="dca-arrow">→</span><span class="dca-unit">$?</span>`;
    tagEl.textContent = '円 → ドル';
    dcaRenderOptions(dollarVal, false);
  } else {
    const yenAns = dollarVal * DCA_RATE;
    dcaCorrectAnswer = yenAns;
    qEl.innerHTML = `<span class="dca-currency dollar">$${dollarVal}</span><span class="dca-arrow">→</span><span class="dca-unit">¥?</span>`;
    tagEl.textContent = 'ドル → 円';
    dcaRenderOptions(yenAns, true);
  }
}

function dcaRenderOptions(correct, isYen) {
  const options = new Set([correct]);
  let tries = 0;
  while (options.size < 4 && tries < 100) {
    tries++;
    let wrong;
    if (isYen) {
      const sign   = Math.random() < 0.5 ? 1 : -1;
      const steps  = [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)];
      wrong = correct + sign * steps * DCA_RATE;
    } else {
      const sign  = Math.random() < 0.5 ? 1 : -1;
      const delta = Math.floor(Math.random() * 4) + 1;
      wrong = correct + sign * delta;
    }
    if (wrong > 0 && wrong !== correct) options.add(wrong);
  }

  const opts = shuffle(Array.from(options));
  document.querySelectorAll('.dca-answer-btn').forEach((btn, i) => {
    const val = opts[i];
    btn.textContent = dcaIsYenToDollar
      ? `$${val}`
      : `¥${val.toLocaleString()}`;
    btn.dataset.value = val;
    btn.className = 'dca-answer-btn';
    btn.onclick = () => dcaAnswer(val);
  });
}

function dcaAnswer(selected) {
  if (!dcaIsPlaying) return;
  if (selected === dcaCorrectAnswer) {
    sfx.correct();
    dcaScore++;
    document.getElementById('dca-score').textContent = dcaScore;
    setTimeout(dcaNextRound, 200);
  } else {
    sfx.wrong();
    dcaTimeLeft = Math.max(0, dcaTimeLeft - 3);
    dcaUpdateTimer();
  }
}

function dcaGameOver() {
  clearInterval(dcaTimer);
  dcaIsPlaying = false;

  document.getElementById('dca-question-area').style.display = 'none';
  document.getElementById('dca-answers').style.display = 'none';
  document.getElementById('dca-message').style.display = 'block';
  document.getElementById('dca-message').textContent = '終了！';
  document.getElementById('dca-start-btn').style.display = 'inline-block';
  document.getElementById('dca-start-btn').textContent = 'もう一度';

  const k = `dca_best_${dcaDiff}`;
  const prev = parseInt(localStorage.getItem(k)) || 0;
  const record = dcaScore > prev;
  if (record) {
    localStorage.setItem(k, dcaScore);
    const el = document.getElementById('dca-best');
    if (el) el.textContent = dcaScore;
    dcaBest = dcaScore;
  }

  const rank = getScoreRank(dcaScore, DCA_RANKS);
  showResult(
    record ? '🏆' : '💱',
    'タイムアップ',
    `正解数: ${dcaScore}回\n難易度: ${dcaDiff}${record ? '\n🏆 新記録!' : '\nベスト: ' + prev}`,
    () => dcaStart(),
    rank
  );
  refreshBestScores();
}

function dcaStop() {
  if (dcaIsPlaying) {
    clearInterval(dcaTimer);
    dcaIsPlaying = false;
    document.getElementById('dca-question-area').style.display = 'none';
    document.getElementById('dca-answers').style.display = 'none';
    document.getElementById('dca-message').style.display = 'block';
    document.getElementById('dca-message').textContent = 'スタートを押してください';
    document.getElementById('dca-start-btn').style.display = 'inline-block';
    document.getElementById('dca-start-btn').textContent = 'スタート';
  }
}
