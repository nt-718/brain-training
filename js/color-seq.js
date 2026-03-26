/* ===== カラーシーケンス (color-seq) ===== */

var CSEQ_RANKS = [
  { min: 20, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 16, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 12, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 9,  label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 6,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 3,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const CSEQ_BEST_KEY = 'cseqBest';
const CSEQ_COLORS = [
  { id: 'red',    bg: '#f43f5e' },
  { id: 'blue',   bg: '#3b82f6' },
  { id: 'yellow', bg: '#facc15' },
  { id: 'green',  bg: '#10b981' },
  { id: 'purple', bg: '#8b5cf6' },
];
const CSEQ_SHOW_MS = { easy: 3000, normal: 2000, hard: 1300 };

let cseqRunning = false;
let cseqLevel = 0;
let cseqSeq = [];
let cseqPos = 0;
let cseqPhase = 'idle'; // 'show' | 'input'
let cseqDiff = 'easy';
let cseqShowTimeout = null;

function cseqLoadBest() {
  const b = localStorage.getItem(CSEQ_BEST_KEY);
  document.getElementById('cseq-best').textContent = b !== null ? b : '0';
}

function cseqSetDiff(btn, diff) {
  cseqDiff = diff;
  document.querySelectorAll('#cseq-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  cseqLoadBest();
}

function cseqStop() {
  cseqRunning = false;
  cseqPhase = 'idle';
  clearTimeout(cseqShowTimeout);
  document.getElementById('cseq-start-btn').style.display = '';
  document.getElementById('cseq-start-btn').textContent = 'スタート';
  document.getElementById('cseq-stage').style.visibility = 'hidden';
  document.getElementById('cseq-message').textContent = '';
}

function cseqStart() {
  cseqLevel = 0;
  cseqRunning = true;
  document.getElementById('cseq-score').textContent = 0;
  document.getElementById('cseq-start-btn').style.display = 'none';
  document.getElementById('cseq-stage').style.visibility = 'visible';
  cseqLoadBest();
  cseqNextRound();
}

function cseqNextRound() {
  if (!cseqRunning) return;
  cseqLevel++;
  document.getElementById('cseq-score').textContent = cseqLevel - 1;

  // Build sequence of length cseqLevel
  cseqSeq = [];
  for (let i = 0; i < cseqLevel + 2; i++) {
    cseqSeq.push(rand(0, CSEQ_COLORS.length - 1));
  }
  cseqPos = 0;
  cseqPhase = 'show';

  cseqRenderTiles(true);
  document.getElementById('cseq-message').textContent = '覚えよう！';
  cseqDisableColorBtns(true);

  clearTimeout(cseqShowTimeout);
  cseqShowTimeout = setTimeout(() => {
    if (!cseqRunning) return;
    cseqPhase = 'input';
    cseqRenderTiles(false);
    document.getElementById('cseq-message').textContent = '左から順に色を選ぼう！';
    cseqDisableColorBtns(false);
    cseqHighlightPos(0);
  }, CSEQ_SHOW_MS[cseqDiff]);
}

function cseqRenderTiles(revealed) {
  const container = document.getElementById('cseq-tiles');
  container.innerHTML = '';
  cseqSeq.forEach((colorIdx, i) => {
    const tile = document.createElement('div');
    tile.className = 'cseq-tile cseq-pop';
    tile.style.animationDelay = (i * 0.05) + 's';
    if (revealed) {
      tile.style.background = CSEQ_COLORS[colorIdx].bg;
      tile.style.borderColor = 'rgba(255,255,255,0.3)';
    } else {
      tile.classList.add('cseq-blank');
    }
    tile.dataset.idx = i;
    container.appendChild(tile);
  });
}

function cseqHighlightPos(pos) {
  document.querySelectorAll('.cseq-tile').forEach((t, i) => {
    t.classList.toggle('cseq-current', i === pos);
  });
}

function cseqDisableColorBtns(disabled) {
  document.querySelectorAll('.cseq-color-btn').forEach(b => b.disabled = disabled);
}

function cseqTap(colorIdx) {
  if (!cseqRunning || cseqPhase !== 'input') return;

  const tiles = document.querySelectorAll('.cseq-tile');
  const tile = tiles[cseqPos];

  if (colorIdx === cseqSeq[cseqPos]) {
    // Correct
    sfx.correct();
    tile.classList.remove('cseq-blank', 'cseq-current');
    tile.style.background = CSEQ_COLORS[colorIdx].bg;
    tile.style.borderColor = 'rgba(255,255,255,0.3)';
    tile.classList.add('cseq-correct');
    cseqPos++;
    if (cseqPos >= cseqSeq.length) {
      // Round clear
      cseqDisableColorBtns(true);
      document.getElementById('cseq-message').textContent = `✓ クリア！ (${cseqSeq.length}色)`;
      setTimeout(() => { if (cseqRunning) cseqNextRound(); }, 800);
    } else {
      cseqHighlightPos(cseqPos);
    }
  } else {
    // Wrong
    sfx.wrong();
    tile.classList.remove('cseq-blank', 'cseq-current');
    tile.style.background = CSEQ_COLORS[colorIdx].bg;
    tile.classList.add('cseq-wrong');
    cseqDisableColorBtns(true);
    cseqPhase = 'idle';

    setTimeout(() => {
      if (!cseqRunning) return;
      cseqGameOver();
    }, 600);
  }
}

function cseqGameOver() {
  cseqRunning = false;
  document.getElementById('cseq-start-btn').style.display = '';
  document.getElementById('cseq-start-btn').textContent = 'もう一度';
  document.getElementById('cseq-stage').style.visibility = 'hidden';

  const score = cseqLevel - 1;
  const prev = parseInt(localStorage.getItem(CSEQ_BEST_KEY)) || 0;
  const record = score > prev;
  if (record) {
    localStorage.setItem(CSEQ_BEST_KEY, score);
    document.getElementById('cseq-best').textContent = score;
  }
  const rank = getScoreRank(score, CSEQ_RANKS);
  showResult(
    record ? '🏆' : '🎨',
    'ゲームオーバー！',
    `${score + 2}色でミス\nスコア: ${score}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    cseqStart,
    rank
  );
}
