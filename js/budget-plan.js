/* ===== 予算プラン (budget-plan) ===== */

var BPLAN_RANKS = [
  { min: 45, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 35, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 26, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 18, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 12, label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 6,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const BPLAN_BEST_KEYS = { easy: 'bplan_best_easy', normal: 'bplan_best_normal', hard: 'bplan_best_hard' };
const BPLAN_TOTAL_TIME = 60;

// Item pool: [icon, name, price]
const BPLAN_ITEM_POOL = [
  ['🍙','おにぎり',120],['🥤','ドリンク',180],['🍞','パン',150],['🍫','チョコ',100],
  ['🍜','ラーメン',480],['🍱','弁当',430],['🥗','サラダ',250],['🍦','アイス',200],
  ['📎','クリップ',80],['✏️','鉛筆',60],['📓','ノート',220],['🧃','ジュース',140],
  ['🍪','クッキー',160],['🧁','カップケーキ',280],['🥐','クロワッサン',200],
  ['🍵','お茶',130],['🌮','タコス',350],['🥪','サンドイッチ',320],
  ['🍩','ドーナツ',180],['🥞','パンケーキ',380],
];

const BPLAN_CONFIGS = {
  easy:   { itemCount: 4, budgetRange: [400, 700],  minRatio: 0.75 },
  normal: { itemCount: 5, budgetRange: [600, 1000], minRatio: 0.80 },
  hard:   { itemCount: 6, budgetRange: [800, 1500], minRatio: 0.85 },
};

let bplanRunning = false;
let bplanScore = 0;
let bplanTimeLeft = BPLAN_TOTAL_TIME;
let bplanTimerInterval = null;
let bplanDiff = 'easy';
let bplanBudget = 0;
let bplanItems = [];
let bplanSelected = {}; // { idx: quantity }

function bplanLoadBest() {
  const b = localStorage.getItem(BPLAN_BEST_KEYS[bplanDiff]);
  document.getElementById('bplan-best').textContent = b !== null ? b : '0';
}

function bplanSetDiff(btn, diff) {
  bplanDiff = diff;
  document.querySelectorAll('#bplan-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  bplanLoadBest();
}

function bplanStop() {
  bplanRunning = false;
  clearInterval(bplanTimerInterval);
  bplanTimerInterval = null;
  document.getElementById('bplan-start-btn').style.display = '';
  document.getElementById('bplan-start-btn').textContent = 'スタート';
  document.getElementById('bplan-stage').style.visibility = 'hidden';
  document.getElementById('bplan-timer-fill').style.width = '100%';
  document.getElementById('bplan-time').textContent = BPLAN_TOTAL_TIME;
}

function bplanStart() {
  bplanScore = 0;
  bplanTimeLeft = BPLAN_TOTAL_TIME;
  bplanRunning = true;
  document.getElementById('bplan-score').textContent = 0;
  document.getElementById('bplan-start-btn').style.display = 'none';
  document.getElementById('bplan-stage').style.visibility = 'visible';
  bplanLoadBest();

  clearInterval(bplanTimerInterval);
  bplanTimerInterval = setInterval(() => {
    bplanTimeLeft -= 0.1;
    bplanUpdateTimer();
    document.getElementById('bplan-time').textContent = Math.ceil(bplanTimeLeft);
    if (bplanTimeLeft <= 0) {
      clearInterval(bplanTimerInterval);
      bplanTimerInterval = null;
      bplanTimeUp();
    }
  }, 100);

  bplanNextRound();
}

function bplanNextRound() {
  if (!bplanRunning) return;
  const cfg = BPLAN_CONFIGS[bplanDiff];
  bplanSelected = {};

  // Pick budget
  const lo = cfg.budgetRange[0], hi = cfg.budgetRange[1];
  bplanBudget = Math.round(rand(lo, hi) / 10) * 10;

  // Pick items ensuring at least one valid combination
  const pool = shuffle([...BPLAN_ITEM_POOL]);
  bplanItems = pool.slice(0, cfg.itemCount);

  document.getElementById('bplan-budget-val').textContent = `¥${bplanBudget}`;

  bplanRenderItems();
  bplanUpdateTotals();
}

function bplanRenderItems() {
  const container = document.getElementById('bplan-items');
  container.innerHTML = '';
  bplanItems.forEach((item, i) => {
    const [icon, name, price] = item;
    const div = document.createElement('div');
    div.className = 'bplan-item';
    div.id = `bplan-item-${i}`;
    div.onclick = () => bplanAdjust(i, 1);
    div.innerHTML = `
      <span class="bplan-item-icon">${icon}</span>
      <span class="bplan-item-name">${name}</span>
      <span class="bplan-item-price">¥${price}</span>
      <div class="bplan-qty-ctrl" onclick="event.stopPropagation()">
        <button class="bplan-qty-btn" onclick="bplanAdjust(${i},-1)">−</button>
        <span class="bplan-qty-val" id="bplan-qty-${i}">0</span>
        <button class="bplan-qty-btn" onclick="bplanAdjust(${i},1)">＋</button>
      </div>`;
    container.appendChild(div);
  });
}

function bplanAdjust(idx, delta) {
  if (!bplanRunning) return;
  const qty = Math.max(0, (bplanSelected[idx] || 0) + delta);
  if (qty === 0) delete bplanSelected[idx];
  else bplanSelected[idx] = qty;
  const qtyEl = document.getElementById(`bplan-qty-${idx}`);
  if (qtyEl) qtyEl.textContent = qty;
  const itemEl = document.getElementById(`bplan-item-${idx}`);
  if (itemEl) itemEl.classList.toggle('selected', qty > 0);
  bplanUpdateTotals();
}

function bplanTotal() {
  let t = 0;
  Object.entries(bplanSelected).forEach(([i, qty]) => { t += bplanItems[i][2] * qty; });
  return t;
}

function bplanUpdateTotals() {
  const total = bplanTotal();
  const ratio = total / bplanBudget;
  const over = total > bplanBudget;

  const totalEl = document.getElementById('bplan-total-val');
  totalEl.textContent = `¥${total}`;
  totalEl.className = 'bplan-total-val' + (over ? ' over' : total > 0 ? ' good' : '');

  const fillPct = Math.min(100, ratio * 100);
  const fill = document.getElementById('bplan-meter-fill');
  fill.style.width = fillPct + '%';
  fill.style.background = over
    ? '#f43f5e'
    : ratio >= 0.75
      ? 'linear-gradient(90deg,#10b981,#059669)'
      : 'linear-gradient(90deg, var(--accent), var(--primary))';

  document.getElementById('bplan-confirm-btn').disabled = Object.keys(bplanSelected).length === 0;
}

function bplanConfirm() {
  if (!bplanRunning) return;
  const total = bplanTotal();
  const cfg = BPLAN_CONFIGS[bplanDiff];
  const ratio = total / bplanBudget;
  const success = total <= bplanBudget && ratio >= cfg.minRatio;

  if (success) {
    sfx.correct();
    bplanScore++;
    document.getElementById('bplan-score').textContent = bplanScore;
  } else {
    sfx.wrong();
  }

  setTimeout(() => { if (bplanRunning) bplanNextRound(); }, 400);
}

function bplanUpdateTimer() {
  const pct = Math.max(0, (bplanTimeLeft / BPLAN_TOTAL_TIME) * 100);
  const fill = document.getElementById('bplan-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function bplanTimeUp() {
  bplanRunning = false;
  document.getElementById('bplan-start-btn').style.display = '';
  document.getElementById('bplan-start-btn').textContent = 'もう一度';
  document.getElementById('bplan-stage').style.visibility = 'hidden';

  const key = BPLAN_BEST_KEYS[bplanDiff];
  const prev = parseInt(localStorage.getItem(key)) || 0;
  const record = bplanScore > prev;
  if (record) {
    localStorage.setItem(key, bplanScore);
    document.getElementById('bplan-best').textContent = bplanScore;
  }
  const rank = getScoreRank(bplanScore, BPLAN_RANKS);
  showResult(
    record ? '🏆' : '💰',
    '時間切れ！',
    `スコア: ${bplanScore}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    bplanStart,
    rank
  );
}
