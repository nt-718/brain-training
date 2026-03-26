/* ===== キューブカウント (cube-count) ===== */

var CCNT_RANKS = [
  { min: 10, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 9,  label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 8,  label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 7,  label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 5,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 3,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const CCNT_BEST_KEYS = { easy: 'ccnt_best_easy', normal: 'ccnt_best_normal', hard: 'ccnt_best_hard' };
const CCNT_TOTAL_Q = 10;
const CCNT_CONFIGS = {
  easy:   { cols: 2, rows: 2, maxH: 3 },
  normal: { cols: 3, rows: 3, maxH: 3 },
  hard:   { cols: 3, rows: 3, maxH: 5 },
};

const CC_TW = 30; // top diamond half-width
const CC_TH = 16; // top diamond half-height
const CC_CH = 26; // vertical face height

const CC_COLORS = {
  top: '#c4b5fd',    // Lighter purple for top
  left: '#8b5cf6',   // Medium purple for left
  right: '#6d28d9',  // Dark purple for right
  stroke: 'rgba(0,0,0,0.5)' // Darker stroke for better definition
};

let ccntRunning = false;
let ccntScore = 0;
let ccntQNum = 0;
let ccntAnswer = 0;
let ccntDiff = 'easy';
let ccntInput = '';
let ccntPhase = 'idle';

function ccntLoadBest() {
  const b = localStorage.getItem(CCNT_BEST_KEYS[ccntDiff]);
  document.getElementById('ccnt-best').textContent = b !== null ? b : '0';
}

function ccntSetDiff(btn, diff) {
  ccntDiff = diff;
  document.querySelectorAll('#ccnt-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  ccntLoadBest();
}

function ccntStop() {
  ccntRunning = false;
  ccntPhase = 'idle';
  document.getElementById('ccnt-start-btn').style.display = '';
  document.getElementById('ccnt-start-btn').textContent = 'スタート';
  document.getElementById('ccnt-input').style.display = 'none';
  document.getElementById('ccnt-numpad').style.display = 'none';
  document.getElementById('ccnt-message').textContent = 'スタートを押してください';
  document.getElementById('ccnt-q-num').textContent = `0/${CCNT_TOTAL_Q}`;
  const canvas = document.getElementById('ccnt-canvas');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function ccntStart() {
  ccntScore = 0;
  ccntQNum = 0;
  ccntRunning = true;
  ccntPhase = 'idle';
  document.getElementById('ccnt-score').textContent = 0;
  document.getElementById('ccnt-q-num').textContent = `0/${CCNT_TOTAL_Q}`;
  document.getElementById('ccnt-start-btn').style.display = 'none';
  ccntLoadBest();
  ccntNextQuestion();
}

function ccntNextQuestion() {
  if (!ccntRunning) return;
  if (ccntQNum >= CCNT_TOTAL_Q) { ccntFinish(); return; }

  ccntQNum++;
  ccntInput = '';
  ccntPhase = 'answering';
  document.getElementById('ccnt-q-num').textContent = `${ccntQNum}/${CCNT_TOTAL_Q}`;
  document.getElementById('ccnt-input').style.display = '';
  document.getElementById('ccnt-input').textContent = '?';
  document.getElementById('ccnt-numpad').style.display = 'grid';
  document.getElementById('ccnt-message').textContent = '何個のキューブがありますか？';

  const cfg = CCNT_CONFIGS[ccntDiff];
  const hmap = [];
  let total = 0;
  for (let r = 0; r < cfg.rows; r++) {
    const row = [];
    for (let c = 0; c < cfg.cols; c++) {
      const h = rand(1, cfg.maxH);
      row.push(h);
      total += h;
    }
    hmap.push(row);
  }
  ccntAnswer = total;
  ccntRender(hmap);
}

function ccntRender(hmap) {
  const canvas = document.getElementById('ccnt-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const rows = hmap.length;
  const cols = hmap[0].length;
  const originX = canvas.width / 2;
  const originY = 100;

  // Painter's algorithm: draw diagonals from back (row+col=0) to front (row+col=max)
  for (let d = 0; d < rows + cols - 1; d++) {
    for (let row = Math.max(0, d - cols + 1); row <= Math.min(rows - 1, d); row++) {
      const col = d - row;
      const h = hmap[row][col];
      for (let z = 0; z < h; z++) {
        // Add a small stagger offset to row (+row*4) so they don't align perfectly vertically
        const cx = originX + (col - row) * CC_TW + (row * 4);
        const cy = originY + (col + row) * CC_TH - z * CC_CH;
        ccntDrawBlock(ctx, cx, cy);
      }
    }
  }
}

function ccntDrawBlock(ctx, cx, cy) {
  const tw = CC_TW, th = CC_TH, ch = CC_CH;

  // Top face
  ctx.fillStyle = CC_COLORS.top;
  ctx.strokeStyle = CC_COLORS.stroke;
  ctx.lineWidth = 1.5; // Slightly thicker line
  ctx.beginPath();
  ctx.moveTo(cx, cy - th);
  ctx.lineTo(cx + tw, cy);
  ctx.lineTo(cx, cy + th);
  ctx.lineTo(cx - tw, cy);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Left face
  ctx.fillStyle = CC_COLORS.left;
  ctx.beginPath();
  ctx.moveTo(cx - tw, cy);
  ctx.lineTo(cx, cy + th);
  ctx.lineTo(cx, cy + th + ch);
  ctx.lineTo(cx - tw, cy + ch);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Right face
  ctx.fillStyle = CC_COLORS.right;
  ctx.beginPath();
  ctx.moveTo(cx + tw, cy);
  ctx.lineTo(cx, cy + th);
  ctx.lineTo(cx, cy + th + ch);
  ctx.lineTo(cx + tw, cy + ch);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
}

function ccntNumpad(val) {
  if (!ccntRunning || ccntPhase !== 'answering') return;
  if (val === 'del') {
    ccntInput = ccntInput.slice(0, -1);
    document.getElementById('ccnt-input').textContent = ccntInput || '?';
  } else if (val === 'ok') {
    if (!ccntInput) return;
    const ans = parseInt(ccntInput);
    if (ans === ccntAnswer) {
      sfx.correct();
      ccntScore++;
      document.getElementById('ccnt-score').textContent = ccntScore;
      document.getElementById('ccnt-message').textContent = `⭕ 正解！（${ccntAnswer}個）`;
    } else {
      sfx.wrong();
      document.getElementById('ccnt-message').textContent = `✗ 不正解（正解: ${ccntAnswer}個）`;
    }
    document.getElementById('ccnt-input').style.display = 'none';
    document.getElementById('ccnt-numpad').style.display = 'none';
    ccntPhase = 'idle';
    setTimeout(() => { if (ccntRunning) ccntNextQuestion(); }, 900);
  } else {
    if (ccntInput.length >= 3) return;
    ccntInput += val;
    document.getElementById('ccnt-input').textContent = ccntInput;
  }
}

function ccntFinish() {
  ccntRunning = false;
  document.getElementById('ccnt-start-btn').style.display = '';
  document.getElementById('ccnt-start-btn').textContent = 'もう一度';
  document.getElementById('ccnt-input').style.display = 'none';
  document.getElementById('ccnt-numpad').style.display = 'none';

  const key = CCNT_BEST_KEYS[ccntDiff];
  const prev = parseInt(localStorage.getItem(key)) || 0;
  const record = ccntScore > prev;
  if (record) {
    localStorage.setItem(key, ccntScore);
    document.getElementById('ccnt-best').textContent = ccntScore;
  }
  const rank = getScoreRank(ccntScore, CCNT_RANKS);
  showResult(
    record ? '🏆' : '🧊',
    '結果発表！',
    `正解数: ${ccntScore} / ${CCNT_TOTAL_Q}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    ccntStart,
    rank
  );
}
