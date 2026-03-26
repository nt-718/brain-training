/* ===== COLOR MATCH ===== */

var CM_RANKS = [
  { min: 60, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 50, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 40, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 30, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 20, label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 12, label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const CM_BEST_KEY = 'cm_best';
const CM_COLORS = [
  { id: 'red', name: 'あか', hex: '#f43f5e' },
  { id: 'blue', name: 'あお', hex: '#3b82f6' },
  { id: 'green', name: 'みどり', hex: '#10b981' },
  { id: 'yellow', name: 'きいろ', hex: '#facc15' }
];

let cmRunning = false;
let cmScore = 0;
let cmTargetColorId = '';
let cmTimerLeft = 0;
let cmTimerTotal = 3;
let cmTimerInterval = null;

function cmLoadBest() {
  const b = localStorage.getItem(CM_BEST_KEY);
  document.getElementById('cm-best').textContent = b ? b : '0';
}

function cmStop() {
  cmRunning = false;
  clearInterval(cmTimerInterval);
  cmTimerInterval = null;
  document.getElementById('cm-start-btn').style.display = '';
  document.getElementById('cm-start-btn').textContent = 'スタート';
  document.getElementById('cm-buttons').style.display = 'none';
  document.getElementById('cm-message').style.display = 'block';
  document.getElementById('cm-message').textContent = 'スタートを押してください';
  document.getElementById('cm-word').textContent = '?';
  document.getElementById('cm-word').style.color = '#fff';
  document.getElementById('cm-timer-fill').style.width = '100%';
}

function cmStart() {
  cmScore = 0;
  cmTimerTotal = 3.0;
  cmRunning = true;
  document.getElementById('cm-start-btn').style.display = 'none';
  document.getElementById('cm-buttons').style.display = 'grid';
  document.getElementById('cm-score').textContent = cmScore;
  document.getElementById('cm-message').style.display = 'none';
  cmLoadBest();
  cmNextQuestion();
}

function cmNextQuestion() {
  if (!cmRunning) return;
  const textObj = CM_COLORS[Math.floor(Math.random() * CM_COLORS.length)];
  let colorObj = CM_COLORS[Math.floor(Math.random() * CM_COLORS.length)];
  
  // 70% chance to be different to force Stroop effect
  if (Math.random() < 0.7) {
    let others = CM_COLORS.filter(c => c.id !== textObj.id);
    colorObj = others[Math.floor(Math.random() * others.length)];
  }

  cmTargetColorId = colorObj.id;
  
  const el = document.getElementById('cm-word');
  el.textContent = textObj.name;
  el.style.color = colorObj.hex;
  
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');

  cmTimerTotal = Math.max(0.8, 3.0 - (cmScore * 0.04));
  cmTimerLeft = cmTimerTotal;
  
  clearInterval(cmTimerInterval);
  cmUpdateTimerBar();
  cmTimerInterval = setInterval(() => {
    cmTimerLeft -= 0.05;
    cmUpdateTimerBar();
    if (cmTimerLeft <= 0) {
      cmGameOver();
    }
  }, 50);
}

function cmTap(colorId) {
  if (!cmRunning) return;
  if (colorId === cmTargetColorId) {
    cmScore++;
    document.getElementById('cm-score').textContent = cmScore;
    cmNextQuestion();
  } else {
    cmGameOver();
  }
}

function cmUpdateTimerBar() {
  const pct = Math.max(0, (cmTimerLeft / cmTimerTotal) * 100);
  const fill = document.getElementById('cm-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 25 ? '#f43f5e' : 'linear-gradient(90deg, var(--secondary), var(--primary))';
}

function cmGameOver() {
  cmRunning = false;
  clearInterval(cmTimerInterval);
  document.getElementById('cm-start-btn').style.display = '';
  document.getElementById('cm-start-btn').textContent = 'もう一度';
  document.getElementById('cm-buttons').style.display = 'none';
  document.getElementById('cm-message').style.display = 'block';
  document.getElementById('cm-message').textContent = 'ゲームオーバー';
  const el = document.getElementById('cm-word');
  el.textContent = '終了';
  el.style.color = '#fff';

  const best = parseInt(localStorage.getItem(CM_BEST_KEY)) || 0;
  const record = cmScore > best;
  if (record) {
    localStorage.setItem(CM_BEST_KEY, cmScore);
    document.getElementById('cm-best').textContent = cmScore;
  }
  const msg = record ? '🏆 新記録!' : `ベスト: ${best}`;
  const rank = getScoreRank(cmScore, CM_RANKS);
  showResult(record ? '🏆' : '😢', 'ゲームオーバー', `スコア: ${cmScore}\n${msg}`, cmStart, rank);
}
