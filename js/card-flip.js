/* ===== カードフリップ (card-flip) ===== */

var CFLIP_RANKS = [
  { max: 10,       label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { max: 13,       label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { max: 16,       label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { max: 20,       label: '上級者',      emoji: '⭐', color: '#10b981' },
  { max: 25,       label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { max: 30,       label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { max: Infinity, label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];
CFLIP_RANKS.unit = '手';

const CFLIP_BEST_KEYS = { easy: 'cflip_best_easy', normal: 'cflip_best_normal', hard: 'cflip_best_hard' };
const CFLIP_EMOJIS = ['🍎','🍊','🍋','🍇','🍓','🍒','🍑','🍌','🥝','🍍','🥥','🍈','🥭','🍐','🫐','🍅'];
const CFLIP_CONFIGS = {
  easy:   { cols: 4, pairs: 6  }, // 4×3 = 12
  normal: { cols: 4, pairs: 8  }, // 4×4 = 16
  hard:   { cols: 5, pairs: 10 }, // 5×4 = 20
};

let cflipRunning = false;
let cflipMoves = 0;
let cflipDiff = 'easy';
let cflipFlipped = []; // indices of currently flipped (unmatched) cards
let cflipMatched = 0;
let cflipTotal = 0;
let cflipLocked = false;
let cflipCards = [];

function cflipLoadBest() {
  const b = localStorage.getItem(CFLIP_BEST_KEYS[cflipDiff]);
  document.getElementById('cflip-best').textContent = b !== null ? b + '手' : '-';
}

function cflipSetDiff(btn, diff) {
  cflipDiff = diff;
  document.querySelectorAll('#cflip-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  cflipLoadBest();
}

function cflipStop() {
  cflipRunning = false;
  cflipLocked = false;
  cflipFlipped = [];
  document.getElementById('cflip-start-btn').style.display = '';
  document.getElementById('cflip-start-btn').textContent = 'スタート';
  document.getElementById('cflip-stage').style.visibility = 'hidden';
  document.getElementById('cflip-info').textContent = 'カードをめくってペアを揃えよう';
}

function cflipStart() {
  cflipMoves = 0;
  cflipMatched = 0;
  cflipFlipped = [];
  cflipLocked = false;
  cflipRunning = true;

  document.getElementById('cflip-moves').textContent = 0;
  document.getElementById('cflip-start-btn').style.display = 'none';
  document.getElementById('cflip-stage').style.visibility = 'visible';
  cflipLoadBest();
  cflipBuild();
}

function cflipBuild() {
  const cfg = CFLIP_CONFIGS[cflipDiff];
  const emojis = shuffle([...CFLIP_EMOJIS]).slice(0, cfg.pairs);
  cflipCards = shuffle([...emojis, ...emojis]);
  cflipTotal = cfg.pairs;

  const grid = document.getElementById('cflip-grid');
  grid.className = `cflip-grid cflip-grid-${cfg.cols}`;
  grid.innerHTML = '';

  cflipCards.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'cflip-card';
    card.dataset.idx = i;
    card.dataset.emoji = emoji;
    card.innerHTML = `
      <div class="cflip-inner">
        <div class="cflip-face cflip-back">✦</div>
        <div class="cflip-face cflip-front">${emoji}</div>
      </div>`;
    card.onclick = () => cflipTap(card, i);
    grid.appendChild(card);
  });

  cflipUpdateInfo();
}

function cflipTap(card, idx) {
  if (!cflipRunning || cflipLocked) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  cflipFlipped.push({ card, idx, emoji: cflipCards[idx] });

  if (cflipFlipped.length === 2) {
    cflipMoves++;
    document.getElementById('cflip-moves').textContent = cflipMoves;
    cflipLocked = true;

    const [a, b] = cflipFlipped;
    if (a.emoji === b.emoji) {
      // Match
      sfx.correct();
      setTimeout(() => {
        a.card.classList.add('matched');
        b.card.classList.add('matched');
        cflipFlipped = [];
        cflipLocked = false;
        cflipMatched++;
        cflipUpdateInfo();
        if (cflipMatched >= cflipTotal) {
          setTimeout(cflipComplete, 300);
        }
      }, 500);
    } else {
      // No match
      sfx.wrong();
      a.card.classList.add('shake');
      b.card.classList.add('shake');
      setTimeout(() => {
        a.card.classList.remove('flipped', 'shake');
        b.card.classList.remove('flipped', 'shake');
        cflipFlipped = [];
        cflipLocked = false;
      }, 900);
    }
  }
}

function cflipUpdateInfo() {
  const remaining = cflipTotal - cflipMatched;
  document.getElementById('cflip-info').textContent =
    remaining > 0 ? `残り ${remaining} ペア` : '全ペア完成！';
}

function cflipComplete() {
  cflipRunning = false;
  document.getElementById('cflip-start-btn').style.display = '';
  document.getElementById('cflip-start-btn').textContent = 'もう一度';

  const key = CFLIP_BEST_KEYS[cflipDiff];
  const prev = parseInt(localStorage.getItem(key)) || Infinity;
  const record = cflipMoves < prev;
  if (record) {
    localStorage.setItem(key, cflipMoves);
    document.getElementById('cflip-best').textContent = cflipMoves + '手';
  }

  const prevDisplay = prev === Infinity ? '-' : prev + '手';
  const rank = getScoreRank(cflipMoves, CFLIP_RANKS);
  saveScore('card-flip', cflipDiff, cflipMoves);
  showResult(
    record ? '🏆' : '🃏',
    'クリア！',
    `手数: ${cflipMoves} 手\n${record ? '🏆 新記録!' : 'ベスト: ' + prevDisplay}`,
    cflipStart,
    rank
  );
}
