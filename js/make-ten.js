/* ===== MAKE TEN ===== */

var MTEN_RANKS = [
  { min: 30, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 22, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 15, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 10, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 6,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 3,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const MTEN_BEST_KEY = 'mten_best';
const MTEN_TIME = 60;
let mtenRunning = false;
let mtenScore = 0;
let mtenNums = [];       // original 4 numbers
let mtenExprNums = [];   // placed numbers (in expression order)
let mtenExprOps = ['+', '+', '+'];  // 3 operators
let mtenMistakes = 0;
let mtenTimerInterval = null;
let mtenTimeLeft = 0;

function mtenStop() {
  mtenRunning = false;
  clearInterval(mtenTimerInterval);
  mtenTimerInterval = null;
  const btn = document.getElementById('mten-start-btn');
  if (btn) { btn.style.display = ''; btn.textContent = 'スタート'; }
  const stage = document.getElementById('mten-stage');
  if (stage) stage.style.display = 'none';
  const msg = document.getElementById('mten-message');
  if (msg) msg.textContent = 'スタートを押してください';
}

function mtenStart() {
  mtenScore = 0;
  mtenTimeLeft = MTEN_TIME;
  mtenRunning = true;
  document.getElementById('mten-score').textContent = 0;
  document.getElementById('mten-start-btn').style.display = 'none';
  document.getElementById('mten-stage').style.display = 'flex';
  mtenLoadBest();
  mtenUpdateTimer();
  clearInterval(mtenTimerInterval);
  mtenTimerInterval = setInterval(() => {
    mtenTimeLeft--;
    mtenUpdateTimer();
    if (mtenTimeLeft <= 0) {
      clearInterval(mtenTimerInterval);
      mtenTimerInterval = null;
      mtenRunning = false;
      document.getElementById('mten-start-btn').style.display = '';
      document.getElementById('mten-start-btn').textContent = 'もう一度';
      document.getElementById('mten-stage').style.display = 'none';
      const best = parseInt(localStorage.getItem(MTEN_BEST_KEY) || '0');
      if (mtenScore > best) {
        localStorage.setItem(MTEN_BEST_KEY, mtenScore);
        document.getElementById('mten-best').textContent = mtenScore;
        if (typeof refreshBestScores === 'function') refreshBestScores();
      }
      const finalBest = Math.max(best, mtenScore);
      const rank = getScoreRank(mtenScore, MTEN_RANKS);
      showResult('🔢', 'タイムアップ！', `スコア: ${mtenScore}\nベスト: ${finalBest}`, mtenStart, rank);
    }
  }, 1000);
  mtenNewPuzzle();
}

function mtenUpdateTimer() {
  const el = document.getElementById('mten-timer');
  if (el) el.textContent = mtenTimeLeft;
}

function mtenLoadBest() {
  const b = localStorage.getItem(MTEN_BEST_KEY) || '0';
  document.getElementById('mten-best').textContent = b;
}

/* ---- Puzzle generation ---- */
function mtenNewPuzzle() {
  mtenMistakes = 0;
  let nums;
  let attempts = 0;
  do {
    nums = [rand(1, 9), rand(1, 9), rand(1, 9), rand(1, 9)];
    attempts++;
  } while (!mtenHasSolution(nums) && attempts < 300);
  if (!mtenHasSolution(nums)) nums = [1, 2, 3, 4]; // guaranteed fallback (1+2+3+4=10)
  mtenNums = nums;
  mtenReset();
}

function mtenPermutations(arr) {
  if (arr.length <= 1) return [arr.slice()];
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.filter((_, j) => j !== i);
    for (const p of mtenPermutations(rest)) out.push([arr[i], ...p]);
  }
  return out;
}

function mtenEval(ns, os) {
  // Evaluate n0 o0 n1 o1 n2 o2 n3 with standard precedence (×÷ before +-)
  let nums = ns.slice();
  let ops  = os.slice();
  let i = 0;
  while (i < ops.length) {
    if (ops[i] === '×' || ops[i] === '÷') {
      if (ops[i] === '÷' && nums[i + 1] === 0) return null;
      nums[i] = ops[i] === '×' ? nums[i] * nums[i + 1] : nums[i] / nums[i + 1];
      nums.splice(i + 1, 1);
      ops.splice(i, 1);
    } else i++;
  }
  let r = nums[0];
  for (let j = 0; j < ops.length; j++) {
    r = ops[j] === '+' ? r + nums[j + 1] : r - nums[j + 1];
  }
  return r;
}

function mtenHasSolution(nums) {
  const opsSet = ['+', '-', '×', '÷'];
  for (const perm of mtenPermutations(nums)) {
    for (const o1 of opsSet) for (const o2 of opsSet) for (const o3 of opsSet) {
      const r = mtenEval(perm, [o1, o2, o3]);
      if (r !== null && Math.abs(r - 10) < 1e-9) return true;
    }
  }
  return false;
}

/* ---- UI helpers ---- */
function mtenReset() {
  mtenExprNums = [];
  mtenExprOps = ['+', '+', '+'];
  document.getElementById('mten-message').textContent = '数字を順番にタップ！';
  const confirmBtn = document.getElementById('mten-confirm-btn');
  if (confirmBtn) confirmBtn.style.display = 'none';
  mtenRenderTiles();
  mtenRenderExpr();
}

function mtenRenderTiles() {
  const area = document.getElementById('mten-num-tiles');
  area.innerHTML = '';
  mtenNums.forEach((n, i) => {
    const tile = document.createElement('div');
    tile.className = 'mten-tile' + (mtenExprNums.some(e => e.origIdx === i) ? ' used' : '');
    tile.textContent = n;
    tile.onclick = () => mtenTapTile(i, n);
    area.appendChild(tile);
  });
}

function mtenRenderExpr() {
  const row = document.getElementById('mten-expr-row');
  row.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    // number slot
    const ns = document.createElement('div');
    ns.className = 'mten-nslot' + (i < mtenExprNums.length ? ' filled' : '');
    ns.textContent = i < mtenExprNums.length ? mtenExprNums[i].val : '';
    row.appendChild(ns);
    // operator slot (after each number except last)
    if (i < 3) {
      const os = document.createElement('div');
      os.className = 'mten-oslot';
      os.textContent = mtenExprOps[i];
      os.onclick = () => mtenCycleOp(i);
      row.appendChild(os);
    }
  }
  // = ?
  const eq = document.createElement('div');
  eq.className = 'mten-eq';
  eq.textContent = '=';
  row.appendChild(eq);
  const rv = document.createElement('div');
  rv.id = 'mten-result-val';
  rv.className = 'mten-result-val';
  rv.textContent = '?';
  row.appendChild(rv);

  // Show/hide confirm button
  const confirmBtn = document.getElementById('mten-confirm-btn');
  if (confirmBtn) confirmBtn.style.display = mtenExprNums.length === 4 ? '' : 'none';
}

function mtenTapTile(origIdx, val) {
  if (!mtenRunning) return;
  if (mtenExprNums.some(e => e.origIdx === origIdx)) return; // already used
  if (mtenExprNums.length >= 4) return;
  mtenExprNums.push({ origIdx, val });
  mtenRenderTiles();
  mtenRenderExpr();
}

function mtenCycleOp(i) {
  if (!mtenRunning) return;
  const cycle = ['+', '-', '×', '÷'];
  const cur = cycle.indexOf(mtenExprOps[i]);
  mtenExprOps[i] = cycle[(cur + 1) % 4];
  mtenRenderExpr();
}

function mtenConfirm() {
  if (!mtenRunning || mtenExprNums.length < 4) return;
  document.getElementById('mten-confirm-btn').style.display = 'none';

  const r = mtenEval(mtenExprNums.map(e => e.val), mtenExprOps);
  const rv = document.getElementById('mten-result-val');

  if (r !== null) {
    rv.textContent = Number.isInteger(r) ? r : r.toFixed(2);
    rv.classList.add(Math.abs(r - 10) < 1e-9 ? 'correct' : 'wrong');
  }

  if (r !== null && Math.abs(r - 10) < 1e-9) {
    sfx.correct();
    mtenScore++;
    document.getElementById('mten-score').textContent = mtenScore;
    document.getElementById('mten-message').textContent = '正解！🎉 次の問題へ…';
    const best = parseInt(localStorage.getItem(MTEN_BEST_KEY) || '0');
    if (mtenScore > best) {
      localStorage.setItem(MTEN_BEST_KEY, mtenScore);
      document.getElementById('mten-best').textContent = mtenScore;
      if (typeof refreshBestScores === 'function') refreshBestScores();
    }
    setTimeout(() => { if (mtenRunning) mtenNewPuzzle(); }, 900);
  } else {
    sfx.wrong();
    mtenMistakes++;
    document.getElementById('mten-message').textContent = mtenMistakes >= 3
      ? `10にならない…やり直し (${mtenMistakes}回目)`
      : `10にならない！もう一度試して (${mtenMistakes}回目)`;
    setTimeout(() => {
      if (!mtenRunning) return;
      if (mtenMistakes >= 5) {
        document.getElementById('mten-message').textContent = '次の問題へ…';
        setTimeout(() => { if (mtenRunning) mtenNewPuzzle(); }, 600);
      } else {
        mtenExprNums = [];
        mtenRenderTiles();
        mtenRenderExpr();
        document.getElementById('mten-message').textContent = '数字をタップし直して！';
      }
    }, 1200);
  }
}

function mtenFindSolution(nums) {
  const opsSet = ['+', '-', '×', '÷'];
  for (const perm of mtenPermutations(nums)) {
    for (const o1 of opsSet) for (const o2 of opsSet) for (const o3 of opsSet) {
      const r = mtenEval(perm, [o1, o2, o3]);
      if (r !== null && Math.abs(r - 10) < 1e-9) return { nums: perm, ops: [o1, o2, o3] };
    }
  }
  return null;
}

function mtenShowAnswer() {
  const sol = mtenFindSolution(mtenNums);
  if (!sol) return;
  const expr = `${sol.nums[0]} ${sol.ops[0]} ${sol.nums[1]} ${sol.ops[1]} ${sol.nums[2]} ${sol.ops[2]} ${sol.nums[3]}`;
  document.getElementById('mten-message').textContent = `答え例: ${expr} = 10`;
}

function mtenUndoLast() {
  if (!mtenRunning || mtenExprNums.length === 0) return;
  mtenExprNums.pop();
  mtenRenderTiles();
  mtenRenderExpr();
}

function mtenClearExpr() {
  if (!mtenRunning) return;
  mtenExprNums = [];
  mtenRenderTiles();
  mtenRenderExpr();
  document.getElementById('mten-message').textContent = '数字をタップして！';
}
