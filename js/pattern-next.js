/* ===== PATTERN NEXT (パターン予測) ===== */

const PN_BEST_KEY = 'pnBest';

let pnRunning = false;
let pnScore = 0;
let pnAnswer = null;
let pnTimerInterval = null;
let pnTimeLeft = 0;
const PN_TIME = 15;

const PN_COLOR_POOL  = ['🔴','🔵','🟡','🟢','🟠','🟣'];
const PN_SHAPE_POOL  = ['⭐','🔶','🔷','⬛','🔺','🟤'];

function pnLoadBest() {
  const b = localStorage.getItem(PN_BEST_KEY);
  document.getElementById('pn-best').textContent = b !== null ? b : '0';
}

function pnStop() {
  pnRunning = false;
  clearInterval(pnTimerInterval);
  pnTimerInterval = null;
  document.getElementById('pn-start-btn').style.display = '';
  document.getElementById('pn-start-btn').textContent = 'スタート';
  document.getElementById('pn-sequence').innerHTML = '';
  document.getElementById('pn-choices').innerHTML = '';
  document.getElementById('pn-timer-fill').style.width = '100%';
}

function pnStart() {
  pnScore = 0;
  pnRunning = true;
  document.getElementById('pn-score').textContent = 0;
  document.getElementById('pn-start-btn').style.display = 'none';
  pnLoadBest();
  pnNextQuestion();
}

function pnGenPattern() {
  const type = rand(0, 7);

  if (type === 0) {
    // Arithmetic ascending
    const a = rand(1, 10);
    const d = rand(1, 5);
    const seq = Array.from({ length: 5 }, (_, i) => a + i * d);
    const ans = a + 5 * d;
    const wrongs = pnNumWrongs(ans, d);
    return { seq: seq.map(String), ans: String(ans), wrongs: wrongs.map(String) };
  }

  if (type === 1) {
    // Arithmetic descending
    const d = rand(2, 5);
    const a = rand(d * 5 + 5, d * 5 + 20);
    const seq = Array.from({ length: 5 }, (_, i) => a - i * d);
    const ans = a - 5 * d;
    const wrongs = pnNumWrongs(ans, d);
    return { seq: seq.map(String), ans: String(ans), wrongs: wrongs.map(String) };
  }

  if (type === 2) {
    // Double
    const a = rand(1, 3);
    const seq = [a, a*2, a*4, a*8, a*16];
    const ans = a * 32;
    const wrongs = pnNumWrongs(ans, ans / 4);
    return { seq: seq.map(String), ans: String(ans), wrongs: wrongs.map(String) };
  }

  if (type === 3) {
    // Fibonacci-like
    const a = rand(1, 3);
    const b = rand(1, 3);
    const seq = [a, b, a+b, a+2*b, 2*a+3*b];
    const ans = 3*a + 5*b;
    const wrongs = pnNumWrongs(ans, b);
    return { seq: seq.map(String), ans: String(ans), wrongs: wrongs.map(String) };
  }

  if (type === 4) {
    // Perfect squares
    const n = rand(1, 4);
    const seq = Array.from({ length: 5 }, (_, i) => (n + i) * (n + i));
    const ans = (n + 5) * (n + 5);
    const wrongs = pnNumWrongs(ans, (n + 4));
    return { seq: seq.map(String), ans: String(ans), wrongs: wrongs.map(String) };
  }

  if (type === 5) {
    // Color period-2
    const pool = shuffle([...PN_COLOR_POOL]);
    const A = pool[0], B = pool[1];
    const seq = [A, B, A, B, A];
    const ans = B;
    const wrongs = pool.slice(2, 5);
    return { seq, ans, wrongs };
  }

  if (type === 6) {
    // Color period-3
    const pool = shuffle([...PN_COLOR_POOL]);
    const A = pool[0], B = pool[1], C = pool[2];
    const seq = [A, B, C, A, B];
    const ans = C;
    const wrongs = pool.slice(3, 6);
    return { seq, ans, wrongs };
  }

  // type === 7: Shape period-2
  const pool = shuffle([...PN_SHAPE_POOL]);
  const A = pool[0], B = pool[1];
  const seq = [A, B, A, B, A];
  const ans = B;
  const wrongs = pool.slice(2, 5);
  return { seq, ans, wrongs };
}

function pnNumWrongs(ans, d) {
  const step = Math.max(1, Math.abs(d));
  const candidates = new Set();
  const offsets = [step, -step, step * 2, -step * 2, step * 3, -step * 3, 1, -1, 2, -2];
  for (const off of offsets) {
    const v = ans + off;
    if (v !== ans && v > 0) candidates.add(v);
    if (candidates.size >= 3) break;
  }
  // Fallback
  while (candidates.size < 3) {
    const v = ans + candidates.size + 1;
    candidates.add(v);
  }
  return Array.from(candidates).slice(0, 3);
}

function pnNextQuestion() {
  if (!pnRunning) return;

  let pattern;
  let attempts = 0;
  do {
    pattern = pnGenPattern();
    attempts++;
  } while (!pattern && attempts < 10);

  pnAnswer = pattern.ans;

  // Build sequence display
  const seqEl = document.getElementById('pn-sequence');
  seqEl.innerHTML = '';
  pattern.seq.forEach(item => {
    const box = document.createElement('div');
    box.className = 'pn-seq-box pn-seq-pop';
    box.textContent = item;
    seqEl.appendChild(box);
  });
  // Question mark box
  const qBox = document.createElement('div');
  qBox.className = 'pn-seq-box pn-seq-question';
  qBox.textContent = '？';
  seqEl.appendChild(qBox);

  // Build choices
  const choicesEl = document.getElementById('pn-choices');
  choicesEl.innerHTML = '';
  const allChoices = shuffle([pattern.ans, ...pattern.wrongs.slice(0, 3)]);
  allChoices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'pn-choice-btn';
    btn.textContent = choice;
    btn.onclick = () => pnChoose(choice, btn);
    choicesEl.appendChild(btn);
  });

  // Timer
  pnTimeLeft = PN_TIME;
  pnUpdateTimer();
  clearInterval(pnTimerInterval);
  pnTimerInterval = setInterval(() => {
    pnTimeLeft -= 0.05;
    pnUpdateTimer();
    if (pnTimeLeft <= 0) {
      clearInterval(pnTimerInterval);
      pnTimerInterval = null;
      pnGameOver('timeout');
    }
  }, 50);
}

function pnUpdateTimer() {
  const pct = Math.max(0, (pnTimeLeft / PN_TIME) * 100);
  const fill = document.getElementById('pn-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function pnChoose(choice, btn) {
  if (!pnRunning) return;
  clearInterval(pnTimerInterval);
  pnTimerInterval = null;

  if (choice === pnAnswer) {
    btn.classList.add('pn-correct');
    pnScore++;
    document.getElementById('pn-score').textContent = pnScore;
    setTimeout(() => {
      if (pnRunning) pnNextQuestion();
    }, 500);
  } else {
    btn.classList.add('pn-wrong');
    // Highlight correct
    document.querySelectorAll('.pn-choice-btn').forEach(b => {
      if (b.textContent === pnAnswer) b.classList.add('pn-correct');
    });
    setTimeout(() => {
      if (pnRunning) pnGameOver('wrong');
    }, 700);
  }
}

function pnGameOver(reason) {
  pnRunning = false;
  clearInterval(pnTimerInterval);
  pnTimerInterval = null;
  document.getElementById('pn-start-btn').style.display = '';
  document.getElementById('pn-start-btn').textContent = 'もう一度';

  const prev = parseInt(localStorage.getItem(PN_BEST_KEY)) || 0;
  const record = pnScore > prev;
  if (record) {
    localStorage.setItem(PN_BEST_KEY, pnScore);
    document.getElementById('pn-best').textContent = pnScore;
  }

  const icon = record ? '🏆' : (reason === 'timeout' ? '⏰' : '🔮');
  const title = reason === 'timeout' ? '時間切れ！' : 'ミス！';
  const detail = `スコア: ${pnScore}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`;
  showResult(icon, title, detail, pnStart);
}
