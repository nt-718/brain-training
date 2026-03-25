/* ===== 素数ハント (prime-hunt) ===== */

const PH_BEST_KEYS = { easy: 'ph_best_easy', normal: 'ph_best_normal', hard: 'ph_best_hard' };
const PH_TOTAL_TIME = 60;
const PH_GRID_SIZE = 12;
const PH_RANGES = { easy: [2, 30], normal: [2, 60], hard: [2, 100] };

let phRunning = false;
let phScore = 0;
let phTimeLeft = PH_TOTAL_TIME;
let phTimerInterval = null;
let phDiff = 'easy';
let phPrimesLeft = 0;

function phIsPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
  return true;
}

function phLoadBest() {
  const b = localStorage.getItem(PH_BEST_KEYS[phDiff]);
  document.getElementById('ph-best').textContent = b !== null ? b : '0';
}

function phSetDiff(btn, diff) {
  phDiff = diff;
  document.querySelectorAll('#ph-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  phLoadBest();
}

function phStop() {
  phRunning = false;
  clearInterval(phTimerInterval);
  phTimerInterval = null;
  document.getElementById('ph-start-btn').style.display = '';
  document.getElementById('ph-start-btn').textContent = 'スタート';
  document.getElementById('ph-stage').style.visibility = 'hidden';
  document.getElementById('ph-timer-fill').style.width = '100%';
  document.getElementById('ph-time').textContent = PH_TOTAL_TIME;
  document.getElementById('ph-info').textContent = '素数をタップしよう！';
}

function phStart() {
  phScore = 0;
  phTimeLeft = PH_TOTAL_TIME;
  phRunning = true;
  document.getElementById('ph-score').textContent = 0;
  document.getElementById('ph-start-btn').style.display = 'none';
  document.getElementById('ph-stage').style.visibility = 'visible';
  phLoadBest();

  clearInterval(phTimerInterval);
  phTimerInterval = setInterval(() => {
    phTimeLeft -= 0.1;
    phUpdateTimer();
    document.getElementById('ph-time').textContent = Math.ceil(phTimeLeft);
    if (phTimeLeft <= 0) {
      clearInterval(phTimerInterval);
      phTimerInterval = null;
      phTimeUp();
    }
  }, 100);

  phNextGrid();
}

function phNextGrid() {
  if (!phRunning) return;
  const [min, max] = PH_RANGES[phDiff];

  // Generate grid numbers ensuring at least 3 primes
  let nums = [];
  const used = new Set();
  // First ensure 3-5 primes in the grid
  const targetPrimes = rand(3, 5);
  const allPrimes = [];
  for (let n = min; n <= max; n++) if (phIsPrime(n)) allPrimes.push(n);
  const pickedPrimes = shuffle([...allPrimes]).slice(0, targetPrimes);
  pickedPrimes.forEach(p => { nums.push(p); used.add(p); });

  // Fill rest with non-primes
  while (nums.length < PH_GRID_SIZE) {
    const n = rand(min, max);
    if (!used.has(n)) { nums.push(n); used.add(n); }
  }
  nums = shuffle(nums);
  phPrimesLeft = nums.filter(n => phIsPrime(n)).length;
  phUpdateInfo();

  const grid = document.getElementById('ph-grid');
  grid.innerHTML = '';
  nums.forEach((n, i) => {
    const btn = document.createElement('button');
    btn.className = 'ph-num-btn ph-pop';
    btn.style.animationDelay = (i * 0.04) + 's';
    btn.textContent = n;
    btn.dataset.value = n;
    btn.onclick = () => phTap(btn, n);
    grid.appendChild(btn);
  });
}

function phTap(btn, val) {
  if (!phRunning) return;
  if (phIsPrime(val)) {
    sfx.correct();
    btn.classList.add('ph-tapped-correct');
    phScore++;
    phPrimesLeft--;
    document.getElementById('ph-score').textContent = phScore;
    phUpdateInfo();
    if (phPrimesLeft === 0) {
      setTimeout(() => { if (phRunning) phNextGrid(); }, 400);
    }
  } else {
    sfx.wrong();
    btn.classList.add('ph-tapped-wrong');
    phScore = Math.max(0, phScore - 1);
    document.getElementById('ph-score').textContent = phScore;
  }
}

function phUpdateInfo() {
  document.getElementById('ph-info').textContent = `素数が あと ${phPrimesLeft} 個`;
}

function phUpdateTimer() {
  const pct = Math.max(0, (phTimeLeft / PH_TOTAL_TIME) * 100);
  const fill = document.getElementById('ph-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function phTimeUp() {
  phRunning = false;
  document.getElementById('ph-start-btn').style.display = '';
  document.getElementById('ph-start-btn').textContent = 'もう一度';
  document.getElementById('ph-stage').style.visibility = 'hidden';
  document.getElementById('ph-info').textContent = '素数をタップしよう！';

  const key = PH_BEST_KEYS[phDiff];
  const prev = parseInt(localStorage.getItem(key)) || 0;
  const record = phScore > prev;
  if (record) {
    localStorage.setItem(key, phScore);
    document.getElementById('ph-best').textContent = phScore;
  }
  showResult(
    record ? '🏆' : '⏰',
    '時間切れ！',
    `スコア: ${phScore}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    phStart
  );
}
