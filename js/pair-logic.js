// Pair Logic (ペアロジック)

var PL_RANKS = [
  { min: 38, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 28, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 20, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 14, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 9,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 4,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

let plDiff = 'easy';
let plScore = 0;
let plBest = 0;
let plTimer = null;
let plTimeLeft = 0;
let plTotalTime = 0;
let plIsPlaying = false;
let plAnswer = [];
let plSelected = [];

const plConfig = {
  easy:   { count: 3, time: 60 },
  normal: { count: 4, time: 80 },
  hard:   { count: 5, time: 100 }
};

const plItemSets = [
  ['🐶', '🐱', '🐰', '🐻', '🦊', '🐼'],
  ['🍎', '🍋', '🍇', '🍉', '🍓', '🍒'],
  ['⚽', '🏀', '🎾', '⚾', '🏐', '🎱'],
  ['🌸', '🌻', '🌹', '🌺', '🌷', '🪻'],
  ['🚗', '🚕', '🚌', '🚑', '🚒', '🏎️']
];

const savedPlBest = localStorage.getItem('plBest');
if (savedPlBest) {
  plBest = parseInt(savedPlBest, 10);
  const el = document.getElementById('pl-best');
  if (el) el.textContent = plBest;
}

function plSetDiff(btn, diff) {
  if (plIsPlaying) return;
  document.querySelectorAll('#pl-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  plDiff = diff;
}

function plStart() {
  if (plIsPlaying) return;
  const conf = plConfig[plDiff];
  plScore = 0;
  plTotalTime = conf.time;
  plTimeLeft = conf.time;

  document.getElementById('pl-score').textContent = 0;
  document.getElementById('pl-start-btn').style.display = 'none';

  plIsPlaying = true;
  plUpdateTimer();
  plNextRound();

  plTimer = setInterval(() => {
    plTimeLeft -= 0.1;
    plUpdateTimer();
    if (plTimeLeft <= 0) plGameOver();
  }, 100);
}

function plUpdateTimer() {
  const pct = Math.max(0, (plTimeLeft / plTotalTime) * 100);
  const fill = document.getElementById('pl-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 20
    ? 'linear-gradient(90deg, #f43f5e, #e11d48)'
    : 'linear-gradient(90deg, var(--secondary), var(--primary))';
}

function plNextRound() {
  const conf = plConfig[plDiff];
  const n = conf.count;
  plSelected = [];

  // Pick a random item set and choose n items
  const set = plItemSets[rand(0, plItemSets.length - 1)];
  const items = shuffle([...set]).slice(0, n);

  // The answer is this random order
  plAnswer = [...items];

  // Generate hints from consecutive pairs, randomly using "すぐ左" or "すぐ右"
  let hints = [];
  for (let i = 0; i < n - 1; i++) {
    if (Math.random() < 0.5) {
      hints.push({ a: plAnswer[i], b: plAnswer[i + 1], dir: 'left' });
    } else {
      hints.push({ a: plAnswer[i + 1], b: plAnswer[i], dir: 'right' });
    }
  }
  // Shuffle hint order
  shuffle(hints);

  // Render
  const stage = document.getElementById('pl-stage');
  stage.innerHTML = '';

  // Hints
  const hintsDiv = document.createElement('div');
  hintsDiv.className = 'pl-hints';
  hints.forEach(h => {
    const row = document.createElement('div');
    row.className = 'pl-hint';
    const label = h.dir === 'left' ? 'のすぐ左' : 'のすぐ右';
    row.innerHTML = `<span class="pl-hint-item">${h.a}</span><span class="pl-hint-op">は</span><span class="pl-hint-item">${h.b}</span><span class="pl-hint-op">${label}</span>`;
    hintsDiv.appendChild(row);
  });
  stage.appendChild(hintsDiv);

  // Instruction
  const inst = document.createElement('div');
  inst.className = 'pl-instruction';
  inst.textContent = '左から順番にタップしてください';
  stage.appendChild(inst);

  // Answer slots
  const slots = document.createElement('div');
  slots.className = 'pl-slots';
  slots.id = 'pl-slots';
  for (let i = 0; i < n; i++) {
    const slot = document.createElement('div');
    slot.className = 'pl-slot';
    slot.textContent = (i + 1);
    slots.appendChild(slot);
  }
  stage.appendChild(slots);

  // Selectable items (shuffled)
  const shuffled = shuffle([...items]);
  const btns = document.createElement('div');
  btns.className = 'pl-items';
  btns.id = 'pl-items';
  shuffled.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'pl-item-btn';
    btn.textContent = item;
    btn.onclick = () => plSelectItem(item, btn);
    btns.appendChild(btn);
  });
  stage.appendChild(btns);
}

function plSelectItem(item, btn) {
  if (!plIsPlaying) return;
  if (btn.classList.contains('pl-used')) return;

  plSelected.push(item);
  btn.classList.add('pl-used');

  // Fill slot
  const slots = document.getElementById('pl-slots');
  const slot = slots.children[plSelected.length - 1];
  slot.textContent = item;
  slot.classList.add('pl-filled');

  // Check if all selected
  if (plSelected.length === plAnswer.length) {
    const correct = plSelected.every((s, i) => s === plAnswer[i]);
    if (correct) {
      plScore++;
      document.getElementById('pl-score').textContent = plScore;
      plTimeLeft = Math.min(plTimeLeft + 3, plTotalTime);
      // Flash correct
      slots.querySelectorAll('.pl-slot').forEach(s => s.classList.add('pl-slot-correct'));
      setTimeout(() => { if (plIsPlaying) plNextRound(); }, 500);
    } else {
      // Flash wrong
      slots.querySelectorAll('.pl-slot').forEach(s => s.classList.add('pl-slot-wrong'));
      plTimeLeft -= 3;

      // Show correct answer briefly
      setTimeout(() => {
        if (!plIsPlaying) return;
        const slotsEl = document.getElementById('pl-slots');
        if (!slotsEl) return;
        for (let i = 0; i < plAnswer.length; i++) {
          slotsEl.children[i].textContent = plAnswer[i];
          slotsEl.children[i].className = 'pl-slot pl-filled pl-slot-correct';
        }
      }, 600);
      setTimeout(() => { if (plIsPlaying) plNextRound(); }, 1400);
    }
  }
}

function plGameOver() {
  clearInterval(plTimer);
  plIsPlaying = false;

  if (plScore > plBest) {
    plBest = plScore;
    localStorage.setItem('plBest', plBest.toString());
    document.getElementById('pl-best').textContent = plBest;
  }

  document.getElementById('pl-start-btn').style.display = 'inline-block';
  document.getElementById('pl-start-btn').textContent = 'もう一度';

  const rank = getScoreRank(plScore, PL_RANKS);
  showResult('🃏', 'タイムアップ', `正解数: ${plScore}\nベスト: ${plBest}`, plStart, rank);
}

function plStop() {
  if (plIsPlaying) {
    clearInterval(plTimer);
    plIsPlaying = false;
    document.getElementById('pl-stage').innerHTML = '';
    document.getElementById('pl-start-btn').style.display = 'inline-block';
    document.getElementById('pl-start-btn').textContent = 'スタート';
  }
}
