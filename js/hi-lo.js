/* ===== ハイ＆ロー (hi-lo) ===== */

const HL_BEST_KEY = 'hlBest';
const HL_LABELS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const HL_SUITS = ['♠', '♣', '♥', '♦'];
const HL_SUIT_RED = new Set(['♥', '♦']);

let hlRunning = false;
let hlScore = 0;
let hlDeck = [];
let hlCurrentCard = null;
let hlWaiting = false;

function hlLoadBest() {
  const b = localStorage.getItem(HL_BEST_KEY);
  document.getElementById('hl-best').textContent = b !== null ? b : '0';
}

function hlBuildDeck() {
  const deck = [];
  for (let v = 1; v <= 13; v++) {
    for (const suit of HL_SUITS) deck.push({ v, suit });
  }
  return shuffle(deck);
}

function hlStop() {
  hlRunning = false;
  hlWaiting = false;
  document.getElementById('hl-start-btn').style.display = '';
  document.getElementById('hl-start-btn').textContent = 'スタート';
  document.getElementById('hl-stage').style.visibility = 'hidden';
  document.getElementById('hl-btns').style.display = 'none';
  document.getElementById('hl-message').textContent = '次のカードは？';
}

function hlStart() {
  hlScore = 0;
  hlRunning = true;
  hlWaiting = false;
  hlDeck = hlBuildDeck();
  hlCurrentCard = hlDeck.pop();

  document.getElementById('hl-score').textContent = 0;
  document.getElementById('hl-start-btn').style.display = 'none';
  document.getElementById('hl-stage').style.visibility = 'visible';
  document.getElementById('hl-btns').style.display = 'flex';
  hlLoadBest();

  hlRenderCard(hlCurrentCard);
  hlUpdateRemain();
  document.getElementById('hl-message').textContent = '次のカードは？';
}

function hlRenderCard(card) {
  const valueEl = document.getElementById('hl-card-value');
  const suitEl = document.getElementById('hl-card-suit');
  const cardEl = document.getElementById('hl-current-card');

  valueEl.textContent = HL_LABELS[card.v - 1];
  suitEl.textContent = card.suit;
  cardEl.className = 'hl-card ' + (HL_SUIT_RED.has(card.suit) ? 'hl-red' : 'hl-black');
  cardEl.classList.add('hl-card-pop');
  void cardEl.offsetWidth;
}

function hlUpdateRemain() {
  document.getElementById('hl-remain').textContent = hlDeck.length;
}

function hlTap(guess) {
  if (!hlRunning || hlWaiting) return;
  if (hlDeck.length === 0) { hlGameClear(); return; }

  hlWaiting = true;
  const nextCard = hlDeck.pop();
  const cardEl = document.getElementById('hl-current-card');

  let result;
  if (nextCard.v === hlCurrentCard.v) {
    result = 'push'; // Same value → Push (neutral)
  } else if (guess === 'high') {
    result = nextCard.v > hlCurrentCard.v ? 'correct' : 'wrong';
  } else {
    result = nextCard.v < hlCurrentCard.v ? 'correct' : 'wrong';
  }

  hlCurrentCard = nextCard;
  hlRenderCard(nextCard);
  hlUpdateRemain();

  if (result === 'correct') {
    sfx.correct();
    hlScore++;
    document.getElementById('hl-score').textContent = hlScore;
    document.getElementById('hl-message').textContent = '✓ 正解！';
    cardEl.classList.add('hl-result-correct');
    setTimeout(() => {
      if (!hlRunning) return;
      cardEl.classList.remove('hl-result-correct');
      document.getElementById('hl-message').textContent = '次のカードは？';
      hlWaiting = false;
      if (hlDeck.length === 0) hlGameClear();
    }, 500);
  } else if (result === 'push') {
    document.getElementById('hl-message').textContent = '➡ 同じ！引き分け';
    setTimeout(() => {
      if (!hlRunning) return;
      document.getElementById('hl-message').textContent = '次のカードは？';
      hlWaiting = false;
      if (hlDeck.length === 0) hlGameClear();
    }, 600);
  } else {
    sfx.wrong();
    document.getElementById('hl-message').textContent = '✗ ハズレ！';
    cardEl.classList.add('hl-result-wrong');
    setTimeout(() => {
      if (!hlRunning) return;
      cardEl.classList.remove('hl-result-wrong');
      document.getElementById('hl-message').textContent = '次のカードは？';
      hlWaiting = false;
      if (hlDeck.length === 0) hlGameClear();
    }, 600);
  }
}

function hlSaveAndShow(icon, title, detail) {
  hlRunning = false;
  document.getElementById('hl-start-btn').style.display = '';
  document.getElementById('hl-start-btn').textContent = 'もう一度';
  document.getElementById('hl-stage').style.visibility = 'hidden';
  document.getElementById('hl-btns').style.display = 'none';

  const prev = parseInt(localStorage.getItem(HL_BEST_KEY)) || 0;
  const record = hlScore > prev;
  if (record) {
    localStorage.setItem(HL_BEST_KEY, hlScore);
    document.getElementById('hl-best').textContent = hlScore;
  }
  showResult(
    record ? '🏆' : icon,
    title,
    `累計正解: ${hlScore}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    hlStart
  );
}

function hlGameOver() {
  hlSaveAndShow('🃏', 'ハズレ！', '');
}

function hlGameClear() {
  hlSaveAndShow('🎉', 'デッキ完走！', '');
}
