/* ===== N-BACK CHALLENGE ===== */

var NB_RANKS = [
  { min: 30, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 24, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 18, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 12, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 8,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 4,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const NB_BEST_KEY = 'nb_best_';
const NB_SHAPES = ['🍎','🐶','🚘','⚽️','⭐️','🎵','🎈', '🍉', '🚀', '💎'];

let nbRunning = false;
let nbScore = 0;
let nbDiff = 1; // 1, 2, 3 back
let nbHistory = [];
let nbTimerInterval = null;
let nbTimerLeft = 0;
let nbTimeTotal = 4.0;

function nbSetDiff(btn, diff) {
  document.querySelectorAll('#nb-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  nbDiff = parseInt(diff);
  nbLoadBest();
}

function nbLoadBest() {
  const b = localStorage.getItem(NB_BEST_KEY + nbDiff);
  document.getElementById('nb-best').textContent = b ? b : '0';
}

function nbStop() {
  nbRunning = false;
  clearInterval(nbTimerInterval);
  nbTimerInterval = null;
  document.getElementById('nb-start-btn').style.display = '';
  document.getElementById('nb-start-btn').textContent = 'スタート';
  document.getElementById('nb-actions').style.display = 'none';
  document.getElementById('nb-shape').textContent = '';
  document.getElementById('nb-shape').style.fontSize = '';
  document.getElementById('nb-message').textContent = 'スタートを押してください';
  document.getElementById('nb-timer-fill').style.width = '100%';
}

function nbStart() {
  nbScore = 0;
  nbHistory = [];
  nbRunning = true;
  document.getElementById('nb-start-btn').style.display = 'none';
  document.getElementById('nb-actions').style.display = 'grid';
  document.getElementById('nb-score').textContent = nbScore;
  nbLoadBest();
  nbNextShape();
}

function nbNextShape() {
  if (!nbRunning) return;
  clearInterval(nbTimerInterval);
  
  // 35% chance of being identical to the N-th previous shape (if applicable)
  let nextShape = NB_SHAPES[Math.floor(Math.random() * NB_SHAPES.length)];
  if (nbHistory.length >= nbDiff && Math.random() < 0.35) {
    nextShape = nbHistory[nbHistory.length - nbDiff];
  }
  
  nbHistory.push(nextShape);
  
  const el = document.getElementById('nb-shape');
  el.textContent = nextShape;
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');

  const msg = document.getElementById('nb-message');
  
  if (nbHistory.length <= nbDiff) {
    // Memorization phase
    msg.textContent = `覚えるフェーズ (${nbHistory.length}/${nbDiff})`;
    document.getElementById('nb-actions').style.opacity = '0.3';
    document.getElementById('nb-actions').style.pointerEvents = 'none';
    document.getElementById('nb-timer-fill').style.width = '100%';
    setTimeout(() => {
      if (nbRunning) nbNextShape();
    }, 1500);
  } else {
    // Answering phase
    msg.textContent = `${nbDiff}つ前と同じ？`;
    document.getElementById('nb-actions').style.opacity = '1';
    document.getElementById('nb-actions').style.pointerEvents = 'all';
    
    nbTimeTotal = Math.max(1.6, 4.0 - (nbScore * 0.05));
    nbTimerLeft = nbTimeTotal;
    
    nbUpdateTimerBar();
    nbTimerInterval = setInterval(() => {
      nbTimerLeft -= 0.05;
      nbUpdateTimerBar();
      if (nbTimerLeft <= 0) {
        nbGameOver();
      }
    }, 50);
  }
}

function nbUpdateTimerBar() {
  const pct = Math.max(0, (nbTimerLeft / nbTimeTotal) * 100);
  const fill = document.getElementById('nb-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function nbAnswer(isSame) {
  if (!nbRunning || nbHistory.length <= nbDiff) return;
  clearInterval(nbTimerInterval);
  
  const currentShape = nbHistory[nbHistory.length - 1];
  const compareShape = nbHistory[nbHistory.length - 1 - nbDiff];
  const actualSame = (currentShape === compareShape);
  
  if (isSame === actualSame) {
    nbScore++;
    document.getElementById('nb-score').textContent = nbScore;
    nbNextShape(); // next question immediately
  } else {
    nbGameOver();
  }
}

function nbGameOver() {
  nbRunning = false;
  clearInterval(nbTimerInterval);
  document.getElementById('nb-start-btn').style.display = '';
  document.getElementById('nb-start-btn').textContent = 'もう一度';
  document.getElementById('nb-actions').style.display = 'none';
  
  const el = document.getElementById('nb-shape');
  el.textContent = '終了';
  el.style.fontSize = '3rem';
  document.getElementById('nb-message').textContent = 'ゲームオーバー';

  const bestKey = NB_BEST_KEY + nbDiff;
  const best = parseInt(localStorage.getItem(bestKey)) || 0;
  const record = nbScore > best;
  
  if (record) {
    localStorage.setItem(bestKey, nbScore);
    document.getElementById('nb-best').textContent = nbScore;
  }
  
  const msg = record ? '🏆 新記録!' : `ベスト: ${best}`;
  const rank = getScoreRank(nbScore, NB_RANKS);
  showResult(record ? '🏆' : '😢', 'ゲームオーバー', `スコア: ${nbScore}\n${msg}`, nbStart, rank);
}
