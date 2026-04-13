/* ===== ダブル検知 (double-detect) ===== */

// 1. RANKS
var DD_RANKS = [
  { min: 150, label: '伝説',         emoji: '👑', color: '#f59e0b' },
  { min: 120, label: '達人',         emoji: '🏆', color: '#8b5cf6' },
  { min: 90,  label: 'エキスパート',  emoji: '💫', color: '#3b82f6' },
  { min: 60,  label: '上級者',       emoji: '⭐', color: '#10b981' },
  { min: 35,  label: '中級者',       emoji: '🌟', color: '#6ee7b7' },
  { min: 15,  label: '見習い',       emoji: '🔰', color: '#94a3b8' },
  { min: 0,   label: 'まだまだ',     emoji: '🌱', color: '#64748b' },
];

// 2. LocalStorage keys
const DD_BEST_EASY   = 'dd_best_easy';
const DD_BEST_NORMAL = 'dd_best_normal';
const DD_BEST_HARD   = 'dd_best_hard';

// 3. Constants
const DD_DIFF_MS     = { easy: 2500, normal: 2000, hard: 1300 };
const DD_SUITS       = ['♠', '♥', '♦', '♣'];
const DD_RANK_NAMES  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const DD_TOTAL_CARDS = 20;

// 4. State
let ddDifficulty      = 'normal';
let ddRunning         = false;
let ddDeck            = [];
let ddCardIndex       = 0;
let ddSeenRanks       = {};   // rank → first position (1-based)
let ddScore           = 0;
let ddHits            = 0;
let ddMisses          = 0;
let ddTimer           = null;
let ddAwaitingInput   = false;
let ddCurrentIsDouble = false;
let ddCardShownAt     = 0;

// 5. Best display
function ddLoadBest() {
  const key = `dd_best_${ddDifficulty}`;
  const val = parseInt(localStorage.getItem(key)) || 0;
  const el  = document.getElementById('dd-best');
  if (el) el.textContent = val;
}

function ddSetDiff(btn, diff) {
  ddDifficulty = diff;
  document.querySelectorAll('#dd-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  ddLoadBest();
}

// 6. Stop / cleanup
function ddStop() {
  ddRunning = false;
  clearTimeout(ddTimer);
  ddTimer = null;
}

// 7. Helpers
const DD_PIP_LAYOUTS = {
  'A':  { pips: [[50,50,false]], size: 56 },
  '2':  { pips: [[50,20,false],[50,80,true]], size: 42 },
  '3':  { pips: [[50,16,false],[50,50,false],[50,84,true]], size: 36 },
  '4':  { pips: [[28,22,false],[72,22,false],[28,78,true],[72,78,true]], size: 34 },
  '5':  { pips: [[28,18,false],[72,18,false],[50,50,false],[28,82,true],[72,82,true]], size: 30 },
  '6':  { pips: [[28,16,false],[72,16,false],[28,50,false],[72,50,false],[28,84,true],[72,84,true]], size: 28 },
  '7':  { pips: [[28,13,false],[72,13,false],[50,30,false],[28,50,false],[72,50,false],[28,87,true],[72,87,true]], size: 26 },
  '8':  { pips: [[28,13,false],[72,13,false],[50,28,false],[28,50,false],[72,50,false],[50,72,true],[28,87,true],[72,87,true]], size: 24 },
  '9':  { pips: [[28,12,false],[72,12,false],[28,33,false],[72,33,false],[50,50,false],[28,67,true],[72,67,true],[28,88,true],[72,88,true]], size: 23 },
  '10': { pips: [[28,10,false],[72,10,false],[50,25,false],[28,40,false],[72,40,false],[28,60,true],[72,60,true],[50,75,true],[28,90,true],[72,90,true]], size: 22 },
};

function ddRenderPips(rank, suit) {
  const layout = DD_PIP_LAYOUTS[rank];
  if (!layout) {
    // J, Q, K — face card
    return `<div class="dd-face-letter">${rank}</div>`;
  }
  const pipsHtml = layout.pips.map(([x, y, rot]) =>
    `<span class="dd-pip${rot ? ' dd-rot' : ''}" style="left:${x}%;top:${y}%;font-size:${layout.size}px">${suit}</span>`
  ).join('');
  return `<div class="dd-pip-area">${pipsHtml}</div>`;
}

function ddBuildDeck() {
  const deck = [];
  DD_SUITS.forEach(suit => {
    DD_RANK_NAMES.forEach(rank => deck.push({ suit, rank }));
  });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function ddShowFeedback(text, good) {
  const el = document.getElementById('dd-feedback');
  el.textContent = text;
  el.className = 'dd-feedback ' + (good ? 'dd-fb-ok' : 'dd-fb-ng');
  el.style.display = 'block';
}

// 8. Start
function ddStart() {
  ddDeck            = ddBuildDeck();
  ddCardIndex       = 0;
  ddSeenRanks       = {};
  ddScore           = 0;
  ddHits            = 0;
  ddMisses          = 0;
  ddAwaitingInput   = false;
  ddCurrentIsDouble = false;
  ddRunning         = true;

  document.getElementById('dd-score').textContent  = '0';
  document.getElementById('dd-hits').textContent   = '0';
  document.getElementById('dd-misses').textContent = '0';
  document.getElementById('dd-start-btn').style.display  = 'none';
  document.getElementById('dd-diff-row').style.display   = 'none';
  document.getElementById('dd-stage').style.display      = 'flex';
  document.getElementById('dd-input-area').style.display = 'none';
  document.getElementById('dd-feedback').style.display   = 'none';

  ddShowCard();
}

// 9. Card display
function ddShowCard() {
  if (!ddRunning) return;
  if (ddCardIndex >= DD_TOTAL_CARDS) { ddEnd(); return; }

  const card = ddDeck[ddCardIndex];
  const pos  = ddCardIndex + 1;

  ddCurrentIsDouble = Object.prototype.hasOwnProperty.call(ddSeenRanks, card.rank);
  if (!ddCurrentIsDouble) ddSeenRanks[card.rank] = pos;

  ddCardShownAt   = Date.now();
  ddAwaitingInput = false;

  const isRed = card.suit === '♥' || card.suit === '♦';
  document.getElementById('dd-card-display').innerHTML = `
    <div class="dd-card ${isRed ? 'dd-red' : 'dd-black'}">
      <div class="dd-corner dd-tl">${card.rank}<br><span>${card.suit}</span></div>
      ${ddRenderPips(card.rank, card.suit)}
      <div class="dd-corner dd-br">${card.rank}<br><span>${card.suit}</span></div>
    </div>`;

  document.getElementById('dd-progress').textContent    = `${pos} / ${DD_TOTAL_CARDS}`;
  document.getElementById('dd-input-area').style.display = 'none';
  document.getElementById('dd-feedback').style.display   = 'none';
  document.getElementById('dd-double-btn').disabled      = false;

  // Timer bar
  const ms  = DD_DIFF_MS[ddDifficulty];
  const bar = document.getElementById('dd-timer-bar');
  bar.style.transition = 'none';
  bar.style.width = '100%';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    bar.style.transition = `width ${ms}ms linear`;
    bar.style.width = '0%';
  }));

  clearTimeout(ddTimer);
  ddTimer = setTimeout(() => {
    if (!ddRunning || ddAwaitingInput) return;
    if (ddCurrentIsDouble) {
      ddMisses++;
      document.getElementById('dd-misses').textContent = ddMisses;
      ddShowFeedback('⏰ 見逃し！ダブルでした', false);
      setTimeout(() => { if (ddRunning) { ddCardIndex++; ddShowCard(); } }, 750);
    } else {
      ddCardIndex++;
      ddShowCard();
    }
  }, ms);
}

// 10. Button handler
function ddPressDouble() {
  if (!ddRunning || ddAwaitingInput) return;
  clearTimeout(ddTimer);
  document.getElementById('dd-double-btn').disabled = true;

  // Freeze timer bar
  const bar = document.getElementById('dd-timer-bar');
  const w   = bar.getBoundingClientRect().width;
  bar.style.transition = 'none';
  bar.style.width = w + 'px';

  if (ddCurrentIsDouble) {
    ddAwaitingInput = true;
    const card = ddDeck[ddCardIndex];
    document.getElementById('dd-pos-question').textContent =
      `「${card.rank}」は何枚目に最初に出ましたか？（1〜${ddCardIndex}）`;
    document.getElementById('dd-pos-input').value = '';
    document.getElementById('dd-input-area').style.display = 'flex';
    setTimeout(() => document.getElementById('dd-pos-input').focus(), 50);
  } else {
    // False alarm
    ddMisses++;
    ddScore = Math.max(0, ddScore - 3);
    document.getElementById('dd-misses').textContent = ddMisses;
    document.getElementById('dd-score').textContent  = ddScore;
    ddShowFeedback('❌ ダブルじゃない！ (−3点)', false);
    ddTimer = setTimeout(() => { if (ddRunning) { ddCardIndex++; ddShowCard(); } }, 750);
  }
}

// 11. Position answer
function ddSubmitPosition() {
  if (!ddRunning || !ddAwaitingInput) return;
  const input    = document.getElementById('dd-pos-input');
  const answered = parseInt(input.value);
  if (isNaN(answered) || answered < 1 || answered > ddCardIndex) {
    input.style.borderColor = '#ef4444';
    setTimeout(() => { input.style.borderColor = ''; }, 400);
    return;
  }

  const card       = ddDeck[ddCardIndex];
  const correctPos = ddSeenRanks[card.rank];
  const reactionMs = Date.now() - ddCardShownAt;
  const speedBonus = Math.max(0, Math.min(5, Math.floor((2000 - reactionMs) / 400)));
  let pts = 10 + speedBonus;
  let msg;

  if (answered === correctPos) {
    pts += 10;
    msg = `✅ 完璧！${correctPos}枚目 正解 (+${pts}点)`;
  } else {
    msg = `⚠️ 検知○ 枚数× 正解:${correctPos}枚目 (+${pts}点)`;
  }

  ddHits++;
  ddScore += pts;
  document.getElementById('dd-hits').textContent  = ddHits;
  document.getElementById('dd-score').textContent = ddScore;
  document.getElementById('dd-input-area').style.display = 'none';
  ddAwaitingInput = false;
  ddShowFeedback(msg, answered === correctPos);

  setTimeout(() => { if (ddRunning) { ddCardIndex++; ddShowCard(); } }, 900);
}

// 12. End
function ddEnd() {
  ddStop();
  const key   = `dd_best_${ddDifficulty}`;
  const prev  = parseInt(localStorage.getItem(key)) || 0;
  const isRec = ddScore > prev;
  if (isRec) {
    localStorage.setItem(key, ddScore);
    const el = document.getElementById('dd-best');
    if (el) el.textContent = ddScore;
  }

  document.getElementById('dd-start-btn').style.display = '';
  document.getElementById('dd-diff-row').style.display  = '';
  document.getElementById('dd-stage').style.display     = 'none';

  const rank = getScoreRank(ddScore, DD_RANKS);
  saveScore('double-detect', ddDifficulty, ddScore);
  showResult(
    isRec ? '🏆' : '🃏',
    'ゲーム終了！',
    `スコア: ${ddScore}\n正解: ${ddHits} / ミス: ${ddMisses}${isRec ? '\n🏆 新記録!' : '\nベスト: ' + prev}`,
    ddStart,
    rank
  );
  refreshBestScores();
}

document.addEventListener('DOMContentLoaded', ddLoadBest);
