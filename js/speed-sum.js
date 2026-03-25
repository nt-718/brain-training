/* ===== スピードサム (speed-sum) ===== */

const SPD_BEST_KEYS = { easy: 'spd_best_easy', normal: 'spd_best_normal', hard: 'spd_best_hard' };
const SPD_TOTAL_TIME = 60;
const SPD_CONFIGS = {
  easy:   { count: [2, 3], min: 1, max: 9 },
  normal: { count: [3, 4], min: 1, max: 20 },
  hard:   { count: [4, 5], min: 1, max: 50 },
};

let spdRunning = false;
let spdScore = 0;
let spdTimeLeft = SPD_TOTAL_TIME;
let spdTimerInterval = null;
let spdDiff = 'easy';
let spdAnswer = 0;
let spdInput = '';

function spdLoadBest() {
  const b = localStorage.getItem(SPD_BEST_KEYS[spdDiff]);
  document.getElementById('spd-best').textContent = b !== null ? b : '0';
}

function spdSetDiff(btn, diff) {
  spdDiff = diff;
  document.querySelectorAll('#spd-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  spdLoadBest();
}

function spdStop() {
  spdRunning = false;
  clearInterval(spdTimerInterval);
  spdTimerInterval = null;
  document.getElementById('spd-start-btn').style.display = '';
  document.getElementById('spd-start-btn').textContent = 'スタート';
  document.getElementById('spd-stage').style.visibility = 'hidden';
  document.getElementById('spd-numpad').style.display = 'none';
  document.getElementById('spd-input').textContent = '?';
  document.getElementById('spd-timer-fill').style.width = '100%';
  document.getElementById('spd-time').textContent = SPD_TOTAL_TIME;
}

function spdStart() {
  spdScore = 0;
  spdTimeLeft = SPD_TOTAL_TIME;
  spdInput = '';
  spdRunning = true;
  document.getElementById('spd-score').textContent = 0;
  document.getElementById('spd-start-btn').style.display = 'none';
  document.getElementById('spd-stage').style.visibility = 'visible';
  document.getElementById('spd-numpad').style.display = 'grid';
  spdLoadBest();

  clearInterval(spdTimerInterval);
  spdTimerInterval = setInterval(() => {
    spdTimeLeft -= 0.1;
    spdUpdateTimer();
    document.getElementById('spd-time').textContent = Math.ceil(spdTimeLeft);
    if (spdTimeLeft <= 0) {
      clearInterval(spdTimerInterval);
      spdTimerInterval = null;
      spdTimeUp();
    }
  }, 100);

  spdNextQuestion();
}

function spdNextQuestion() {
  if (!spdRunning) return;
  const cfg = SPD_CONFIGS[spdDiff];
  const count = rand(cfg.count[0], cfg.count[1]);
  const nums = [];
  for (let i = 0; i < count; i++) nums.push(rand(cfg.min, cfg.max));
  spdAnswer = nums.reduce((a, b) => a + b, 0);
  spdInput = '';
  document.getElementById('spd-input').textContent = '?';

  const el = document.getElementById('spd-numbers');
  el.textContent = nums.join(' + ');
  el.classList.remove('spd-pop');
  void el.offsetWidth;
  el.classList.add('spd-pop');
}

function spdNumpad(val) {
  if (!spdRunning) return;
  if (val === 'del') {
    spdInput = spdInput.slice(0, -1);
    document.getElementById('spd-input').textContent = spdInput || '?';
  } else if (val === 'ok') {
    if (!spdInput) return;
    const ans = parseInt(spdInput);
    if (ans === spdAnswer) {
      sfx.correct();
      spdScore++;
      document.getElementById('spd-score').textContent = spdScore;
      spdNextQuestion();
    } else {
      sfx.wrong();
      const inputEl = document.getElementById('spd-input');
      inputEl.textContent = '✗';
      setTimeout(() => {
        if (spdRunning) {
          spdInput = '';
          inputEl.textContent = '?';
        }
      }, 400);
    }
  } else {
    if (spdInput.length >= 4) return;
    spdInput += val;
    document.getElementById('spd-input').textContent = spdInput;
  }
}

function spdUpdateTimer() {
  const pct = Math.max(0, (spdTimeLeft / SPD_TOTAL_TIME) * 100);
  const fill = document.getElementById('spd-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function spdTimeUp() {
  spdRunning = false;
  document.getElementById('spd-start-btn').style.display = '';
  document.getElementById('spd-start-btn').textContent = 'もう一度';
  document.getElementById('spd-stage').style.visibility = 'hidden';
  document.getElementById('spd-numpad').style.display = 'none';

  const key = SPD_BEST_KEYS[spdDiff];
  const prev = parseInt(localStorage.getItem(key)) || 0;
  const record = spdScore > prev;
  if (record) {
    localStorage.setItem(key, spdScore);
    document.getElementById('spd-best').textContent = spdScore;
  }
  showResult(
    record ? '🏆' : '⏰',
    '時間切れ！',
    `スコア: ${spdScore}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    spdStart
  );
}
