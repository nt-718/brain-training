// Arrow Swipe (アローマスター)

var AS_RANKS = [
  { min: 50, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 40, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 30, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 20, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 10, label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 5,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

let asDiff = 'normal';
let asScore = 0;
let asBest = 0;
let asTimer = null;
let asTimeLeft = 30;
let asTotalTime = 30;
let asIsPlaying = false;

let asCurrentDir = ''; // 'up', 'down', 'left', 'right'
let asCurrentColor = ''; // 'blue', 'red'
let asCorrectAnswer = '';

const ARROWS = {
  'up': '↑',
  'down': '↓',
  'left': '←',
  'right': '→'
};

const OPPOSITES = {
  'up': 'down',
  'down': 'up',
  'left': 'right',
  'right': 'left'
};

const savedAsBest = localStorage.getItem('asBest');
if (savedAsBest) {
  asBest = parseInt(savedAsBest, 10);
  const bestEl = document.getElementById('as-best');
  if(bestEl) bestEl.textContent = asBest;
}

function asStart() {
  if (asIsPlaying) return;
  sfx.start();
  
  asScore = 0;
  asTotalTime = 30;
  asTimeLeft = asTotalTime;
  
  document.getElementById('as-score').textContent = asScore;
  document.getElementById('as-message').style.display = 'none';
  document.getElementById('as-start-btn').style.display = 'none';
  
  document.getElementById('as-rule-box').style.display = 'block';
  document.getElementById('as-arrow-box').style.display = 'flex';
  
  asIsPlaying = true;
  asUpdateTimerDisplay();
  asNextRound();
  
  asTimer = setInterval(() => {
    asTimeLeft -= 0.1;
    asUpdateTimerDisplay();
    if (asTimeLeft <= 0) {
      asGameOver();
    }
  }, 100);
}

function asUpdateTimerDisplay() {
  const pct = Math.max(0, (asTimeLeft / asTotalTime) * 100);
  document.getElementById('as-timer-fill').style.width = pct + '%';
  if (pct < 20) {
    document.getElementById('as-timer-fill').style.background = 'linear-gradient(90deg, #f43f5e, #e11d48)';
  } else {
    document.getElementById('as-timer-fill').style.background = 'linear-gradient(90deg, var(--secondary), var(--primary))';
  }
}

function asNextRound() {
  const box = document.getElementById('as-arrow-box');
  
  // Reset animation and classes
  box.className = 'as-arrow-box';
  box.style.opacity = 1;
  box.style.transform = 'none';
  
  const dirs = ['up', 'down', 'left', 'right'];
  asCurrentDir = dirs[Math.floor(Math.random() * dirs.length)];
  
  // 50% chance for red or blue
  const isRed = Math.random() < 0.5;
  asCurrentColor = isRed ? 'red' : 'blue';
  
  if (asCurrentColor === 'blue') {
    asCorrectAnswer = asCurrentDir;
    box.classList.add('as-color-blue');
  } else {
    asCorrectAnswer = OPPOSITES[asCurrentDir];
    box.classList.add('as-color-red');
  }
  
  box.textContent = ARROWS[asCurrentDir];
}

function asAnswer(dir) {
  if (!asIsPlaying) return;
  
  const box = document.getElementById('as-arrow-box');
  
  if (dir === asCorrectAnswer) {
    // Correct
    sfx.correct();
    box.classList.add(`swipe-${dir}`);
    asScore++;
    document.getElementById('as-score').textContent = asScore;
    setTimeout(asNextRound, 150); // Fast transition
  } else {
    // Wrong
    sfx.wrong();
    asTimeLeft -= 2.0; // 2 sec penalty
    
    // Shake animation
    box.style.transform = 'translateX(-10px)';
    setTimeout(() => { box.style.transform = 'translateX(10px)'; }, 40);
    setTimeout(() => { box.style.transform = 'translateX(-10px)'; }, 80);
    setTimeout(() => { box.style.transform = 'translateX(10px)'; }, 120);
    setTimeout(() => { box.style.transform = 'none'; }, 160);
  }
}

// Keyboard controls for desktop
window.addEventListener('keydown', (e) => {
  if (currentScreen === 'arrow-swipe' && asIsPlaying) {
    if (e.key === 'ArrowUp') asAnswer('up');
    if (e.key === 'ArrowDown') asAnswer('down');
    if (e.key === 'ArrowLeft') asAnswer('left');
    if (e.key === 'ArrowRight') asAnswer('right');
  }
});

// Touch controls for mobile
let asTouchStartX = 0;
let asTouchStartY = 0;

document.addEventListener('touchstart', (e) => {
  if (currentScreen !== 'arrow-swipe' || !asIsPlaying) return;
  asTouchStartX = e.touches[0].clientX;
  asTouchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
  if (currentScreen === 'arrow-swipe' && asIsPlaying) {
    if (e.cancelable) e.preventDefault();
  }
}, { passive: false });

document.addEventListener('touchend', (e) => {
  if (currentScreen !== 'arrow-swipe' || !asIsPlaying) return;
  
  const dx = e.changedTouches[0].clientX - asTouchStartX;
  const dy = e.changedTouches[0].clientY - asTouchStartY;
  
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  
  // Need minimum drag distance
  if (Math.max(absDx, absDy) > 40) {
    if (absDx > absDy) {
      asAnswer(dx > 0 ? 'right' : 'left');
    } else {
      asAnswer(dy > 0 ? 'down' : 'up');
    }
  }
});

function asGameOver() {
  clearInterval(asTimer);
  asIsPlaying = false;
  
  if (asScore > asBest) {
    asBest = asScore;
    localStorage.setItem('asBest', asBest.toString());
    const bestEl = document.getElementById('as-best');
    if(bestEl) bestEl.textContent = asBest;
  }
  
  document.getElementById('as-arrow-box').style.display = 'none';
  document.getElementById('as-rule-box').style.display = 'none';
  document.getElementById('as-message').style.display = 'block';
  document.getElementById('as-message').textContent = '終了！';
  
  document.getElementById('as-start-btn').style.display = 'inline-block';
  document.getElementById('as-start-btn').textContent = 'もう一度';
  
  const rank = getScoreRank(asScore, AS_RANKS);
  saveScore('arrow-swipe', 'default', asScore);
  showResult('↗️', 'タイムアップ', `正解数: ${asScore}回`, () => asStart(), rank);
}

function asStop() {
  if (asIsPlaying) {
    clearInterval(asTimer);
    asIsPlaying = false;
    document.getElementById('as-arrow-box').style.display = 'none';
    document.getElementById('as-rule-box').style.display = 'none';
    document.getElementById('as-message').style.display = 'block';
    document.getElementById('as-start-btn').style.display = 'inline-block';
    document.getElementById('as-start-btn').textContent = 'スタート';
  }
}
