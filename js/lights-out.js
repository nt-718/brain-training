// Lights Out (ライトアウト)

var LO_RANKS = [
  { max: 12, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { max: 15, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { max: 20, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { max: 25, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { max: 35, label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { max: 50, label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { max: Infinity, label: 'まだまだ', emoji: '🌱', color: '#64748b' },
];

let loDiff = 'normal';
let loMoves = 0;
let loBest = Infinity;
let loTimer = null;
let loTime = 0;
let loIsPlaying = false;
let loSize = 4;
let loGridData = []; // 1D array

function loSetDiff(btn, diff) {
  if (loIsPlaying) return;
  document.querySelectorAll('#lo-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  loDiff = diff;
  loSize = (diff === 'easy') ? 3 : ((diff === 'normal') ? 4 : 5);
  loLoadBest();
}

function loLoadBest() {
  const k = `lo_best_${loDiff}`;
  const saved = localStorage.getItem(k);
  loBest = saved ? parseInt(saved, 10) : Infinity;
  const bestEl = document.getElementById('lo-best');
  if(bestEl) bestEl.textContent = loBest === Infinity ? '--' : loBest;
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  if(document.getElementById('lo-best')) {
    loLoadBest();
  }
});

function loFormatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function loStart() {
  if (loIsPlaying) return;
  sfx.start();
  
  loMoves = 0;
  loTime = 0;
  loSize = (loDiff === 'easy') ? 3 : ((loDiff === 'normal') ? 4 : 5);
  loGridData = new Array(loSize * loSize).fill(false);
  
  document.getElementById('lo-score').textContent = loMoves;
  document.getElementById('lo-time').textContent = loFormatTime(0);
  document.getElementById('lo-message').style.display = 'none';
  document.getElementById('lo-start-btn').style.display = 'none';
  
  const gridEl = document.getElementById('lo-grid');
  gridEl.className = `lo-grid size-${loSize}`;
  gridEl.style.display = 'grid';
  gridEl.innerHTML = '';
  
  for (let i = 0; i < loSize * loSize; i++) {
    const cell = document.createElement('div');
    cell.className = 'lo-cell';
    cell.dataset.index = i;
    cell.onclick = () => loClick(i);
    gridEl.appendChild(cell);
  }
  
  // Scramble
  const scrambleCount = (loDiff === 'easy') ? 7 : ((loDiff === 'normal') ? 15 : 25);
  for (let i = 0; i < scrambleCount; i++) {
    const r = rand(0, loSize * loSize - 1);
    loToggleInternal(r);
  }
  
  // Verify it's not solved initially
  while (loGridData.every(x => !x) || loGridData.every(x => x)) {
    loToggleInternal(rand(0, loSize * loSize - 1));
  }
  
  loRender();
  loIsPlaying = true;
  
  loTimer = setInterval(() => {
    loTime++;
    document.getElementById('lo-time').textContent = loFormatTime(loTime);
  }, 1000);
}

function loToggleInternal(index) {
  const r = Math.floor(index / loSize);
  const c = index % loSize;
  
  const toggle = (row, col) => {
    if (row >= 0 && row < loSize && col >= 0 && col < loSize) {
      const idx = row * loSize + col;
      loGridData[idx] = !loGridData[idx];
    }
  };
  
  toggle(r, c);       // center
  toggle(r-1, c);     // top
  toggle(r+1, c);     // bottom
  toggle(r, c-1);     // left
  toggle(r, c+1);     // right
}

function loRender() {
  const cells = document.querySelectorAll('.lo-cell');
  cells.forEach((cell, i) => {
    if (loGridData[i]) {
      cell.classList.add('on');
    } else {
      cell.classList.remove('on');
    }
  });
}

function loClick(index) {
  if (!loIsPlaying) return;
  sfx.tap();
  
  loToggleInternal(index);
  loRender();
  
  loMoves++;
  document.getElementById('lo-score').textContent = loMoves;
  
  if (loGridData.every(x => !x) || loGridData.every(x => x)) {
    loGameOver();
  }
}

function loGameOver() {
  clearInterval(loTimer);
  loIsPlaying = false;
  sfx.result();
  
  const k = `lo_best_${loDiff}`;
  if (loMoves < loBest) {
    loBest = loMoves;
    localStorage.setItem(k, loBest.toString());
    const bestEl = document.getElementById('lo-best');
    if(bestEl) bestEl.textContent = loBest;
  }
  
  document.getElementById('lo-message').style.display = 'block';
  document.getElementById('lo-message').textContent = 'クリア！パズル完成！';
  
  document.getElementById('lo-start-btn').style.display = 'inline-block';
  document.getElementById('lo-start-btn').textContent = 'もう一度';
  
  const rank = getScoreRank(loMoves, LO_RANKS);
  saveScore('lights-out', loDiff, loMoves);
  showResult('🧩', 'パズルクリア', `タイム: ${loFormatTime(loTime)}\n手数: ${loMoves}手\n難易度: ${loDiff}`, () => loStart(), rank);
}

function loStop() {
  if (loIsPlaying) {
    clearInterval(loTimer);
    loIsPlaying = false;
    document.getElementById('lo-grid').style.display = 'none';
    document.getElementById('lo-message').style.display = 'block';
    document.getElementById('lo-start-btn').style.display = 'inline-block';
    document.getElementById('lo-start-btn').textContent = 'スタート';
  }
}
