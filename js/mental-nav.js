/* ===== MENTAL NAV (メンタルナビ) ===== */

var MN_RANKS = [
  { min: 10, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 9,  label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 8,  label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 7,  label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 5,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 3,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const MN_BEST_KEY = 'mnBest';

let mnRunning = false;
let mnScore = 0;
let mnDiff = 'easy';
let mnGridSize = 4;
let mnStartRow = 0;
let mnStartCol = 0;
let mnTargetRow = 0;
let mnTargetCol = 0;
let mnTimerInterval = null;
let mnTimeLeft = 0;
const MN_TIME = 10;

const MN_DIFF_CFG = {
  easy:   { size: 4, baseSteps: 3, capSteps: 6 },
  normal: { size: 5, baseSteps: 4, capSteps: 8 },
  hard:   { size: 6, baseSteps: 5, capSteps: 10 },
};

const MN_DIR_MAP = {
  '↑': { dr: -1, dc: 0 },
  '↓': { dr:  1, dc: 0 },
  '←': { dr: 0, dc: -1 },
  '→': { dr: 0, dc:  1 },
};
const MN_DIRS = ['↑', '↓', '←', '→'];

function mnLoadBest() {
  const b = localStorage.getItem(MN_BEST_KEY);
  document.getElementById('mn-best').textContent = b !== null ? b : '0';
}

function mnSetDiff(btn, diff) {
  mnDiff = diff;
  document.querySelectorAll('#mental-nav .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function mnStop() {
  mnRunning = false;
  clearInterval(mnTimerInterval);
  mnTimerInterval = null;
  document.getElementById('mn-start-btn').style.display = '';
  document.getElementById('mn-start-btn').textContent = 'スタート';
  document.getElementById('mn-instructions').textContent = 'スタートを押してください';
  document.getElementById('mn-grid').innerHTML = '';
  document.getElementById('mn-timer-fill').style.width = '100%';
}

function mnStart() {
  mnScore = 0;
  mnRunning = true;
  document.getElementById('mn-score').textContent = 0;
  document.getElementById('mn-start-btn').style.display = 'none';
  mnLoadBest();
  mnNextRound();
}

function mnGenPath(size, numSteps) {
  // Generate valid path from random start
  const maxAttempts = 100;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const startRow = rand(0, size - 1);
    const startCol = rand(0, size - 1);
    let r = startRow, c = startCol;
    const steps = [];
    let success = true;
    for (let s = 0; s < numSteps; s++) {
      // Find valid directions
      const validDirs = MN_DIRS.filter(d => {
        const { dr, dc } = MN_DIR_MAP[d];
        const nr = r + dr, nc = c + dc;
        return nr >= 0 && nr < size && nc >= 0 && nc < size;
      });
      if (validDirs.length === 0) { success = false; break; }
      const dir = validDirs[rand(0, validDirs.length - 1)];
      steps.push(dir);
      const { dr, dc } = MN_DIR_MAP[dir];
      r += dr;
      c += dc;
    }
    if (success) {
      return { startRow, startCol, steps, targetRow: r, targetCol: c };
    }
  }
  return null;
}

function mnNextRound() {
  if (!mnRunning) return;

  const cfg = MN_DIFF_CFG[mnDiff];
  mnGridSize = cfg.size;
  const numSteps = Math.min(cfg.baseSteps + mnScore, cfg.capSteps);

  const pathData = mnGenPath(mnGridSize, numSteps);
  if (!pathData) {
    // Fallback: reduce steps
    const fallback = mnGenPath(mnGridSize, cfg.baseSteps);
    if (!fallback) return;
    Object.assign(pathData || {}, fallback);
  }

  mnStartRow = pathData.startRow;
  mnStartCol = pathData.startCol;
  mnTargetRow = pathData.targetRow;
  mnTargetCol = pathData.targetCol;

  // Show instructions
  document.getElementById('mn-instructions').textContent = pathData.steps.join(' ');

  // Render grid
  mnRenderGrid();

  // Timer
  mnTimeLeft = MN_TIME;
  mnUpdateTimer();
  clearInterval(mnTimerInterval);
  mnTimerInterval = setInterval(() => {
    mnTimeLeft -= 0.05;
    mnUpdateTimer();
    if (mnTimeLeft <= 0) {
      clearInterval(mnTimerInterval);
      mnTimerInterval = null;
      mnGameOver('timeout', -1, -1);
    }
  }, 50);
}

function mnRenderGrid(highlightCorrect, highlightWrong) {
  const grid = document.getElementById('mn-grid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${mnGridSize}, 1fr)`;

  for (let r = 0; r < mnGridSize; r++) {
    for (let c = 0; c < mnGridSize; c++) {
      const cell = document.createElement('div');
      cell.className = 'mn-cell';

      if (r === mnStartRow && c === mnStartCol) {
        cell.classList.add('mn-cell-start');
        cell.textContent = '●';
      }

      if (highlightCorrect !== undefined && r === mnTargetRow && c === mnTargetCol) {
        cell.classList.add('mn-cell-correct');
      }
      if (highlightWrong !== undefined && r === highlightWrong.r && c === highlightWrong.c) {
        cell.classList.add('mn-cell-wrong');
      }

      const row = r, col = c;
      cell.onclick = () => mnTapCell(row, col);
      grid.appendChild(cell);
    }
  }
}

function mnTapCell(r, c) {
  if (!mnRunning) return;
  clearInterval(mnTimerInterval);
  mnTimerInterval = null;

  if (r === mnTargetRow && c === mnTargetCol) {
    // Correct
    mnScore++;
    document.getElementById('mn-score').textContent = mnScore;
    mnRenderGrid(true, undefined);
    setTimeout(() => {
      if (mnRunning) mnNextRound();
    }, 600);
  } else {
    // Wrong - show both
    mnRenderGrid(true, { r, c });
    mnGameOver('wrong', r, c);
  }
}

function mnUpdateTimer() {
  const pct = Math.max(0, (mnTimeLeft / MN_TIME) * 100);
  const fill = document.getElementById('mn-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function mnGameOver(reason, wrongR, wrongC) {
  mnRunning = false;
  clearInterval(mnTimerInterval);
  mnTimerInterval = null;
  document.getElementById('mn-start-btn').style.display = '';
  document.getElementById('mn-start-btn').textContent = 'もう一度';

  const prev = parseInt(localStorage.getItem(MN_BEST_KEY)) || 0;
  const record = mnScore > prev;
  if (record) {
    localStorage.setItem(MN_BEST_KEY, mnScore);
    document.getElementById('mn-best').textContent = mnScore;
  }

  const icon = record ? '🏆' : (reason === 'timeout' ? '⏰' : '🗺️');
  const title = reason === 'timeout' ? '時間切れ！' : 'ミス！';
  const detail = `スコア: ${mnScore}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`;

  const rank = getScoreRank(mnScore, MN_RANKS);
  setTimeout(() => {
  saveScore('mental-nav', 'default', mnScore);
    showResult(icon, title, detail, mnStart, rank);
  }, reason === 'wrong' ? 800 : 0);
}
