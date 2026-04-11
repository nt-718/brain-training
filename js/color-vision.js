/* ========== COLOR VISION ========== */

var CV_RANKS = [
  { min: 40, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 30, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 22, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 16, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 10, label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 5,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

let cvTimer = null;
let cvTimeLeft = 0;
let cvScore = 0;
let cvRound = 1;
let cvTargetIndex = 0;
let cvIsPlaying = false;
let cvDiff = 'normal';

const cvDiffSettings = {
  'easy': { time: 60, maxGrid: 5 },
  'normal': { time: 45, maxGrid: 6 },
  'hard': { time: 30, maxGrid: 8 }
};

function cvSetDiff(btn, diff) {
  if(cvIsPlaying) return;
  document.querySelectorAll('#cv-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  cvDiff = diff;
  
  // Update best display
  const key = 'cv_best_' + cvDiff;
  const best = parseInt(localStorage.getItem(key) || '0');
  document.getElementById('cv-best').textContent = best;
}

function cvStart() {
  cvScore = 0;
  cvRound = 1;
  cvTimeLeft = cvDiffSettings[cvDiff].time;
  cvIsPlaying = true;
  
  document.getElementById('cv-score').textContent = cvScore;
  document.getElementById('cv-start-btn').style.display = 'none';
  document.getElementById('cv-diff-row').style.pointerEvents = 'none';
  document.getElementById('cv-diff-row').style.opacity = '0.5';
  
  document.getElementById('cv-message').textContent = '違う色をタップ！';
  
  cvRenderGrid();
  cvUpdateTimerDisplay();
  
  if(cvTimer) clearInterval(cvTimer);
  cvTimer = setInterval(() => {
    cvTimeLeft -= 0.1;
    if(cvTimeLeft <= 0) {
      cvTimeLeft = 0;
      cvGameOver();
    }
    cvUpdateTimerDisplay();
  }, 100);
}

function cvUpdateTimerDisplay() {
  const pct = Math.max(0, (cvTimeLeft / cvDiffSettings[cvDiff].time)) * 100;
  document.getElementById('cv-timer-fill').style.width = pct + '%';
}

function cvRenderGrid() {
  const grid = document.getElementById('cv-grid');
  grid.innerHTML = '';
  
  let size = 2 + Math.floor(cvScore / 3);
  const maxGrid = cvDiffSettings[cvDiff].maxGrid;
  if(size > maxGrid) size = maxGrid;
  
  grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  
  const totalTiles = size * size;
  cvTargetIndex = Math.floor(Math.random() * totalTiles);
  
  const h = Math.floor(Math.random() * 360);
  const s = 50 + Math.floor(Math.random() * 40); // 50-90%
  const l = 40 + Math.floor(Math.random() * 40); // 40-80%
  
  let diffBase = 30;
  if(cvDiff === 'easy') diffBase = 35;
  if(cvDiff === 'hard') diffBase = 20;
  
  const currentDiff = Math.max(2, diffBase - Math.floor(cvScore / 2));
  
  let offL = l + currentDiff;
  if (offL > 90) offL = l - currentDiff;
  
  const baseColor = `hsl(${h}, ${s}%, ${l}%)`;
  const targetColor = `hsl(${h}, ${s}%, ${offL}%)`;
  
  for(let i=0; i<totalTiles; i++) {
    const tile = document.createElement('div');
    tile.className = 'cv-tile';
    tile.style.backgroundColor = i === cvTargetIndex ? targetColor : baseColor;
    tile.onclick = () => cvTap(i);
    grid.appendChild(tile);
  }
}

function cvTap(index) {
  if(!cvIsPlaying) return;
  if(index === cvTargetIndex) {
    cvScore++;
    document.getElementById('cv-score').textContent = cvScore;
    cvRenderGrid();
  } else {
    cvTimeLeft -= 3;
    const msg = document.getElementById('cv-message');
    msg.textContent = '❌ -3秒';
    msg.style.color = 'var(--secondary)';
    setTimeout(() => {
      if(cvIsPlaying) {
        msg.textContent = '違う色をタップ！';
        msg.style.color = '';
      }
    }, 500);
    cvUpdateTimerDisplay();
  }
}

function cvGameOver() {
  cvStop();
  const key = 'cv_best_' + cvDiff;
  let best = parseInt(localStorage.getItem(key) || '0');
  let isNewBest = false;
  if(cvScore > best) {
    best = cvScore;
    localStorage.setItem(key, best);
    isNewBest = true;
    document.getElementById('cv-best').textContent = best;
    if(typeof refreshBestScores === 'function') refreshBestScores();
  }
  
  const diffLabel = cvDiff === 'easy' ? 'かんたん' : cvDiff === 'hard' ? 'むずかしい' : 'ふつう';
  const rank = getScoreRank(cvScore, CV_RANKS);
  saveScore('color-vision', cvDiff, best);
  showResult(
    '👁️',
    'タイムアップ！',
    `スコア: ${cvScore}\n難易度: ${diffLabel}${isNewBest ? '\n🌟自己ベスト更新！' : ''}`,
    cvStart,
    rank
  );
}

function cvStop() {
  cvIsPlaying = false;
  if(cvTimer) clearInterval(cvTimer);
  const btn = document.getElementById('cv-start-btn');
  if(btn) {
    btn.style.display = 'block';
    btn.textContent = 'もう一度';
  }
  const row = document.getElementById('cv-diff-row');
  if(row) {
    row.style.pointerEvents = 'auto';
    row.style.opacity = '1';
  }
}
