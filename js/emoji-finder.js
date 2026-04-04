/* ===== 絵文字さがし (emoji-finder) ===== */

var EF_RANKS = [
  { min: 500, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 400, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 300, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 200, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 100, label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min:   1, label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min:   0, label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const EF_BEST_KEYS = {
  easy:   'ef_best_easy',
  normal: 'ef_best_normal',
  hard:   'ef_best_hard',
};

// 難易度ごとの設定: { count: 表示枚数, speed: フラッシュ速度(ms) }
const EF_DIFF_CONFIG = {
  easy:   { count: 10, speed: 900 },
  normal: { count: 20, speed: 600 },
  hard:   { count: 50, speed: 400 },
};

// 120種類の絵文字プール（重複なし）
const EF_POOL = [
  // Animals
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯',
  '🦁','🐮','🐷','🐸','🐵','🐔','🐧','🦆','🦅','🦉',
  '🦇','🐺','🐗','🐴','🦄','🦋','🐛','🐌','🐞','🐜',
  // Food
  '🍎','🍊','🍋','🍇','🍓','🍕','🍔','🍣','🍜','🍦',
  '🧁','🍩','🍪','🌮','🥗','🥑','🍑','🍒','🥦','🥕',
  '🌽','🍆','🥝','🍍','🥭','🍌','🍉','🫐','🍄','🥥',
  // Nature
  '🌸','🌺','🌻','🌴','🌵','🍀','🌿','🌾','🎋','🍁',
  '🍂','🌼','🌷','🪷','🌱','🌲','🌳','🍃','🎍','🪴',
  // Objects & Activities
  '💎','🔮','⚡','🎈','🎸','🎁','🏆','🎯','🎨','🎭',
  '🎬','🎤','🎧','🎲','🎳','🎻','🔭','🔬','🎪','🎡',
  // Vehicles
  '🚗','🚂','✈️','⛵','🚁','🛺','🚲','🛵','🚌','🚀',
  // Sky / Weather / Places
  '⭐','🌙','☀️','🌈','🌊','🏔','🗼','🌋','⛺','🎢',
];

const EF_TOTAL_ROUNDS = 5;

let efDiff       = 'easy';
let efRunning    = false;
let efScore      = 0;
let efRound      = 0;
let efFlashTimer = null;
let efFlashIdx   = 0;
let efShown      = [];
let efNewEmoji   = '';
let efAllAnswers = [];

function efSetDiff(btn, diff) {
  efDiff = diff;
  document.querySelectorAll('#ef-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  efLoadBest();
}

function efLoadBest() {
  const b = parseInt(localStorage.getItem(EF_BEST_KEYS[efDiff])) || 0;
  const el = document.getElementById('ef-best');
  if (el) el.textContent = b;
}

function efStop() {
  efRunning = false;
  clearTimeout(efFlashTimer);
  efFlashTimer = null;
  const flashEl = document.getElementById('ef-flash-stage');
  const ansEl   = document.getElementById('ef-answer-stage');
  if (flashEl) flashEl.style.display = 'none';
  if (ansEl)   ansEl.style.display   = 'none';
  const startArea = document.getElementById('ef-start-area');
  if (startArea) startArea.style.display = '';
  const diffRow = document.getElementById('ef-diff-row');
  if (diffRow) diffRow.style.display = '';
}

function efStart() {
  efScore = 0;
  efRound = 0;
  efRunning = true;
  document.getElementById('ef-score').textContent = '0';
  document.getElementById('ef-start-area').style.display = 'none';
  document.getElementById('ef-diff-row').style.display   = 'none';
  efLoadBest();
  efStartRound();
}

function efStartRound() {
  if (!efRunning) return;
  const cfg = EF_DIFF_CONFIG[efDiff];

  // Pick (count + 1) unique emojis from the pool
  const pool   = [...EF_POOL].sort(() => Math.random() - 0.5);
  const picked = pool.slice(0, cfg.count + 1);

  // One random emoji is the "new" one (not shown during flash)
  const newIdx   = Math.floor(Math.random() * picked.length);
  efNewEmoji     = picked[newIdx];
  efShown        = picked.filter((_, i) => i !== newIdx);
  efAllAnswers   = [...picked].sort(() => Math.random() - 0.5);

  document.getElementById('ef-flash-stage').style.display  = '';
  document.getElementById('ef-answer-stage').style.display = 'none';
  document.getElementById('ef-round-label').textContent    = `ラウンド ${efRound + 1} / ${EF_TOTAL_ROUNDS}`;
  document.getElementById('ef-flash-count').textContent    = `0 / ${cfg.count}`;
  document.getElementById('ef-progress-fill').style.width  = '0%';
  document.getElementById('ef-flash-emoji').textContent    = '';

  efFlashIdx = 0;
  setTimeout(efShowNextFlash, 400);
}

function efShowNextFlash() {
  if (!efRunning) return;
  const cfg = EF_DIFF_CONFIG[efDiff];

  if (efFlashIdx >= efShown.length) {
    setTimeout(efShowAnswerPhase, 500);
    return;
  }

  const emojiEl    = document.getElementById('ef-flash-emoji');
  const countEl    = document.getElementById('ef-flash-count');
  const progressEl = document.getElementById('ef-progress-fill');

  progressEl.style.width = ((efFlashIdx + 1) / cfg.count * 100) + '%';
  countEl.textContent    = `${efFlashIdx + 1} / ${cfg.count}`;

  emojiEl.textContent = efShown[efFlashIdx];
  emojiEl.classList.remove('ef-pop');
  void emojiEl.offsetWidth;
  emojiEl.classList.add('ef-pop');

  efFlashIdx++;
  efFlashTimer = setTimeout(efShowNextFlash, cfg.speed);
}

function efShowAnswerPhase() {
  if (!efRunning) return;

  document.getElementById('ef-flash-stage').style.display  = 'none';
  document.getElementById('ef-answer-stage').style.display = '';
  document.getElementById('ef-answer-label').textContent   = '増えた絵文字はどれ？';

  const grid = document.getElementById('ef-grid');
  grid.innerHTML = '';
  efAllAnswers.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className   = 'ef-emoji-btn';
    btn.textContent = emoji;
    btn.onclick     = () => efAnswer(emoji, btn);
    grid.appendChild(btn);
  });
}

function efAnswer(emoji, btn) {
  if (!efRunning) return;
  efRunning = false;
  clearTimeout(efFlashTimer);

  const correct = emoji === efNewEmoji;

  document.querySelectorAll('.ef-emoji-btn').forEach(b => {
    b.disabled = true;
    if (b.textContent === efNewEmoji) b.classList.add('ef-correct');
  });
  if (!correct) btn.classList.add('ef-wrong');

  if (correct) {
    efScore += 100;
    document.getElementById('ef-score').textContent = efScore;
  }
  efRound++;

  if (efRound >= EF_TOTAL_ROUNDS) {
    setTimeout(() => efEnd(), 900);
  } else {
    setTimeout(() => {
      efRunning = true;
      efStartRound();
    }, 800);
  }
}

function efEnd() {
  efRunning = false;
  document.getElementById('ef-flash-stage').style.display  = 'none';
  document.getElementById('ef-answer-stage').style.display = 'none';
  document.getElementById('ef-start-area').style.display   = '';
  document.getElementById('ef-diff-row').style.display     = '';

  const key    = EF_BEST_KEYS[efDiff];
  const prev   = parseInt(localStorage.getItem(key)) || 0;
  const record = efScore > prev;
  if (record) {
    localStorage.setItem(key, efScore);
    document.getElementById('ef-best').textContent = efScore;
  }

  const rank  = getScoreRank(efScore, EF_RANKS);
  const correct = efScore / 100;
  const icon  = efScore === EF_TOTAL_ROUNDS * 100 ? '🎉' : (efScore > 0 ? '⭐' : '😓');
  const title = efScore === EF_TOTAL_ROUNDS * 100 ? '全問正解！' : '結果発表';
  const body  = `${correct} / ${EF_TOTAL_ROUNDS} 正解\nスコア: ${efScore}`
    + (record ? '\n🏆 新記録!' : `\nベスト: ${prev}`);

  showResult(icon, title, body, efStart, rank);
  refreshBestScores();
}
