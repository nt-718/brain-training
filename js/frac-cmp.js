/* ===== 分数比較 (frac-cmp) ===== */

const FCMP_BEST_KEYS = { easy: 'fcmp_best_easy', normal: 'fcmp_best_normal', hard: 'fcmp_best_hard' };
const FCMP_TOTAL_TIME = 60;

let fcmpRunning = false;
let fcmpScore = 0;
let fcmpTimeLeft = FCMP_TOTAL_TIME;
let fcmpTimerInterval = null;
let fcmpDiff = 'easy';
let fcmpAnswer = ''; // '>' | '<' | '='
let fcmpAnswered = false;

function fcmpLoadBest() {
  const b = localStorage.getItem(FCMP_BEST_KEYS[fcmpDiff]);
  document.getElementById('fcmp-best').textContent = b !== null ? b : '0';
}

function fcmpSetDiff(btn, diff) {
  fcmpDiff = diff;
  document.querySelectorAll('#fcmp-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  fcmpLoadBest();
}

function fcmpStop() {
  fcmpRunning = false;
  clearInterval(fcmpTimerInterval);
  fcmpTimerInterval = null;
  document.getElementById('fcmp-start-btn').style.display = '';
  document.getElementById('fcmp-start-btn').textContent = 'スタート';
  document.getElementById('fcmp-stage').style.visibility = 'hidden';
  document.getElementById('fcmp-btns').style.display = 'none';
  document.getElementById('fcmp-timer-fill').style.width = '100%';
  document.getElementById('fcmp-time').textContent = FCMP_TOTAL_TIME;
}

function fcmpGenQuestion() {
  // Generate two fractions a/b and c/d
  // diff controls denominator range and how close values are
  const cfg = {
    easy:   { denMax: 8,  closeRatio: false },
    normal: { denMax: 12, closeRatio: false },
    hard:   { denMax: 20, closeRatio: true  },
  }[fcmpDiff];

  let a, b, c, d;
  // Occasionally generate equal fractions (25% chance)
  if (Math.random() < 0.25) {
    b = rand(2, cfg.denMax);
    d = rand(2, cfg.denMax);
    // a/b = c/d → a*d = c*b
    const numA = rand(1, b - 1);
    a = numA;
    // Find c such that c/d = a/b: c = a*d/b — may not be integer
    // Instead: pick a common fraction p/q in lowest terms and scale
    const g = gcd(b, d);
    const lcm_bd = (b * d) / g;
    // a/b = (a * lcm/b) / lcm
    const scaled = (a * lcm_bd) / b;
    c = scaled / (lcm_bd / d);
    if (!Number.isInteger(c) || c < 1) {
      // Fallback to non-equal
      return fcmpGenUnequal(cfg);
    }
    return { a, b, c, d, answer: '=' };
  }
  return fcmpGenUnequal(cfg);
}

function fcmpGenUnequal(cfg) {
  let a, b, c, d, answer;
  for (let attempt = 0; attempt < 20; attempt++) {
    b = rand(2, cfg.denMax);
    d = rand(2, cfg.denMax);
    a = rand(1, b - 1);
    c = rand(1, d - 1);
    if (cfg.closeRatio) {
      // Force close values: |a/b - c/d| < 0.15
      const diff = Math.abs(a / b - c / d);
      if (diff >= 0.15) continue;
      if (diff === 0) continue;
    }
    if (a / b !== c / d) {
      answer = a / b > c / d ? '>' : '<';
      return { a, b, c, d, answer };
    }
  }
  // Safe fallback
  return { a: 1, b: 3, c: 1, d: 4, answer: '>' };
}

function gcd(x, y) {
  return y === 0 ? x : gcd(y, x % y);
}

function fcmpStart() {
  fcmpScore = 0;
  fcmpTimeLeft = FCMP_TOTAL_TIME;
  fcmpRunning = true;
  fcmpAnswered = false;
  document.getElementById('fcmp-score').textContent = 0;
  document.getElementById('fcmp-start-btn').style.display = 'none';
  document.getElementById('fcmp-stage').style.visibility = 'visible';
  document.getElementById('fcmp-btns').style.display = 'flex';
  fcmpLoadBest();

  clearInterval(fcmpTimerInterval);
  fcmpTimerInterval = setInterval(() => {
    fcmpTimeLeft -= 0.1;
    fcmpUpdateTimer();
    document.getElementById('fcmp-time').textContent = Math.ceil(fcmpTimeLeft);
    if (fcmpTimeLeft <= 0) {
      clearInterval(fcmpTimerInterval);
      fcmpTimerInterval = null;
      fcmpTimeUp();
    }
  }, 100);

  fcmpNextQuestion();
}

function fcmpNextQuestion() {
  if (!fcmpRunning) return;
  fcmpAnswered = false;
  fcmpDisableBtns(false);

  const q = fcmpGenQuestion();
  fcmpAnswer = q.answer;

  document.getElementById('fcmp-a').textContent = q.a;
  document.getElementById('fcmp-b').textContent = q.b;
  document.getElementById('fcmp-c').textContent = q.c;
  document.getElementById('fcmp-d').textContent = q.d;

  const stage = document.getElementById('fcmp-stage');
  stage.className = 'fcmp-stage';
  void stage.offsetWidth;
  stage.classList.add('fcmp-pop');
}

function fcmpTap(op) {
  if (!fcmpRunning || fcmpAnswered) return;
  fcmpAnswered = true;
  fcmpDisableBtns(true);

  const stage = document.getElementById('fcmp-stage');
  stage.classList.remove('fcmp-pop');

  if (op === fcmpAnswer) {
    sfx.correct();
    fcmpScore++;
    document.getElementById('fcmp-score').textContent = fcmpScore;
    stage.classList.add('fcmp-flash-correct');
    setTimeout(() => { if (fcmpRunning) fcmpNextQuestion(); }, 380);
  } else {
    sfx.wrong();
    stage.classList.add('fcmp-flash-wrong');
    setTimeout(() => { if (fcmpRunning) fcmpNextQuestion(); }, 520);
  }
}

function fcmpDisableBtns(disabled) {
  document.querySelectorAll('.fcmp-btn').forEach(b => b.disabled = disabled);
}

function fcmpUpdateTimer() {
  const pct = Math.max(0, (fcmpTimeLeft / FCMP_TOTAL_TIME) * 100);
  const fill = document.getElementById('fcmp-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function fcmpTimeUp() {
  fcmpRunning = false;
  document.getElementById('fcmp-start-btn').style.display = '';
  document.getElementById('fcmp-start-btn').textContent = 'もう一度';
  document.getElementById('fcmp-stage').style.visibility = 'hidden';
  document.getElementById('fcmp-btns').style.display = 'none';

  const key = FCMP_BEST_KEYS[fcmpDiff];
  const prev = parseInt(localStorage.getItem(key)) || 0;
  const record = fcmpScore > prev;
  if (record) {
    localStorage.setItem(key, fcmpScore);
    document.getElementById('fcmp-best').textContent = fcmpScore;
  }
  showResult(
    record ? '🏆' : '⏰',
    '時間切れ！',
    `スコア: ${fcmpScore}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    fcmpStart
  );
}
