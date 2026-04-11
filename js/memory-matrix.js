/* ===== MEMORY MATRIX GAME ===== */

var MM_RANKS = [
  { min: 20, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 16, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 12, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 9,  label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 6,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 3,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const MM_BEST_KEY = 'mm_best_';

let mmDiff = 'easy';
let mmRound = 1;
let mmGridSize = 3;   // e.g., 3x3
let mmTargetCount = 3; // How many tiles to light up
let mmTargets = [];   // Indices of target tiles
let mmTapped = [];    // Indices that user correctly tapped
let mmRunning = false;
let mmState = 'idle'; // idle | showing | waiting
let mmStageEl, mmMessageEl;

document.addEventListener('DOMContentLoaded', () => {
  mmStageEl = document.getElementById('mm-stage');
  mmMessageEl = document.getElementById('mm-message');
});

// --- Initialization ---
function mmSetDiff(btn, diff) {
  document.querySelectorAll('#mm-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  mmDiff = diff;
  mmRound = 1;
  document.getElementById('mm-round').textContent = mmRound;
  mmLoadBest();
}

function mmLoadBest() {
  const b = localStorage.getItem(MM_BEST_KEY + mmDiff);
  document.getElementById('mm-best').textContent = b ? b : '--';
}

// --- Game flow ---
function mmStart() {
  mmRound = 1;
  mmRunning = true;
  document.getElementById('mm-start-btn').style.display = 'none';
  document.getElementById('mm-confirm-btn').style.display = 'none';
  document.getElementById('mm-round').textContent = mmRound;
  mmLoadBest();
  mmNextRound();
}

function mmStop() {
  mmRunning = false;
  mmState = 'idle';
  document.getElementById('mm-grid').innerHTML = '';
  document.getElementById('mm-start-btn').style.display = '';
  document.getElementById('mm-start-btn').textContent = 'スタート';
  document.getElementById('mm-confirm-btn').style.display = 'none';
  document.getElementById('mm-message').textContent = 'スタートを押してください';
}

function mmNextRound() {
  if (!mmRunning) return;
  
  mmTapped = [];
  mmState = 'showing';
  mmMessageEl.textContent = '記憶して…';
  document.getElementById('mm-round').textContent = mmRound;

  // Determine grid size based on difficulty and round
  if (mmDiff === 'easy') {
    // Easy: Max 5x5
    if (mmRound >= 10) { mmGridSize = 5; mmTargetCount = 5 + Math.floor((mmRound - 10) / 2); }
    else if (mmRound >= 4) { mmGridSize = 4; mmTargetCount = 4 + Math.floor((mmRound - 4) / 2); }
    else { mmGridSize = 3; mmTargetCount = 2 + mmRound; }
    // Cap target count dynamically to not fill too much
    mmTargetCount = Math.min(mmTargetCount, 12);
  } else if (mmDiff === 'normal') {
    // Normal: Max 7x7
    if (mmRound >= 15) { mmGridSize = 7; mmTargetCount = 8 + Math.floor((mmRound - 15) / 2); }
    else if (mmRound >= 9) { mmGridSize = 6; mmTargetCount = 6 + Math.floor((mmRound - 9) / 2); }
    else if (mmRound >= 4) { mmGridSize = 5; mmTargetCount = 4 + Math.floor((mmRound - 4) / 2); }
    else { mmGridSize = 4; mmTargetCount = 3 + mmRound; }
    mmTargetCount = Math.min(mmTargetCount, 20);
  } else {
    // Hard: Max 9x9
    if (mmRound >= 20) { mmGridSize = 9; mmTargetCount = 12 + Math.floor((mmRound - 20) / 2); }
    else if (mmRound >= 14) { mmGridSize = 8; mmTargetCount = 10 + Math.floor((mmRound - 14) / 2); }
    else if (mmRound >= 8) { mmGridSize = 7; mmTargetCount = 8 + Math.floor((mmRound - 8) / 2); }
    else if (mmRound >= 4) { mmGridSize = 6; mmTargetCount = 6 + Math.floor((mmRound - 4) / 2); }
    else { mmGridSize = 5; mmTargetCount = 4 + mmRound; }
    mmTargetCount = Math.min(mmTargetCount, 30);
  }

  // Generate grid UI
  const gridContainer = document.getElementById('mm-grid');
  gridContainer.style.gridTemplateColumns = `repeat(${mmGridSize}, 1fr)`;
  gridContainer.style.gridTemplateRows = `repeat(${mmGridSize}, 1fr)`;
  gridContainer.style.gap = mmGridSize >= 7 ? '4px' : '8px';
  gridContainer.innerHTML = ''; // Clear old

  const totalTiles = mmGridSize * mmGridSize;
  mmTargets = generateTargets(totalTiles, mmTargetCount);

  for (let i = 0; i < totalTiles; i++) {
    const tile = document.createElement('button');
    tile.className = 'mm-tile';
    tile.dataset.index = i;
    tile.disabled = true; // disable clicks during showing
    tile.addEventListener('click', () => mmTap(tile, i));
    gridContainer.appendChild(tile);
  }

  // Highlight targets
  const allTiles = gridContainer.children;
  mmTargets.forEach(idx => {
    allTiles[idx].classList.add('highlight');
  });

  // Hide targets after delay
  // The delay can be slightly shorter as rounds go up, but keep it readable
  const showTime = Math.max(700, 1500 - mmRound * 40); 
  setTimeout(() => {
    if (!mmRunning) return;
    mmTargets.forEach(idx => {
      allTiles[idx].classList.remove('highlight');
    });
    
    // Enable tapping
    for (let i = 0; i < totalTiles; i++) {
      allTiles[i].disabled = false;
    }
    mmState = 'waiting';
    document.getElementById('mm-confirm-btn').style.display = 'inline-block';
    mmMessageEl.textContent = '光ったマスを選択して「確定」！';
  }, showTime);
}

function generateTargets(total, count) {
  const nums = Array.from({ length: total }, (_, i) => i);
  // Shuffle array
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums.slice(0, count);
}

// --- Tap logic ---
function mmTap(btn, index) {
  if (!mmRunning || mmState !== 'waiting') return;

  if (mmTapped.includes(index)) {
    // Unselect
    mmTapped = mmTapped.filter(idx => idx !== index);
    btn.classList.remove('selected-tile');
  } else {
    // Select (limit to target count)
    if (mmTapped.length < mmTargetCount) {
      mmTapped.push(index);
      btn.classList.add('selected-tile');
    }
  }
}

// --- Confirm logic ---
function mmConfirm() {
  if (!mmRunning || mmState !== 'waiting') return;

  const tappedSorted = [...mmTapped].sort((a,b)=>a-b);
  const targetsSorted = [...mmTargets].sort((a,b)=>a-b);
  
  const isMatch = tappedSorted.length === targetsSorted.length && 
                  tappedSorted.every((val, index) => val === targetsSorted[index]);

  const allTiles = document.getElementById('mm-grid').children;
  document.getElementById('mm-confirm-btn').style.display = 'none';

  if (isMatch) {
    mmState = 'idle';
    mmTapped.forEach(idx => {
      allTiles[idx].classList.remove('selected-tile');
      allTiles[idx].classList.add('correct');
    });
    mmMessageEl.textContent = 'クリア！';
    setTimeout(() => {
      mmRound++;
      mmNextRound();
    }, 800);
  } else {
    // Not a match -> Show feedback and game over
    mmState = 'idle';
    mmTapped.forEach(idx => {
      allTiles[idx].classList.remove('selected-tile');
      if (mmTargets.includes(idx)) {
         allTiles[idx].classList.add('correct');
      } else {
         allTiles[idx].classList.add('wrong');
      }
    });
    mmGameOver();
  }
}

// --- Game Over ---
function mmGameOver() {
  mmRunning = false;
  document.getElementById('mm-start-btn').style.display = '';
  document.getElementById('mm-start-btn').textContent = 'もう一度';
  
  const score = mmRound - 1; // You failed on the current round, score is rounds cleared
  const bestKey = MM_BEST_KEY + mmDiff;
  const prevBest = parseInt(localStorage.getItem(bestKey)) || 0;
  const isRecord = score > prevBest;

  if (isRecord) {
    localStorage.setItem(bestKey, score);
    document.getElementById('mm-best').textContent = score;
  }

  document.getElementById('mm-confirm-btn').style.display = 'none';

  // Show the correct tiles that were missed
  const allTiles = document.getElementById('mm-grid').children;
  mmTargets.forEach(idx => {
    if (!mmTapped.includes(idx)) {
      allTiles[idx].classList.add('highlight');
    }
  });

  const bestMsg = isRecord ? '🏆 新記録!' : 'ベスト: ' + prevBest;
  const rank = getScoreRank(score, MM_RANKS);
  saveScore('memory-matrix', mmDiff, score);
  showResult(isRecord ? '🏆' : '😢', 'ゲームオーバー', `スコア: ${score} ラウンド\n${bestMsg}`, mmStart, rank);
}
