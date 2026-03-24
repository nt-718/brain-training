/* ===== EMOJI ORDER MEMORY ===== */

// ---- Emoji pool (categorized, 60+ emojis) ----
const EO_POOL = [
  // Animals
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯',
  '🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦆','🦅',
  // Food
  '🍎','🍊','🍋','🍇','🍓','🍕','🍔','🍣','🍜','🍦',
  '🧁','🍩','🍪','🌮','🥗','🥑','🍑','🍒','🥦','🥕',
  // Objects / Nature
  '⭐','🌙','☀️','🌈','🌸','🌺','🌻','💎','🔮','⚡',
  '🎈','🎸','🎃','🎄','🎁','🏆','🚀','🛸','⚽','🎯',
  // Vehicles
  '🚗','🚂','✈️','⛵','🚁','🏍️','🚢','🛺','🚲','🛵',
];

// ---- State ----
let eoLength     = 5;        // 5 | 10 | 'custom'
let eoDiff       = 'normal';
let eoCustomLen  = 7;
let eoSeq        = [];       // the shown emoji sequence
let eoUserSeq    = [];       // user's built-up answer list
let eoScore      = 0;
let eoBest       = 0;
let eoRound      = 0;
let eoState      = 'idle';   // idle | showing | answering
let eoFlashTimer = null;

const EO_DIFF_MS    = { easy: 1500, normal: 800, hard: 400 };
const EO_NOISE_COUNT = 6;

// ---- Setup helpers ----
function eoGetLen() {
  return eoLength === 'custom' ? eoCustomLen : eoLength;
}

function eoSetLen(btn, val) {
  eoLength = val;
  document.querySelectorAll('#eo-len-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  const ctrl = document.getElementById('eo-custom-ctrl');
  ctrl.classList.toggle('visible', val === 'custom');
}

function eoSetDiff(btn, val) {
  eoDiff = val;
  document.querySelectorAll('#eo-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function eoCustomChange(delta) {
  eoCustomLen = Math.min(20, Math.max(3, eoCustomLen + delta));
  document.getElementById('eo-custom-num').textContent = eoCustomLen;
}

// ---- Game start ----
function eoStart() {
  if (eoFlashTimer) clearTimeout(eoFlashTimer);
  eoScore = 0;
  eoRound = 0;
  eoState = 'showing';

  document.getElementById('eo-score').textContent = 0;
  document.getElementById('eo-start-btn').style.display = 'none';
  document.getElementById('eo-len-row').style.pointerEvents = 'none';
  document.getElementById('eo-diff-row').style.pointerEvents = 'none';
  document.getElementById('eo-custom-ctrl').style.pointerEvents = 'none';

  eoNextRound();
}

function eoNextRound() {
  eoRound++;
  eoUserSeq = [];
  const len = eoGetLen() + (eoRound - 1); // sequence grows each round

  const shuffled = [...EO_POOL].sort(() => Math.random() - 0.5);
  eoSeq = shuffled.slice(0, len);

  document.getElementById('eo-message').textContent = '覚えて！';
  document.getElementById('eo-flash-stage').style.display = 'flex';
  document.getElementById('eo-answer-stage').classList.remove('visible');
  document.getElementById('eo-confirm-btn').style.display = 'none';
  document.getElementById('eo-undo-btn').style.display = 'none';

  eoRebuildDots();
  eoUpdateDots();
  eoFlashSequence(0);
}

// ---- Flash phase ----
function eoFlashSequence(idx) {
  const flashEl    = document.getElementById('eo-flash-emoji');
  const progressEl = document.getElementById('eo-progress-text');

  if (idx >= eoSeq.length) {
    flashEl.classList.remove('show');
    flashEl.textContent = '';
    progressEl.textContent = '';
    eoUpdateDots(-1);
    eoFlashTimer = setTimeout(() => eoAnswerPhase(), 400);
    return;
  }

  eoUpdateDots(idx);
  flashEl.classList.remove('show');
  eoFlashTimer = setTimeout(() => {
    flashEl.textContent = eoSeq[idx];
    flashEl.classList.add('show');
    progressEl.textContent = `${idx + 1} / ${eoSeq.length}`;

    const ms = EO_DIFF_MS[eoDiff];
    eoFlashTimer = setTimeout(() => {
      flashEl.classList.remove('show');
      eoFlashTimer = setTimeout(() => eoFlashSequence(idx + 1), 180);
    }, ms);
  }, 120);
}

function eoRebuildDots() {
  const container = document.getElementById('eo-dots');
  container.innerHTML = '';
  const len = eoGetLen() + (eoRound - 1);
  for (let i = 0; i < len; i++) {
    const d = document.createElement('div');
    d.className = 'eo-dot';
    container.appendChild(d);
  }
}

function eoUpdateDots(currentIdx) {
  const dots = document.querySelectorAll('.eo-dot');
  dots.forEach((d, i) => {
    d.classList.remove('active', 'done');
    if (currentIdx === undefined) return;
    if (i < currentIdx)  d.classList.add('done');
    if (i === currentIdx) d.classList.add('active');
  });
}

// ---- Answer phase ----
function eoAnswerPhase() {
  eoState   = 'answering';
  eoUserSeq = [];

  document.getElementById('eo-message').textContent = '順番にタップして確定しよう！';
  document.getElementById('eo-flash-stage').style.display = 'none';
  document.getElementById('eo-answer-stage').classList.add('visible');
  document.getElementById('eo-confirm-btn').style.display = 'none';
  document.getElementById('eo-undo-btn').style.display = 'none';

  eoRebuildGrid();
  eoUpdateAnswerHint();
}

function eoUpdateAnswerHint() {
  const total   = eoSeq.length;
  const current = eoUserSeq.length;
  if (current < total) {
    document.getElementById('eo-answer-hint').innerHTML =
      `<span>${current + 1}</span> 番目を選んでください（全 ${total} 個）`;
  } else {
    document.getElementById('eo-answer-hint').innerHTML =
      `✅ すべて選択済み — <strong>確定</strong>を押してください`;
  }
}

function eoRebuildGrid() {
  const grid = document.getElementById('eo-grid');
  grid.innerHTML = '';

  const noise = EO_POOL
    .filter(e => !eoSeq.includes(e))
    .sort(() => Math.random() - 0.5)
    .slice(0, EO_NOISE_COUNT);

  const all = [...eoSeq, ...noise].sort(() => Math.random() - 0.5);

  all.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'eo-emoji-btn';
    btn.textContent = emoji;
    btn.setAttribute('data-emoji', emoji);
    btn.onclick = () => eoTap(btn, emoji);
    grid.appendChild(btn);
  });
}

// Sync visual state of grid after undo
function eoSyncGrid() {
  document.querySelectorAll('.eo-emoji-btn').forEach(btn => {
    const emoji = btn.getAttribute('data-emoji');
    const idx   = eoUserSeq.indexOf(emoji);
    btn.classList.remove('selected', 'correct', 'wrong');
    btn.disabled = false;
    btn.querySelectorAll('.eo-order-badge').forEach(b => b.remove());

    if (idx !== -1) {
      btn.classList.add('selected');
      btn.disabled = true;
      const badge = document.createElement('span');
      badge.className = 'eo-order-badge';
      badge.textContent = idx + 1;
      btn.appendChild(badge);
    }
  });
}

// ---- Tap ----
function eoTap(btn, emoji) {
  if (eoState !== 'answering') return;
  if (eoUserSeq.includes(emoji)) return;
  if (eoUserSeq.length >= eoSeq.length) return; // full, wait for confirm

  eoUserSeq.push(emoji);
  btn.classList.add('selected');
  btn.disabled = true;

  const badge = document.createElement('span');
  badge.className = 'eo-order-badge';
  badge.textContent = eoUserSeq.length;
  btn.appendChild(badge);

  document.getElementById('eo-undo-btn').style.display = 'inline-flex';

  if (eoUserSeq.length >= eoSeq.length) {
    document.getElementById('eo-confirm-btn').style.display = 'inline-flex';
  }

  eoUpdateAnswerHint();
}

// ---- Undo last selection ----
function eoUndo() {
  if (eoState !== 'answering' || eoUserSeq.length === 0) return;
  eoUserSeq.pop();
  eoSyncGrid();

  if (eoUserSeq.length < eoSeq.length) {
    document.getElementById('eo-confirm-btn').style.display = 'none';
  }
  if (eoUserSeq.length === 0) {
    document.getElementById('eo-undo-btn').style.display = 'none';
  }

  eoUpdateAnswerHint();
}

// ---- Confirm answer ----
function eoConfirm() {
  if (eoState !== 'answering') return;
  if (eoUserSeq.length < eoSeq.length) return;

  eoState = 'idle';
  document.getElementById('eo-confirm-btn').style.display = 'none';
  document.getElementById('eo-undo-btn').style.display = 'none';
  document.querySelectorAll('.eo-emoji-btn').forEach(b => b.disabled = true);

  // Check correctness
  const allCorrect = eoUserSeq.every((e, i) => e === eoSeq[i]);

  // Visual feedback per button
  document.querySelectorAll('.eo-emoji-btn.selected').forEach(btn => {
    const emoji  = btn.getAttribute('data-emoji');
    const selIdx = eoUserSeq.indexOf(emoji);
    btn.classList.add(selIdx !== -1 && eoSeq[selIdx] === emoji ? 'correct' : 'wrong');
  });

  if (allCorrect) {
    eoScore++;
    document.getElementById('eo-score').textContent = eoScore;
    if (eoScore > eoBest) {
      eoBest = eoScore;
      document.getElementById('eo-best').textContent = eoBest;
    }
    document.getElementById('eo-message').textContent = 'ラウンドクリア！✨';
    eoFlashTimer = setTimeout(() => eoNextRound(), 1000);
  } else {
    document.getElementById('eo-message').textContent = '残念… 順番が違います';
    if (eoScore > eoBest) {
      eoBest = eoScore;
      document.getElementById('eo-best').textContent = eoBest;
    }
    eoFlashTimer = setTimeout(() => {
      eoStop();
      showResult(
        '🎴',
        'ゲームオーバー！',
        `クリアラウンド: ${eoScore}（ベスト: ${eoBest}）`,
        eoStart
      );
    }, 1200);
  }
}

// ---- Stop / reset ----
function eoStop() {
  if (eoFlashTimer) clearTimeout(eoFlashTimer);
  eoFlashTimer = null;
  eoState   = 'idle';
  eoUserSeq = [];

  document.getElementById('eo-flash-emoji').classList.remove('show');
  document.getElementById('eo-flash-emoji').textContent = '';
  document.getElementById('eo-progress-text').textContent = '';
  document.getElementById('eo-flash-stage').style.display = 'flex';
  document.getElementById('eo-answer-stage').classList.remove('visible');
  document.getElementById('eo-message').textContent = 'スタートを押してください';
  document.getElementById('eo-dots').innerHTML = '';
  document.getElementById('eo-confirm-btn').style.display = 'none';
  document.getElementById('eo-undo-btn').style.display   = 'none';

  document.getElementById('eo-start-btn').style.display  = 'inline-flex';
  document.getElementById('eo-len-row').style.pointerEvents  = '';
  document.getElementById('eo-diff-row').style.pointerEvents = '';
  document.getElementById('eo-custom-ctrl').style.pointerEvents = '';
}
