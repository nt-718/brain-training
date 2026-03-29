const omState = {
  playing: false,
  phase: 'idle', // 'idle', 'memorize', 'input', 'result'
  difficulty: 'easy',
  timer: null,
  memorizeTimer: null,
  timeLeft: 0,
  score: 0,
  currentOtp: '',
  userInput: ''
};

// Length configurations
const OM_CONFIG = {
  easy: { length: 4, type: 'numeric' },
  normal: { length: 6, type: 'numeric' },
  hard: { length: 8, type: 'alphanumeric' }
};

var OM_RANKS = [
  { min: 25, label: 'S', emoji: '👑', color: '#ff4b4b' },
  { min: 20, label: 'A', emoji: '💎', color: '#ff7eb3' },
  { min: 15, label: 'B', emoji: '🥇', color: '#ffd700' },
  { min: 10, label: 'C', emoji: '🥈', color: '#c0c0c0' },
  { min: 5,  label: 'D', emoji: '🥉', color: '#cd7f32' },
  { min: 0,  label: 'E', emoji: '🌱', color: '#a0a0a0' }
];

function omSetDiff(btn, diff) {
  if (omState.playing) return;
  sfx.tap();
  document.querySelectorAll('#om-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  omState.difficulty = diff;
  omUpdateBestDisplay();
}

function omUpdateBestDisplay() {
  const key = `om_best_${omState.difficulty}`;
  const best = localStorage.getItem(key) || 0;
  document.getElementById('om-best').textContent = best;
}

function omGenerateOtp() {
  const cfg = OM_CONFIG[omState.difficulty];
  let otp = '';
  if (cfg.type === 'numeric') {
    for (let i=0; i<cfg.length; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
  } else {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i=0; i<cfg.length; i++) {
      otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return otp;
}

function omBtnAction() {
  if (omState.phase === 'idle') {
    omStart();
  } else if (omState.phase === 'memorize') {
    omStartAnswer();
  }
}

function omStart() {
  sfx.start();
  omState.playing = true;
  omState.score = 0;
  omState.timeLeft = 60000;
  document.getElementById('om-score').textContent = '0';
  document.getElementById('om-diff-row').style.pointerEvents = 'none';
  document.getElementById('om-diff-row').style.opacity = '0.5';

  if (omState.difficulty === 'hard') {
    document.getElementById('om-numpad').style.display = 'none';
    document.getElementById('om-keyboard').style.display = 'grid';
  } else {
    document.getElementById('om-numpad').style.display = 'grid';
    document.getElementById('om-keyboard').style.display = 'none';
  }

  // Next round
  omNextRound();

  // Start fixed loop timer
  const lastTime = performance.now();
  omState.timer = setInterval(() => {
    omState.timeLeft -= 100;
    if (omState.timeLeft <= 0) {
      omState.timeLeft = 0;
      omEndGame();
    }
    const ratio = omState.timeLeft / 60000;
    document.getElementById('om-timer-fill').style.width = (ratio * 100) + '%';
  }, 100);
}

function omNextRound() {
  omState.currentOtp = omGenerateOtp();
  omState.userInput = '';
  omState.phase = 'memorize';
  
  document.getElementById('om-otp-display').textContent = omState.currentOtp;
  document.getElementById('om-otp-display').style.color = 'var(--text-color)';
  document.getElementById('om-message').textContent = '覚えたら回答開始を押してね';
  
  document.getElementById('om-numpad').style.pointerEvents = 'none';
  document.getElementById('om-numpad').style.opacity = '0.5';
  document.getElementById('om-keyboard').style.pointerEvents = 'none';
  document.getElementById('om-keyboard').style.opacity = '0.5';

  const actBtn = document.getElementById('om-act-btn');
  actBtn.textContent = '回答開始';
  actBtn.style.display = 'block';
  actBtn.className = 'btn-primary'; // reset any warning classes

  clearTimeout(omState.memorizeTimer);
  omState.memorizeTimer = setTimeout(() => {
    if (omState.phase === 'memorize' && omState.playing) {
      omStartAnswer();
    }
  }, 5000);
}

function omStartAnswer() {
  clearTimeout(omState.memorizeTimer);
  sfx.tap();
  omState.phase = 'input';
  document.getElementById('om-otp-display').textContent = '';
  document.getElementById('om-message').textContent = '入力してください';

  document.getElementById('om-numpad').style.pointerEvents = 'auto';
  document.getElementById('om-numpad').style.opacity = '1';
  document.getElementById('om-keyboard').style.pointerEvents = 'auto';
  document.getElementById('om-keyboard').style.opacity = '1';

  document.getElementById('om-act-btn').style.display = 'none';
  omUpdateDisplayLimit();
}

function omInput(val) {
  if (omState.phase !== 'input') return;
  sfx.tap();
  if (val === 'del') {
    omState.userInput = omState.userInput.slice(0, -1);
  } else {
    if (omState.userInput.length < OM_CONFIG[omState.difficulty].length * 2) {
      omState.userInput += val;
    }
  }
  omUpdateDisplayLimit();
}

function omUpdateDisplayLimit() {
  const len = OM_CONFIG[omState.difficulty].length;
  // Let's show blanks for missing characters to help them know how many they typed?
  // Let's just show what they typed, or pad with underscores.
  let showStr = omState.userInput;
  if (showStr.length === 0) {
    document.getElementById('om-otp-display').innerHTML = '<span style="color:var(--text-muted)">?</span>';
  } else {
    document.getElementById('om-otp-display').textContent = showStr;
  }
}

function omSubmit() {
  if (omState.phase !== 'input') return;
  if (!omState.userInput) return;
  
  if (omState.userInput === omState.currentOtp) {
    sfx.correct();
    omState.score++;
    document.getElementById('om-score').textContent = omState.score;
    document.getElementById('om-otp-display').style.color = 'var(--success)';
    omState.phase = 'result'; // briefly wait
    setTimeout(() => {
      if (omState.playing) omNextRound();
    }, 400);
  } else {
    sfx.wrong();
    document.getElementById('om-otp-display').textContent = omState.currentOtp;
    document.getElementById('om-otp-display').style.color = 'var(--danger)';
    document.getElementById('om-message').textContent = '間違い！';
    omState.phase = 'result';
    setTimeout(() => {
      if (omState.playing) omNextRound();
    }, 800);
  }
}

function omEndGame() {
  omStop();
  
  const key = `om_best_${omState.difficulty}`;
  const best = parseInt(localStorage.getItem(key) || '0', 10);
  let isNewBest = false;
  if (omState.score > best) {
    localStorage.setItem(key, omState.score);
    isNewBest = true;
  }
  
  const diffLabel = omState.difficulty === 'easy' ? 'かんたん' : omState.difficulty === 'normal' ? 'ふつう' : 'むずかしい';
  const detail = `難易度: ${diffLabel}\nスコア: ${omState.score}問\n${isNewBest ? '🎉 ベストスコア更新！' : `(ベスト: ${Math.max(best, omState.score)}問)`}`;
  
  // Note: OM_RANKS needs to be defined in main.js, we will just pass rank if OM_RANKS exists.
  let rank = null;
  if (window.OM_RANKS) {
    rank = getScoreRank(omState.score, window.OM_RANKS);
  }
  
  showResult('🔐', 'タイムアップ！', detail, omStart, rank);
  refreshBestScores(); // From main.js
}

function omStop() {
  omState.playing = false;
  omState.phase = 'idle';
  clearInterval(omState.timer);
  clearTimeout(omState.memorizeTimer);
  document.getElementById('om-diff-row').style.pointerEvents = 'auto';
  document.getElementById('om-diff-row').style.opacity = '1';
  document.getElementById('om-timer-fill').style.width = '100%';
  
  document.getElementById('om-act-btn').textContent = 'スタート';
  document.getElementById('om-act-btn').style.display = 'block';
  document.getElementById('om-act-btn').className = 'btn-primary';
  document.getElementById('om-otp-display').textContent = '******';
  document.getElementById('om-otp-display').style.color = 'var(--text-color)';
  document.getElementById('om-message').textContent = 'スタートを押してください';

  document.getElementById('om-numpad').style.display = 'none';
  document.getElementById('om-keyboard').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  omUpdateBestDisplay();
});
