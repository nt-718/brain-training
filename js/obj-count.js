/* ===== 個数カウント (obj-count) ===== */

var OC_RANKS = [
  { min: 10, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 9,  label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 8,  label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 7,  label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 5,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 3,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const OC_BEST_KEYS = { easy: 'oc_best_easy', normal: 'oc_best_normal', hard: 'oc_best_hard' };
const OC_TOTAL_Q = 10;
const OC_CONFIGS = {
  easy:   { min: 3,  max: 7,  showMs: 1500, icons: ['⭐', '🔴', '🟡', '🟢', '🔵'] },
  normal: { min: 5,  max: 12, showMs: 1000, icons: ['⭐', '🔴', '🟡', '🟢', '🔵', '🟣', '🟠'] },
  hard:   { min: 8,  max: 20, showMs: 600,  icons: ['⭐', '🔴', '🟡', '🟢', '🔵', '🟣', '🟠', '⚪', '🔶', '🔷'] },
};

let ocRunning = false;
let ocScore = 0;
let ocQNum = 0;
let ocAnswer = 0;
let ocDiff = 'easy';
let ocInput = '';
let ocPhase = 'idle'; // idle | showing | answering
let ocShowTimeout = null;

function ocLoadBest() {
  const b = localStorage.getItem(OC_BEST_KEYS[ocDiff]);
  document.getElementById('oc-best').textContent = b !== null ? b : '0';
}

function ocSetDiff(btn, diff) {
  ocDiff = diff;
  document.querySelectorAll('#oc-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  ocLoadBest();
}

function ocStop() {
  ocRunning = false;
  clearTimeout(ocShowTimeout);
  ocShowTimeout = null;
  ocPhase = 'idle';
  document.getElementById('oc-start-btn').style.display = '';
  document.getElementById('oc-start-btn').textContent = 'スタート';
  document.getElementById('oc-input').style.display = 'none';
  document.getElementById('oc-numpad').style.display = 'none';
  document.getElementById('oc-grid').innerHTML = '';
  document.getElementById('oc-message').textContent = 'スタートを押してください';
  document.getElementById('oc-q-num').textContent = `0/${OC_TOTAL_Q}`;
}

function ocStart() {
  ocScore = 0;
  ocQNum = 0;
  ocRunning = true;
  ocPhase = 'idle';
  document.getElementById('oc-score').textContent = 0;
  document.getElementById('oc-q-num').textContent = `0/${OC_TOTAL_Q}`;
  document.getElementById('oc-start-btn').style.display = 'none';
  ocLoadBest();
  ocNextQuestion();
}

function ocNextQuestion() {
  if (!ocRunning) return;
  if (ocQNum >= OC_TOTAL_Q) { ocFinish(); return; }

  ocQNum++;
  ocInput = '';
  ocPhase = 'showing';
  document.getElementById('oc-q-num').textContent = `${ocQNum}/${OC_TOTAL_Q}`;
  document.getElementById('oc-input').style.display = 'none';
  document.getElementById('oc-numpad').style.display = 'none';

  const cfg = OC_CONFIGS[ocDiff];
  const count = rand(cfg.min, cfg.max);
  ocAnswer = count;

  // Pick a random icon type for this round
  const icon = cfg.icons[rand(0, cfg.icons.length - 1)];

  const grid = document.getElementById('oc-grid');
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'oc-item';
    span.style.animationDelay = (i * 0.03) + 's';
    span.textContent = icon;
    grid.appendChild(span);
  }
  document.getElementById('oc-message').textContent = '何個あった？';

  // Hide after showMs
  clearTimeout(ocShowTimeout);
  ocShowTimeout = setTimeout(() => {
    if (!ocRunning) return;
    // Fade out
    grid.querySelectorAll('.oc-item').forEach(el => el.classList.add('oc-hide'));
    setTimeout(() => {
      if (!ocRunning) return;
      grid.innerHTML = '';
      ocPhase = 'answering';
      document.getElementById('oc-message').textContent = '個数を入力してください';
      document.getElementById('oc-input').style.display = '';
      document.getElementById('oc-input').textContent = '?';
      document.getElementById('oc-numpad').style.display = 'grid';
    }, 260);
  }, cfg.showMs);
}

function ocNumpad(val) {
  if (!ocRunning || ocPhase !== 'answering') return;
  if (val === 'del') {
    ocInput = ocInput.slice(0, -1);
    document.getElementById('oc-input').textContent = ocInput || '?';
  } else if (val === 'ok') {
    if (!ocInput) return;
    const ans = parseInt(ocInput);
    const correct = ans === ocAnswer;
    if (correct) {
      sfx.correct();
      ocScore++;
      document.getElementById('oc-score').textContent = ocScore;
      document.getElementById('oc-message').textContent = `⭕ 正解！（${ocAnswer}個）`;
    } else {
      sfx.wrong();
      document.getElementById('oc-message').textContent = `✗ 不正解（正解: ${ocAnswer}個）`;
    }
    document.getElementById('oc-input').style.display = 'none';
    document.getElementById('oc-numpad').style.display = 'none';
    ocPhase = 'idle';
    setTimeout(() => { if (ocRunning) ocNextQuestion(); }, 900);
  } else {
    if (ocInput.length >= 3) return;
    ocInput += val;
    document.getElementById('oc-input').textContent = ocInput;
  }
}

function ocFinish() {
  ocRunning = false;
  document.getElementById('oc-start-btn').style.display = '';
  document.getElementById('oc-start-btn').textContent = 'もう一度';
  document.getElementById('oc-input').style.display = 'none';
  document.getElementById('oc-numpad').style.display = 'none';

  const key = OC_BEST_KEYS[ocDiff];
  const prev = parseInt(localStorage.getItem(key)) || 0;
  const record = ocScore > prev;
  if (record) {
    localStorage.setItem(key, ocScore);
    document.getElementById('oc-best').textContent = ocScore;
  }
  const rank = getScoreRank(ocScore, OC_RANKS);
  saveScore('obj-count', ocDiff, ocScore);
  showResult(
    record ? '🏆' : '🎯',
    '結果発表！',
    `正解数: ${ocScore} / ${OC_TOTAL_Q}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    ocStart,
    rank
  );
}
