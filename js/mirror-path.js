// Mirror Path (ミラーパス)

var MP_RANKS = [
  { min: 70, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 55, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 40, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 28, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 18, label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 8,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

let mpDiff = 'easy';
let mpScore = 0;
let mpBest = 0;
let mpTimer = null;
let mpTimeLeft = 0;
let mpTotalTime = 0;
let mpIsPlaying = false;
let mpStartPos = { r: 0, c: 0 };
let mpEndPos = { r: 0, c: 0 };
let mpGridSize = 4;

const mpConfig = {
  easy:   { grid: 4, steps: 3, time: 60, mirror: 'horizontal' },
  normal: { grid: 5, steps: 4, time: 80, mirror: 'vertical' },
  hard:   { grid: 5, steps: 5, time: 100, mirror: 'rotate180' }
};

const mpDirData = {
  '→': { dr: 0, dc: 1 },
  '←': { dr: 0, dc: -1 },
  '↓': { dr: 1, dc: 0 },
  '↑': { dr: -1, dc: 0 }
};
const mpDirKeys = ['→', '←', '↓', '↑'];

const savedMpBest = localStorage.getItem('mpBest');
if (savedMpBest) {
  mpBest = parseInt(savedMpBest, 10);
  const el = document.getElementById('mp-best');
  if (el) el.textContent = mpBest;
}

function mpMirror(arrow, type) {
  if (type === 'horizontal') {
    if (arrow === '←') return '→';
    if (arrow === '→') return '←';
    return arrow;
  } else if (type === 'vertical') {
    if (arrow === '↑') return '↓';
    if (arrow === '↓') return '↑';
    return arrow;
  } else {
    // rotate180
    if (arrow === '←') return '→';
    if (arrow === '→') return '←';
    if (arrow === '↑') return '↓';
    if (arrow === '↓') return '↑';
  }
  return arrow;
}

function mpMirrorLabel(type) {
  if (type === 'horizontal') return '🪞 左右反転';
  if (type === 'vertical') return '🪞 上下反転';
  return '🪞 180°回転';
}

function mpSetDiff(btn, diff) {
  if (mpIsPlaying) return;
  document.querySelectorAll('#mp-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  mpDiff = diff;
}

function mpStart() {
  if (mpIsPlaying) return;
  const conf = mpConfig[mpDiff];
  mpScore = 0;
  mpTotalTime = conf.time;
  mpTimeLeft = conf.time;
  mpGridSize = conf.grid;

  document.getElementById('mp-score').textContent = 0;
  document.getElementById('mp-start-btn').style.display = 'none';

  mpIsPlaying = true;
  mpUpdateTimer();
  mpNextRound();

  mpTimer = setInterval(() => {
    mpTimeLeft -= 0.1;
    mpUpdateTimer();
    if (mpTimeLeft <= 0) mpGameOver();
  }, 100);
}

function mpUpdateTimer() {
  const pct = Math.max(0, (mpTimeLeft / mpTotalTime) * 100);
  const fill = document.getElementById('mp-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 20
    ? 'linear-gradient(90deg, #f43f5e, #e11d48)'
    : 'linear-gradient(90deg, var(--secondary), var(--primary))';
}

function mpNextRound() {
  const conf = mpConfig[mpDiff];
  const g = conf.grid;

  // Generate valid path
  let sr = rand(0, g - 1);
  let sc = rand(0, g - 1);
  let realPath = [];
  let cr = sr, cc = sc;

  for (let i = 0; i < conf.steps; i++) {
    // Pick a valid direction (stay in bounds, no backtrack)
    let candidates = mpDirKeys.filter(d => {
      const nr = cr + mpDirData[d].dr;
      const nc = cc + mpDirData[d].dc;
      return nr >= 0 && nr < g && nc >= 0 && nc < g;
    });
    // Avoid immediate backtrack
    if (realPath.length > 0) {
      const last = realPath[realPath.length - 1];
      const opp = { '→': '←', '←': '→', '↑': '↓', '↓': '↑' };
      candidates = candidates.filter(d => d !== opp[last]);
    }
    if (candidates.length === 0) break;
    const chosen = candidates[rand(0, candidates.length - 1)];
    realPath.push(chosen);
    cr += mpDirData[chosen].dr;
    cc += mpDirData[chosen].dc;
  }

  mpStartPos = { r: sr, c: sc };
  mpEndPos = { r: cr, c: cc };

  // Build mirrored arrows for display
  const mirroredPath = realPath.map(a => mpMirror(a, conf.mirror));

  // Render
  const stage = document.getElementById('mp-stage');
  stage.innerHTML = '';

  // Mirror label
  const label = document.createElement('div');
  label.className = 'mp-mirror-label';
  label.textContent = mpMirrorLabel(conf.mirror);
  stage.appendChild(label);

  // Arrow display
  const arrowRow = document.createElement('div');
  arrowRow.className = 'mp-arrows';
  mirroredPath.forEach(a => {
    const span = document.createElement('span');
    span.className = 'mp-arrow';
    span.textContent = a;
    arrowRow.appendChild(span);
  });
  stage.appendChild(arrowRow);

  // Grid
  const grid = document.createElement('div');
  grid.className = 'mp-grid';
  grid.style.gridTemplateColumns = `repeat(${g}, 1fr)`;

  for (let r = 0; r < g; r++) {
    for (let c = 0; c < g; c++) {
      const cell = document.createElement('div');
      cell.className = 'mp-cell';
      if (r === sr && c === sc) {
        cell.classList.add('mp-start');
        cell.textContent = '●';
      }
      cell.onclick = () => mpTapCell(r, c, cell);
      grid.appendChild(cell);
    }
  }
  stage.appendChild(grid);
}

function mpTapCell(r, c, el) {
  if (!mpIsPlaying) return;
  if (r === mpStartPos.r && c === mpStartPos.c) return;

  if (r === mpEndPos.r && c === mpEndPos.c) {
    // Correct
    mpScore++;
    document.getElementById('mp-score').textContent = mpScore;
    el.classList.add('mp-correct');
    setTimeout(() => { if (mpIsPlaying) mpNextRound(); }, 400);
  } else {
    // Wrong
    el.classList.add('mp-wrong');
    mpTimeLeft -= 3;
    // Show correct cell briefly
    const grid = document.querySelector('.mp-grid');
    const cells = grid.querySelectorAll('.mp-cell');
    const idx = mpEndPos.r * mpGridSize + mpEndPos.c;
    cells[idx].classList.add('mp-correct');
    setTimeout(() => { if (mpIsPlaying) mpNextRound(); }, 800);
  }
}

function mpGameOver() {
  clearInterval(mpTimer);
  mpIsPlaying = false;

  if (mpScore > mpBest) {
    mpBest = mpScore;
    localStorage.setItem('mpBest', mpBest.toString());
    document.getElementById('mp-best').textContent = mpBest;
  }

  document.getElementById('mp-start-btn').style.display = 'inline-block';
  document.getElementById('mp-start-btn').textContent = 'もう一度';

  const rank = getScoreRank(mpScore, MP_RANKS);
  saveScore('mirror-path', 'default', mpScore);
  showResult('🪞', 'タイムアップ', `正解数: ${mpScore}\nベスト: ${mpBest}`, mpStart, rank);
}

function mpStop() {
  if (mpIsPlaying) {
    clearInterval(mpTimer);
    mpIsPlaying = false;
    document.getElementById('mp-stage').innerHTML = '';
    document.getElementById('mp-start-btn').style.display = 'inline-block';
    document.getElementById('mp-start-btn').textContent = 'スタート';
  }
}
