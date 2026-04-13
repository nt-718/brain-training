/* ===== MENTAL MULTIPLICATION (掛け算暗算) ===== */

var MMUT_RANKS = [
  { min: 300, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 240, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 180, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 120, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 80,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 40,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,   label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const MMUT_BEST_KEY = 'mmut_best_';
const MMUT_TOTAL_Q = 10;

let mmutRunning = false;
let mmutScore = 0;
let mmutQNum = 0;
let mmutDiff = 'easy';
let mmutAnswer = 0;
let mmutInputVal = '';
let mmutTimerLeft = 0;
let mmutTimerTotal = 0;
let mmutTimerInterval = null;

const MMUT_CONFIG = {
  easy:   { time: 15, label: '2桁 × 1桁' },
  normal: { time: 25, label: '2桁 × 2桁' },
  hard:   { time: 40, label: '3桁 × 2桁' }
};

function mmutSetDiff(btn, diff) {
  if (mmutRunning) return;
  document.querySelectorAll('#mental-mult .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  mmutDiff = diff;
  mmutLoadBest();
}

function mmutLoadBest() {
  const b = localStorage.getItem(MMUT_BEST_KEY + mmutDiff) || 0;
  document.getElementById('mmut-best').textContent = b;
}

function mmutStop() {
  mmutRunning = false;
  if (mmutTimerInterval) clearInterval(mmutTimerInterval);
  document.getElementById('mmut-start-btn').style.display = '';
  document.getElementById('mmut-numpad').style.display = 'none';
  document.getElementById('mmut-question').textContent = 'スタートを押してください';
  document.getElementById('mmut-timer-fill').style.width = '100%';
}

function mmutStart() {
  mmutStop();
  mmutRunning = true;
  mmutScore = 0;
  mmutQNum = 0;
  document.getElementById('mmut-score').textContent = 0;
  document.getElementById('mmut-start-btn').style.display = 'none';
  document.getElementById('mmut-numpad').style.display = 'grid';
  mmutLoadBest();
  mmutNextQuestion();
}

function mmutNextQuestion() {
  if (!mmutRunning) return;
  if (mmutQNum >= MMUT_TOTAL_Q) {
    mmutEnd();
    return;
  }
  mmutQNum++;
  document.getElementById('mmut-q-num').textContent = `${mmutQNum}/${MMUT_TOTAL_Q}`;
  mmutInputVal = '';
  document.getElementById('mmut-input').textContent = '?';
  
  let a, b;
  if (mmutDiff === 'easy') {
    a = rand(10, 99);
    b = rand(2, 9);
  } else if (mmutDiff === 'normal') {
    a = rand(10, 99);
    b = rand(10, 99);
  } else {
    a = rand(100, 999);
    b = rand(10, 99);
  }
  
  mmutAnswer = a * b;
  document.getElementById('mmut-question').innerHTML = `<span class="val-a">${a}</span> <span class="op">×</span> <span class="val-b">${b}</span>`;
  
  mmutTimerTotal = MMUT_CONFIG[mmutDiff].time;
  mmutTimerLeft = mmutTimerTotal;
  mmutStartTimer();
}

function mmutStartTimer() {
  if (mmutTimerInterval) clearInterval(mmutTimerInterval);
  mmutUpdateTimerBar();
  mmutTimerInterval = setInterval(() => {
    mmutTimerLeft -= 0.1;
    mmutUpdateTimerBar();
    if (mmutTimerLeft <= 0) {
      clearInterval(mmutTimerInterval);
      mmutSubmit(true); // Auto-submit/timeout
    }
  }, 100);
}

function mmutUpdateTimerBar() {
  const pct = Math.max(0, (mmutTimerLeft / mmutTimerTotal) * 100);
  const fill = document.getElementById('mmut-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function mmutNumpad(key) {
  if (!mmutRunning) return;
  if (key === 'del') {
    mmutInputVal = mmutInputVal.slice(0, -1);
  } else if (key === 'ok') {
    mmutSubmit();
    return;
  } else {
    if (mmutInputVal.length >= 6) return;
    mmutInputVal += key;
  }
  document.getElementById('mmut-input').textContent = mmutInputVal || '?';
}

function mmutSubmit(isTimeout = false) {
  if (!mmutRunning) return;
  clearInterval(mmutTimerInterval);
  
  const val = parseInt(mmutInputVal, 10);
  const isCorrect = !isTimeout && val === mmutAnswer;
  
  if (isCorrect) {
    // Score based on speed
    mmutScore += 10 + Math.floor(mmutTimerLeft * 2);
    document.getElementById('mmut-score').textContent = mmutScore;
    sfx.correct();
    flashGameContent(true, 'mmut-content');
  } else {
    sfx.wrong();
    flashGameContent(false, 'mmut-content');
  }
  
  // Show answer briefly
  const qEl = document.getElementById('mmut-question');
  if (isCorrect) {
    qEl.innerHTML = `<span style="color:var(--accent)">正解！</span> ${mmutAnswer}`;
  } else {
    qEl.innerHTML = `<span style="color:var(--secondary)">${isTimeout ? '時間切れ' : '不正解'}</span> 正解: ${mmutAnswer}`;
  }
  
  setTimeout(() => {
    if (mmutRunning) mmutNextQuestion();
  }, 1000);
}

function mmutEnd() {
  mmutRunning = false;
  clearInterval(mmutTimerInterval);
  
  const bestKey = MMUT_BEST_KEY + mmutDiff;
  const prev = parseInt(localStorage.getItem(bestKey)) || 0;
  const isNewRecord = mmutScore > prev;
  
  if (isNewRecord) {
    localStorage.setItem(bestKey, mmutScore);
  }
  
  const rank = getScoreRank(mmutScore, MMUT_RANKS);
  saveScore('mental-mult', mmutDiff, mmutScore);
  
  showResult(
    isNewRecord ? '🏆' : '🎮',
    'ゲーム終了！',
    `スコア: ${mmutScore}\n${isNewRecord ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    mmutStart,
    rank
  );
  
  if (typeof refreshBestScores === 'function') refreshBestScores();
}

// Keyboard
document.addEventListener('keydown', e => {
  if (currentScreen !== 'mental-mult') return;
  if (e.key >= '0' && e.key <= '9') mmutNumpad(e.key);
  else if (e.key === 'Backspace') mmutNumpad('del');
  else if (e.key === 'Enter') mmutSubmit();
});
