/* ===== BIG NUMBER ===== */

var BN_RANKS = [
  { min: 30, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 24, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 18, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 13, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 8,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 4,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const BN_BEST_KEY = 'bnBest';
let bnRunning = false;
let bnScore = 0;
let bnTimeLeft = 30;
const bnTimeTotal = 30;
let bnTimerInterval = null;
let bnCorrectIndex = 0;
let bnNumbers = [0, 0];

function bnLoadBest() {
  const b = localStorage.getItem(BN_BEST_KEY);
  document.getElementById('bn-best').textContent = b ? b : '0';
}

function bnStop() {
  bnRunning = false;
  clearInterval(bnTimerInterval);
  bnTimerInterval = null;
  document.getElementById('bn-start-btn').style.display = '';
  document.getElementById('bn-start-btn').textContent = 'スタート';
  document.getElementById('bn-stage').style.visibility = 'hidden';
  document.getElementById('bn-message').textContent = '大きい数をタップ！';
  document.getElementById('bn-message').style.color = '';
  document.getElementById('bn-timer-fill').style.width = '100%';
  document.getElementById('bn-time').textContent = '30';
}

function bnStart() {
  bnScore = 0;
  bnTimeLeft = bnTimeTotal;
  bnRunning = true;
  document.getElementById('bn-start-btn').style.display = 'none';
  document.getElementById('bn-stage').style.visibility = 'visible';
  document.getElementById('bn-score').textContent = 0;
  document.getElementById('bn-message').textContent = '大きい数をタップ！';
  document.getElementById('bn-message').style.color = '';
  bnLoadBest();

  clearInterval(bnTimerInterval);
  bnTimerInterval = setInterval(() => {
    bnTimeLeft -= 0.1;
    bnUpdateTimerBar();
    document.getElementById('bn-time').textContent = Math.ceil(bnTimeLeft);
    if (bnTimeLeft <= 0) {
      bnTimeUp();
    }
  }, 100);

  bnNextQuestion();
}

function bnNextQuestion() {
  if (!bnRunning) return;

  let gap, base;
  if (bnScore < 5) {
    gap = Math.floor(Math.random() * 61) + 20; // 20〜80
    base = Math.floor(Math.random() * (100 - gap)) + 1;
  } else if (bnScore < 15) {
    gap = Math.floor(Math.random() * 16) + 5;  // 5〜20
    base = Math.floor(Math.random() * (200 - gap)) + 1;
  } else {
    gap = Math.floor(Math.random() * 5) + 1;   // 1〜5
    base = Math.floor(Math.random() * (999 - gap)) + 1;
  }

  const small = base;
  const large = base + gap;

  if (Math.random() < 0.5) {
    bnNumbers = [large, small];
    bnCorrectIndex = 0;
  } else {
    bnNumbers = [small, large];
    bnCorrectIndex = 1;
  }

  const leftEl = document.getElementById('bn-left');
  const rightEl = document.getElementById('bn-right');
  leftEl.textContent = bnNumbers[0];
  rightEl.textContent = bnNumbers[1];

  leftEl.classList.remove('bn-pop');
  rightEl.classList.remove('bn-pop');
  void leftEl.offsetWidth;
  leftEl.classList.add('bn-pop');
  rightEl.classList.add('bn-pop');
}

function bnTap(index) {
  if (!bnRunning) return;

  if (index === bnCorrectIndex) {
    bnScore++;
    document.getElementById('bn-score').textContent = bnScore;
    const msg = document.getElementById('bn-message');
    msg.textContent = '正解！';
    msg.style.color = '#10b981';
    setTimeout(() => {
      if (bnRunning) {
        msg.textContent = '大きい数をタップ！';
        msg.style.color = '';
      }
    }, 250);
    bnNextQuestion();
  } else {
    bnGameOver(false);
  }
}

function bnUpdateTimerBar() {
  const pct = Math.max(0, (bnTimeLeft / bnTimeTotal) * 100);
  const fill = document.getElementById('bn-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function bnTimeUp() {
  bnGameOver(true);
}

function bnGameOver(timeUp) {
  bnRunning = false;
  clearInterval(bnTimerInterval);
  document.getElementById('bn-start-btn').style.display = '';
  document.getElementById('bn-start-btn').textContent = 'もう一度';
  document.getElementById('bn-stage').style.visibility = 'hidden';

  const msg = document.getElementById('bn-message');
  msg.textContent = timeUp ? '時間切れ！' : 'ミス！';
  msg.style.color = '';

  const best = parseInt(localStorage.getItem(BN_BEST_KEY)) || 0;
  const record = bnScore > best;
  if (record) {
    localStorage.setItem(BN_BEST_KEY, bnScore);
    document.getElementById('bn-best').textContent = bnScore;
  }

  const badgeMsg = record ? '🏆 新記録!' : `ベスト: ${best}`;
  const detail = timeUp
    ? `スコア: ${bnScore}\n${badgeMsg}`
    : `スコア: ${bnScore}\n答え: ${Math.max(...bnNumbers)}\n${badgeMsg}`;
  const rank = getScoreRank(bnScore, BN_RANKS);
  showResult(
    record ? '🏆' : (timeUp ? '⏰' : '😢'),
    timeUp ? '時間切れ！' : 'ミス！',
    detail,
    bnStart,
    rank
  );
}
