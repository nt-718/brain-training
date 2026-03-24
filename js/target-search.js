// Target Search Logic

let tsDiff = 'easy'; // easy, normal, hard
let tsScore = 0;
let tsBest = 0;
let tsTimer = null;
let tsTimeLeft = 30; // 30 seconds game
let tsTotalTime = 30;
let tsIsPlaying = false;

const tsCharPairs = [
  { base: 'O', target: 'C' },
  { base: 'b', target: 'd' },
  { base: 'p', target: 'q' },
  { base: '鳴', target: '嗚' },
  { base: '未', target: '末' },
  { base: '日', target: '曰' },
  { base: '緑', target: '縁' },
  { base: 'ソ', target: 'ン' },
  { base: 'ツ', target: 'シ' },
  { base: '戌', target: '戊' },
  { base: '大', target: '犬' }
];

// Restore best score
const savedTsBest = localStorage.getItem('tsBest');
if (savedTsBest) {
  tsBest = parseInt(savedTsBest, 10);
  document.getElementById('ts-best').textContent = tsBest;
}

function tsSetDiff(btn, diff) {
  if (tsIsPlaying) return;
  document.querySelectorAll('#ts-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  tsDiff = diff;
}

function tsStart() {
  if (tsIsPlaying) return;
  
  tsScore = 0;
  tsTotalTime = tsDiff === 'easy' ? 20 : (tsDiff === 'normal' ? 30 : 40);
  tsTimeLeft = tsTotalTime;
  
  document.getElementById('ts-score').textContent = tsScore;
  document.getElementById('ts-message').style.display = 'none';
  document.getElementById('ts-grid').style.display = 'grid';
  document.getElementById('ts-start-btn').style.display = 'none';
  
  tsIsPlaying = true;
  tsUpdateTimerDisplay();
  
  // Start loop
  tsNextRound();
  
  tsTimer = setInterval(() => {
    tsTimeLeft -= 0.1;
    tsUpdateTimerDisplay();
    
    if (tsTimeLeft <= 0) {
      tsGameOver();
    }
  }, 100);
}

function tsUpdateTimerDisplay() {
  const pct = Math.max(0, (tsTimeLeft / tsTotalTime) * 100);
  document.getElementById('ts-timer-fill').style.width = pct + '%';
  if (pct < 20) {
    document.getElementById('ts-timer-fill').style.background = 'linear-gradient(90deg, #f43f5e, #e11d48)';
  } else {
    document.getElementById('ts-timer-fill').style.background = 'linear-gradient(90deg, var(--secondary), var(--primary))';
  }
}

function tsNextRound() {
  const grid = document.getElementById('ts-grid');
  grid.innerHTML = '';
  grid.className = 'ts-grid ' + 'grid-' + tsDiff;
  
  let rows, cols;
  if (tsDiff === 'easy') { rows = 4; cols = 4; }
  else if (tsDiff === 'normal') { rows = 6; cols = 6; }
  else { rows = 8; cols = 8; }
  
  const totalCells = rows * cols;
  
  // Pick a random pair
  const pair = tsCharPairs[rand(0, tsCharPairs.length - 1)];
  const targetIndex = rand(0, totalCells - 1);
  
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'ts-cell';
    cell.textContent = (i === targetIndex) ? pair.target : pair.base;
    
    // Add varying colors slightly in hard mode to make it more distracting
    if (tsDiff === 'hard') {
      const h = rand(200, 240);
      const s = rand(20, 40);
      const l = rand(70, 90);
      cell.style.color = `hsl(${h}, ${s}%, ${l}%)`;
    }
    
    cell.onclick = () => {
      if (!tsIsPlaying) return;
      if (i === targetIndex) {
        cell.classList.add('clicked-correct');
        tsScore++;
        document.getElementById('ts-score').textContent = tsScore;
        // Proceed next
        setTimeout(() => tsNextRound(), 200);
      } else {
        cell.classList.add('clicked-wrong');
        // Penalty
        tsTimeLeft -= 1.0;
        setTimeout(() => cell.classList.remove('clicked-wrong'), 300);
      }
    };
    grid.appendChild(cell);
  }
}

function tsGameOver() {
  clearInterval(tsTimer);
  tsIsPlaying = false;
  
  if (tsScore > tsBest) {
    tsBest = tsScore;
    localStorage.setItem('tsBest', tsBest.toString());
    document.getElementById('ts-best').textContent = tsBest;
  }
  
  document.getElementById('ts-grid').innerHTML = '';
  document.getElementById('ts-grid').style.display = 'none';
  document.getElementById('ts-message').style.display = 'block';
  document.getElementById('ts-message').textContent = '終了！';
  document.getElementById('ts-start-btn').style.display = 'inline-block';
  document.getElementById('ts-start-btn').textContent = 'もう一度';
  
  showResult('🔍', 'タイムアップ', `見つけた数: ${tsScore}`, () => tsStart());
}

// Ensure game stops when switching screens
const originalNntStop = window.ntStop; // We don't have global router intercept for all, but we can hook if needed.
// Actually main.js has `vcStop(); ntStop();` hardcoded in `showScreen()`. I need to update that or just let it run.
// Wait, to stop timers properly, I will overwrite showScreen in main.js later or just define a global tsStop.
window.tsStop = function() {
  if (tsIsPlaying) {
    clearInterval(tsTimer);
    tsIsPlaying = false;
    document.getElementById('ts-grid').style.display = 'none';
    document.getElementById('ts-message').style.display = 'block';
    document.getElementById('ts-start-btn').style.display = 'inline-block';
    document.getElementById('ts-start-btn').textContent = 'スタート';
  }
};
