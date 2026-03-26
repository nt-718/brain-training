/* ===== JUST STOP GAME ===== */

var JS_RANKS = [
  { min: 46, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 40, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 34, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 26, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 18, label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 10, label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

let jsState = 'idle'; // idle, countdown, running, done
let jsStartTime = 0;
let jsTargetMs  = 0;
let jsScore     = 0;
let jsBest      = parseInt(localStorage.getItem('jsBest')) || 0;
let jsRound     = 0;
const JS_ROUNDS = 5;
let jsInterval  = null;
let jsElapsed   = 0; // ms since start

// Targets in ms (random range per difficulty)
const jsTargets = [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000];

function jsStart() {
  jsScore = 0;
  jsRound = 0;
  document.getElementById('js-score').textContent = 0;
  document.getElementById('js-history').innerHTML = '';
  document.getElementById('js-start-btn').style.display = 'none';
  document.getElementById('js-best').textContent = jsBest;
  jsNextRound();
}

function jsStop() {
  clearInterval(jsInterval);
  jsInterval = null;
  jsState = 'idle';
  document.getElementById('js-start-btn').style.display = 'inline-flex';
  document.getElementById('js-stop-btn').style.display = 'none';
  document.getElementById('js-ring').classList.remove('active');
  document.getElementById('js-clock-number').classList.remove('hidden');
  document.getElementById('js-clock-number').textContent = '⏱️';
  document.getElementById('js-feedback').textContent = '';
  document.getElementById('js-target-time').textContent = '--.-';
}

function jsNextRound() {
  if (jsRound >= JS_ROUNDS) {
    // Game over
    if (jsScore > jsBest) {
      jsBest = jsScore;
      document.getElementById('js-best').textContent = jsBest;
      localStorage.setItem('jsBest', jsBest);
    }
    document.getElementById('js-start-btn').style.display = 'inline-flex';
    document.getElementById('js-start-btn').textContent = 'もう一度';
    const rank = getScoreRank(jsScore, JS_RANKS);
    showResult('⏱️', 'ゲーム終了！', `スコア: ${jsScore} / ${JS_ROUNDS * 10} (ベスト: ${jsBest})`, jsStart, rank);
    return;
  }

  jsRound++;
  // Pick a random target
  jsTargetMs = jsTargets[rand(0, jsTargets.length - 1)] + rand(-200, 200);
  const targetSec = (jsTargetMs / 1000).toFixed(1);
  document.getElementById('js-target-time').textContent = targetSec;
  document.getElementById('js-feedback').textContent = '';
  document.getElementById('js-round').textContent = `${jsRound} / ${JS_ROUNDS}`;

  // Countdown - 3-2-1-Go
  let count = 3;
  document.getElementById('js-clock-number').textContent = count;
  document.getElementById('js-clock-number').classList.remove('hidden');
  jsState = 'countdown';

  jsInterval = setInterval(() => {
    count--;
    if (count > 0) {
      document.getElementById('js-clock-number').textContent = count;
    } else {
      clearInterval(jsInterval);
      jsBegin();
    }
  }, 800);
}

function jsBegin() {
  jsState = 'running';
  jsStartTime = performance.now();
  jsElapsed = 0;

  document.getElementById('js-stop-btn').style.display = 'flex';
  document.getElementById('js-ring').classList.add('active');
  document.getElementById('js-feedback').textContent = '今だ！と思ったら押せ！';

  // Hide number after 1s
  jsInterval = setInterval(() => {
    jsElapsed = performance.now() - jsStartTime;
    const secs = (jsElapsed / 1000).toFixed(1);
    const numEl = document.getElementById('js-clock-number');
    if (jsElapsed >= 1000) {
      numEl.classList.add('hidden');
    } else {
      numEl.textContent = secs;
    }
  }, 50);
}

function jsAction() {
  if (jsState !== 'running') return;
  clearInterval(jsInterval);
  jsInterval = null;
  jsState = 'done';

  const elapsed = performance.now() - jsStartTime;
  const diffMs  = Math.abs(elapsed - jsTargetMs);
  const diffSec = (diffMs / 1000).toFixed(2);

  // Scoring: within 200ms = 10pts, 500ms = 7pts, 1000ms = 4pts, else 1pt
  let pts, grade, label;
  if (diffMs <= 200)       { pts = 10; grade = 'good'; label = '完璧！'; }
  else if (diffMs <= 500)  { pts =  7; grade = 'good'; label = 'すごい！'; }
  else if (diffMs <= 1000) { pts =  4; grade = 'ok';   label = 'いい感じ'; }
  else                     { pts =  1; grade = 'miss';  label = '惜しい...'; }

  jsScore += pts;
  document.getElementById('js-score').textContent = jsScore;

  const feedbackEl = document.getElementById('js-feedback');
  feedbackEl.textContent = `${label}  誤差 ${diffSec}s`;
  feedbackEl.className = 'js-feedback ' + (grade === 'miss' ? 'miss' : 'hit');

  // Show elapsed
  document.getElementById('js-clock-number').textContent = (elapsed/1000).toFixed(1);
  document.getElementById('js-clock-number').classList.remove('hidden');
  document.getElementById('js-ring').classList.remove('active');
  document.getElementById('js-stop-btn').style.display = 'none';

  // Add to history
  const hist = document.getElementById('js-history');
  const item = document.createElement('div');
  item.className = 'js-history-item';
  item.innerHTML = `<span class="target">目標: ${(jsTargetMs/1000).toFixed(1)}s</span><span class="diff ${grade}">誤差 ${diffSec}s</span><span class="pts">+${pts}pt</span>`;
  hist.prepend(item);

  setTimeout(() => {
    if (currentScreen === 'just-stop') jsNextRound();
  }, 1800);
}
