/* ===== レース順位 (race-pos) ===== */

var RP_RANKS = [
  { min: 10, label: '伝説',         emoji: '👑', color: '#f59e0b' },
  { min: 8,  label: '達人',         emoji: '🏆', color: '#8b5cf6' },
  { min: 6,  label: 'エキスパート',  emoji: '💫', color: '#3b82f6' },
  { min: 4,  label: '上級者',       emoji: '⭐', color: '#10b981' },
  { min: 2,  label: '見習い',       emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',     emoji: '🌱', color: '#64748b' },
];

const RP_BEST_KEY_EASY   = 'rp_best_easy';
const RP_BEST_KEY_NORMAL = 'rp_best_normal';
const RP_BEST_KEY_HARD   = 'rp_best_hard';

const RP_DIFF_CFG = {
  easy:   { rounds: 10, events: 3, runners: 10, maxChange: 2 },
  normal: { rounds: 10, events: 5, runners: 15, maxChange: 3 },
  hard:   { rounds: 10, events: 8, runners: 20, maxChange: 5 },
};

let rpDiff = 'normal';
let rpScore = 0;
let rpRound = 0;
let rpRunning = false;
let rpCurrentPos = 0;
let rpTotalRunners = 0;
let rpEvents = [];
let rpInput = '';
let rpShowTimer = null;

function rpBestKey() {
  return { easy: RP_BEST_KEY_EASY, normal: RP_BEST_KEY_NORMAL, hard: RP_BEST_KEY_HARD }[rpDiff];
}

function rpSetDiff(el, diff) {
  rpDiff = diff;
  document.querySelectorAll('#rp-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  rpLoadBest();
}

function rpLoadBest() {
  const b = localStorage.getItem(rpBestKey());
  document.getElementById('rp-best').textContent = b !== null ? b : '0';
}

function rpStop() {
  rpRunning = false;
  if (rpShowTimer) { clearTimeout(rpShowTimer); rpShowTimer = null; }
  document.getElementById('rp-start-btn').style.display = '';
  document.getElementById('rp-start-btn').textContent = 'スタート';
  document.getElementById('rp-stage').style.display = 'none';
  document.getElementById('rp-numpad-wrap').style.display = 'none';
}

function rpStart() {
  rpScore = 0;
  rpRound = 0;
  rpRunning = true;
  document.getElementById('rp-score').textContent = 0;
  document.getElementById('rp-round').textContent = '0/10';
  document.getElementById('rp-start-btn').style.display = 'none';
  document.getElementById('rp-stage').style.display = '';
  document.getElementById('rp-numpad-wrap').style.display = 'none';
  rpLoadBest();
  rpNextRound();
}

function rpNextRound() {
  if (!rpRunning) return;
  const cfg = RP_DIFF_CFG[rpDiff];
  rpRound++;
  document.getElementById('rp-round').textContent = `${rpRound}/10`;

  rpTotalRunners = cfg.runners;
  let pos = rand(2, rpTotalRunners - 1);
  const startPos = pos;

  rpEvents = [];
  for (let i = 0; i < cfg.events; i++) {
    const canImprove = pos > 1;
    const canWorsen  = pos < rpTotalRunners;

    let isOvertake;
    if (!canImprove) isOvertake = false;
    else if (!canWorsen) isOvertake = true;
    else isOvertake = Math.random() < 0.5;

    if (isOvertake) {
      const n = rand(1, Math.min(cfg.maxChange, pos - 1));
      rpEvents.push({ type: 'overtake', n });
      pos -= n;
    } else {
      const n = rand(1, Math.min(cfg.maxChange, rpTotalRunners - pos));
      rpEvents.push({ type: 'overtaken', n });
      pos += n;
    }
  }
  rpCurrentPos = pos;

  rpShowSequence(startPos);
}

function rpShowSequence(startPos) {
  if (!rpRunning) return;
  document.getElementById('rp-numpad-wrap').style.display = 'none';
  rpInput = '';

  let step = 0;
  // step 0: show start position
  // step 1..n: show events
  // step n+1: ask answer

  const showStep = () => {
    if (!rpRunning) return;

    const el = document.getElementById('rp-event-display');

    if (step === 0) {
      el.className = 'rp-event-display rp-start';
      el.innerHTML =
        `<div class="rp-event-icon">🏁</div>` +
        `<div class="rp-event-text">${startPos}位から<br>スタート！</div>` +
        `<div class="rp-event-sub">全${rpTotalRunners}人</div>`;
      void el.offsetWidth;
      el.classList.add('rp-anim');
      step++;
      rpShowTimer = setTimeout(showStep, 1600);
    } else if (step <= rpEvents.length) {
      const ev = rpEvents[step - 1];
      el.className = ev.type === 'overtake' ? 'rp-event-display rp-overtake' : 'rp-event-display rp-overtaken';
      if (ev.type === 'overtake') {
        el.innerHTML =
          `<div class="rp-event-icon">🏃</div>` +
          `<div class="rp-event-text">${ev.n}人<br>抜いた！</div>`;
      } else {
        el.innerHTML =
          `<div class="rp-event-icon">💨</div>` +
          `<div class="rp-event-text">${ev.n}人に<br>抜かれた</div>`;
      }
      void el.offsetWidth;
      el.classList.add('rp-anim');
      step++;
      rpShowTimer = setTimeout(showStep, 1300);
    } else {
      // Ask for the answer
      el.className = 'rp-event-display rp-question';
      el.innerHTML =
        `<div class="rp-event-icon">🤔</div>` +
        `<div class="rp-event-text">最終順位は？</div>`;
      void el.offsetWidth;
      el.classList.add('rp-anim');
      document.getElementById('rp-answer-display').textContent = '?';
      document.getElementById('rp-numpad-wrap').style.display = '';
    }
  };

  showStep();
}

function rpNumpad(val) {
  if (!rpRunning) return;
  if (val === 'del') {
    rpInput = rpInput.slice(0, -1);
    document.getElementById('rp-answer-display').textContent = rpInput || '?';
  } else if (val === 'ok') {
    if (!rpInput) return;
    rpCheckAnswer(parseInt(rpInput, 10));
  } else {
    if (rpInput.length >= 2) return;
    rpInput += val;
    document.getElementById('rp-answer-display').textContent = rpInput;
  }
}

function rpCheckAnswer(answer) {
  document.getElementById('rp-numpad-wrap').style.display = 'none';
  const correct = answer === rpCurrentPos;

  const el = document.getElementById('rp-event-display');
  if (correct) {
    sfx.correct();
    rpScore++;
    document.getElementById('rp-score').textContent = rpScore;
    el.className = 'rp-event-display rp-result-ok';
    el.innerHTML =
      `<div class="rp-event-icon">✅</div>` +
      `<div class="rp-event-text">正解！<br>${rpCurrentPos}位</div>`;
  } else {
    sfx.wrong();
    el.className = 'rp-event-display rp-result-ng';
    el.innerHTML =
      `<div class="rp-event-icon">❌</div>` +
      `<div class="rp-event-text">不正解<br>正解は${rpCurrentPos}位</div>`;
  }
  void el.offsetWidth;
  el.classList.add('rp-anim');

  rpShowTimer = setTimeout(() => {
    if (!rpRunning) return;
    if (rpRound >= 10) {
      rpGameEnd();
    } else {
      rpNextRound();
    }
  }, 1500);
}

function rpGameEnd() {
  rpRunning = false;
  document.getElementById('rp-start-btn').style.display = '';
  document.getElementById('rp-start-btn').textContent = 'もう一度';
  document.getElementById('rp-stage').style.display = 'none';
  document.getElementById('rp-numpad-wrap').style.display = 'none';

  const key = rpBestKey();
  const prev = parseInt(localStorage.getItem(key)) || 0;
  const record = rpScore > prev;
  if (record) {
    localStorage.setItem(key, rpScore);
    document.getElementById('rp-best').textContent = rpScore;
  }
  const rank = getScoreRank(rpScore, RP_RANKS);
  saveScore('race-pos', rpDiff, rpScore);
  showResult(
    record ? '🏆' : '🏁',
    'レース終了！',
    `正解: ${rpScore}/10\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    rpStart,
    rank
  );
}
