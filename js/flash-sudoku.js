/* ===== FLASH SUDOKU ===== */

var FSD_RANKS = [
  { min: 10, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 7,  label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 5,  label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 3,  label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 2,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 1,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const FSD_BEST_KEY = 'fsd_best_';
let fsdRunning = false;
let fsdDiff = 'normal';
let fsdSolution = [];   // 9×9 solved grid
let fsdPuzzle = [];     // 9×9 puzzle (0 = empty)
let fsdUser = [];       // 9×9 user input
let fsdSelected = null; // {r, c} or null

const FSD_CLUES = { easy: 38, normal: 28, hard: 22 };

/* ---- Sudoku generator ---- */
function fsdCanPlace(grid, r, c, n) {
  for (let i = 0; i < 9; i++) {
    if (grid[r][i] === n || grid[i][c] === n) return false;
  }
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let dr = 0; dr < 3; dr++)
    for (let dc = 0; dc < 3; dc++)
      if (grid[br + dr][bc + dc] === n) return false;
  return true;
}

function fsdSolveGrid(grid) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        const nums = shuffle([1,2,3,4,5,6,7,8,9]);
        for (const n of nums) {
          if (fsdCanPlace(grid, r, c, n)) {
            grid[r][c] = n;
            if (fsdSolveGrid(grid)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function fsdGeneratePuzzle(clues) {
  const sol = Array.from({length: 9}, () => Array(9).fill(0));
  fsdSolveGrid(sol);
  const puz = sol.map(r => r.slice());
  const positions = shuffle(Array.from({length: 81}, (_, i) => i));
  let removed = 0;
  for (const pos of positions) {
    if (removed >= 81 - clues) break;
    const r = Math.floor(pos / 9), c = pos % 9;
    puz[r][c] = 0;
    removed++;
  }
  return { sol, puz };
}

/* ---- Lifecycle ---- */
function fsdSetDiff(btn, diff) {
  if (fsdRunning) return;
  document.querySelectorAll('#fsd-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  fsdDiff = diff;
  fsdLoadBest();
}

function fsdLoadBest() {
  const b = localStorage.getItem(FSD_BEST_KEY + fsdDiff) || '-';
  document.getElementById('fsd-best').textContent = b;
}

function fsdStop() {
  fsdRunning = false;
  fsdSelected = null;
  const btn = document.getElementById('fsd-start-btn');
  if (btn) { btn.style.display = ''; btn.textContent = 'スタート'; }
  const stage = document.getElementById('fsd-stage');
  if (stage) stage.style.display = 'none';
  const np = document.getElementById('fsd-numpad');
  if (np) np.style.display = 'none';
  const msg = document.getElementById('fsd-message');
  if (msg) msg.textContent = 'スタートを押してください';
}

function fsdStart() {
  fsdRunning = true;
  fsdSelected = null;
  document.getElementById('fsd-start-btn').style.display = 'none';
  document.getElementById('fsd-stage').style.display = 'flex';
  document.getElementById('fsd-numpad').style.display = 'none';
  fsdLoadBest();

  const { sol, puz } = fsdGeneratePuzzle(FSD_CLUES[fsdDiff]);
  fsdSolution = sol;
  fsdPuzzle = puz;
  fsdUser = puz.map(r => r.slice()); // user starts with given clues

  fsdRenderGrid();
  fsdUpdateStatus();
  document.getElementById('fsd-message').textContent = 'セルをタップして数字を入力！';
}

/* ---- Grid rendering ---- */
function fsdRenderGrid() {
  const grid = document.getElementById('fsd-grid');
  grid.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      let cls = 'fsd-cell';
      if (fsdPuzzle[r][c] !== 0) cls += ' given';
      if (fsdUser[r][c] !== 0 && fsdPuzzle[r][c] === 0) cls += ' user-filled';
      // box borders
      if (c === 2 || c === 5) cls += ' box-r';
      if (r === 2 || r === 5) cls += ' box-b';
      cell.className = cls;
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.onclick = () => fsdSelectCell(r, c);
      grid.appendChild(cell);
    }
  }
  fsdApplyLit();
}

function fsdCellEl(r, c) {
  return document.querySelector(`#fsd-grid .fsd-cell[data-r="${r}"][data-c="${c}"]`);
}

function fsdApplyLit() {
  // Dim all cells
  document.querySelectorAll('#fsd-grid .fsd-cell').forEach(el => {
    el.style.color = 'transparent';
    el.textContent = '';
    el.classList.remove('lit', 'range', 'conflict');
  });
  if (!fsdSelected) return;
  const { r, c } = fsdSelected;

  // Highlight range: same row, column, and 3×3 box — show numbers there too
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  document.querySelectorAll('#fsd-grid .fsd-cell').forEach(el => {
    const er = parseInt(el.dataset.r), ec = parseInt(el.dataset.c);
    if (er === r || ec === c ||
        (er >= br && er < br + 3 && ec >= bc && ec < bc + 3)) {
      el.classList.add('range');
      const v = fsdUser[er][ec];
      if (v) {
        el.textContent = v;
        el.style.color = 'rgba(255,255,255,0.5)';
      }
    }
  });

  // Lit the selected cell on top
  const el = fsdCellEl(r, c);
  if (!el) return;
  el.classList.add('lit');

  const val = fsdUser[r][c];
  el.textContent = val || '';
  if (val) el.style.color = '#fff';

  // Check conflict
  if (val && fsdPuzzle[r][c] === 0 && fsdHasConflict(r, c)) {
    el.classList.add('conflict');
  }
}

function fsdHasConflict(r, c) {
  const v = fsdUser[r][c];
  if (!v) return false;
  for (let i = 0; i < 9; i++) {
    if (i !== c && fsdUser[r][i] === v) return true;
    if (i !== r && fsdUser[i][c] === v) return true;
  }
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let dr = 0; dr < 3; dr++)
    for (let dc = 0; dc < 3; dc++) {
      if (br + dr === r && bc + dc === c) continue;
      if (fsdUser[br + dr][bc + dc] === v) return true;
    }
  return false;
}

function fsdSelectCell(r, c) {
  if (!fsdRunning) return;
  sfx.nav();
  fsdSelected = { r, c };
  fsdApplyLit();
  const isGiven = fsdPuzzle[r][c] !== 0;
  document.getElementById('fsd-numpad').style.display = isGiven ? 'none' : 'grid';
  const msg = isGiven
    ? `(${r+1}, ${c+1}) のヒント: ${fsdPuzzle[r][c]}`
    : `(${r+1}, ${c+1}) に数字を入力！`;
  document.getElementById('fsd-message').textContent = msg;
}

function fsdInputNum(n) {
  if (!fsdRunning || !fsdSelected) return;
  const { r, c } = fsdSelected;
  if (fsdPuzzle[r][c] !== 0) return; // given cell
  fsdUser[r][c] = n;
  fsdApplyLit();
  fsdUpdateStatus();
  if (fsdIsComplete()) fsdFinish();
}

function fsdClearCell() {
  if (!fsdRunning || !fsdSelected) return;
  const { r, c } = fsdSelected;
  if (fsdPuzzle[r][c] !== 0) return;
  fsdUser[r][c] = 0;
  fsdApplyLit();
  fsdUpdateStatus();
}

function fsdUpdateStatus() {
  const filled = fsdUser.flat().filter(v => v !== 0).length;
  const total = 81;
  document.getElementById('fsd-status').textContent = `${filled} / ${total} 埋め済み`;
}

function fsdIsComplete() {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (fsdUser[r][c] !== fsdSolution[r][c]) return false;
  return true;
}

function fsdFinish() {
  fsdRunning = false;
  sfx.result();

  // Show all cells correctly
  document.querySelectorAll('#fsd-grid .fsd-cell').forEach(el => {
    const r = parseInt(el.dataset.r), c = parseInt(el.dataset.c);
    el.textContent = fsdSolution[r][c];
    el.classList.add('done');
    el.style.color = '';
  });

  // Save completion
  const key = FSD_BEST_KEY + fsdDiff;
  const prev = parseInt(localStorage.getItem(key) || '0');
  localStorage.setItem(key, prev + 1);
  document.getElementById('fsd-best').textContent = prev + 1;
  if (typeof refreshBestScores === 'function') refreshBestScores();

  const diffLabel = { easy: 'かんたん', normal: 'ふつう', hard: 'むずかしい' }[fsdDiff];
  setTimeout(() => {
    const rank = getScoreRank(prev + 1, FSD_RANKS);
    showResult('🎉', '完成！', `数独をクリア！\n難易度: ${diffLabel}\n通算クリア: ${prev + 1}回`, fsdStart, rank);
    document.getElementById('fsd-start-btn').style.display = '';
    document.getElementById('fsd-start-btn').textContent = 'もう一度';
  }, 800);
}
