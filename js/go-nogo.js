/* ===== GO / NO-GO (go-nogo) ===== */

const GN_BEST_KEY = 'gnBest';

let gnRunning = false;
let gnScore = 0;
let gnMainTimeLeft = 0;
const GN_MAIN_TIME = 30;
let gnMainInterval = null;
let gnItemTimeLeft = 0;
const GN_ITEM_TIME = 1.5;
let gnItemInterval = null;
let gnCurrentItem = null;
let gnIsGo = false;
let gnTapped = false;
let gnRule = null;

const GN_RULES = [
  {
    label: '偶数をタップ！',
    gen() {
      const val = rand(1, 9);
      const isGo = val % 2 === 0;
      return { display: String(val), color: '#fff', isGo };
    }
  },
  {
    label: '5より大きい数をタップ！',
    gen() {
      const val = rand(1, 9);
      const isGo = val > 5;
      return { display: String(val), color: '#fff', isGo };
    }
  },
  {
    label: '動物をタップ！',
    goPool: ['🐶','🐱','🐰','🦊','🐻','🐼','🐨','🐸'],
    nogoPool: ['🍎','🚗','🏠','⭐','🌸','🍕','🎵','🌺'],
    gen() {
      const isGo = Math.random() < 0.45;
      const pool = isGo ? this.goPool : this.nogoPool;
      const display = pool[rand(0, pool.length - 1)];
      return { display, color: '#fff', isGo };
    }
  },
  {
    label: '青い数字をタップ！',
    colors: ['#f43f5e', '#3b82f6', '#10b981', '#facc15'],
    gen() {
      const val = rand(1, 9);
      const colorIdx = rand(0, 3);
      const color = this.colors[colorIdx];
      const isGo = color === '#3b82f6';
      return { display: String(val), color, isGo };
    }
  },
];

function gnLoadBest() {
  const b = localStorage.getItem(GN_BEST_KEY);
  document.getElementById('gn-best').textContent = b !== null ? b : '0';
}

function gnStop() {
  gnRunning = false;
  clearInterval(gnMainInterval);
  clearInterval(gnItemInterval);
  gnMainInterval = null;
  gnItemInterval = null;
  document.getElementById('gn-start-btn').style.display = '';
  document.getElementById('gn-start-btn').textContent = 'スタート';
  document.getElementById('gn-stage').style.visibility = 'hidden';
  document.getElementById('gn-rule-label').textContent = 'ルールに従ってタップしよう！';
  document.getElementById('gn-item-display').textContent = '';
  document.getElementById('gn-item-display').style.color = '#fff';
  document.getElementById('gn-main-timer-fill').style.width = '100%';
  document.getElementById('gn-item-timer-fill').style.width = '100%';
  document.getElementById('gn-main-time').textContent = '30';
}

function gnStart() {
  gnScore = 0;
  gnMainTimeLeft = GN_MAIN_TIME;
  gnRunning = true;
  document.getElementById('gn-score').textContent = 0;
  document.getElementById('gn-start-btn').style.display = 'none';
  document.getElementById('gn-stage').style.visibility = 'visible';
  gnLoadBest();

  // Pick random rule
  gnRule = GN_RULES[rand(0, GN_RULES.length - 1)];
  document.getElementById('gn-rule-label').textContent = gnRule.label;

  // Main game timer
  clearInterval(gnMainInterval);
  gnMainInterval = setInterval(() => {
    gnMainTimeLeft -= 0.1;
    gnUpdateMainTimer();
    document.getElementById('gn-main-time').textContent = Math.ceil(gnMainTimeLeft);
    if (gnMainTimeLeft <= 0) {
      clearInterval(gnMainInterval);
      gnMainInterval = null;
      gnTimeUp();
    }
  }, 100);

  gnNextItem();
}

function gnNextItem() {
  if (!gnRunning) return;
  gnTapped = false;
  const data = gnRule.gen();
  gnCurrentItem = data;
  gnIsGo = data.isGo;

  const displayEl = document.getElementById('gn-item-display');
  displayEl.textContent = data.display;
  displayEl.style.color = data.color;

  // Pop animation
  displayEl.classList.remove('gn-item-pop');
  void displayEl.offsetWidth;
  displayEl.classList.add('gn-item-pop');

  // Item timer
  gnItemTimeLeft = GN_ITEM_TIME;
  gnUpdateItemTimer();
  clearInterval(gnItemInterval);
  gnItemInterval = setInterval(() => {
    gnItemTimeLeft -= 0.05;
    gnUpdateItemTimer();
    if (gnItemTimeLeft <= 0) {
      clearInterval(gnItemInterval);
      gnItemInterval = null;
      gnItemExpired();
    }
  }, 50);
}

function gnItemExpired() {
  if (!gnRunning) return;
  if (gnIsGo && !gnTapped) {
    // Missed a Go item → game over
    gnGameOver('miss');
  } else {
    // Correctly ignored NoGo (or already tapped Go)
    gnNextItem();
  }
}

function gnTap() {
  if (!gnRunning) return;
  if (gnTapped) return; // Already handled

  if (gnIsGo) {
    gnTapped = true;
    gnScore++;
    document.getElementById('gn-score').textContent = gnScore;
    clearInterval(gnItemInterval);
    gnItemInterval = null;
    // Brief feedback
    const displayEl = document.getElementById('gn-item-display');
    displayEl.classList.remove('gn-item-pop');
    void displayEl.offsetWidth;
    displayEl.classList.add('gn-item-correct');
    setTimeout(() => {
      displayEl.classList.remove('gn-item-correct');
      if (gnRunning) gnNextItem();
    }, 300);
  } else {
    // Tapped NoGo → game over
    clearInterval(gnItemInterval);
    gnItemInterval = null;
    gnGameOver('nogo');
  }
}

function gnUpdateMainTimer() {
  const pct = Math.max(0, (gnMainTimeLeft / GN_MAIN_TIME) * 100);
  const fill = document.getElementById('gn-main-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function gnUpdateItemTimer() {
  const pct = Math.max(0, (gnItemTimeLeft / GN_ITEM_TIME) * 100);
  const fill = document.getElementById('gn-item-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function gnTimeUp() {
  gnRunning = false;
  clearInterval(gnMainInterval);
  clearInterval(gnItemInterval);
  gnMainInterval = null;
  gnItemInterval = null;
  document.getElementById('gn-start-btn').style.display = '';
  document.getElementById('gn-start-btn').textContent = 'もう一度';
  document.getElementById('gn-stage').style.visibility = 'hidden';

  const prev = parseInt(localStorage.getItem(GN_BEST_KEY)) || 0;
  const record = gnScore > prev;
  if (record) {
    localStorage.setItem(GN_BEST_KEY, gnScore);
    document.getElementById('gn-best').textContent = gnScore;
  }
  showResult(
    record ? '🏆' : '⏰',
    '時間切れ！',
    `スコア: ${gnScore}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    gnStart
  );
}

function gnGameOver(reason) {
  gnRunning = false;
  clearInterval(gnMainInterval);
  clearInterval(gnItemInterval);
  gnMainInterval = null;
  gnItemInterval = null;
  document.getElementById('gn-start-btn').style.display = '';
  document.getElementById('gn-start-btn').textContent = 'もう一度';
  document.getElementById('gn-stage').style.visibility = 'hidden';

  const prev = parseInt(localStorage.getItem(GN_BEST_KEY)) || 0;
  const record = gnScore > prev;
  if (record) {
    localStorage.setItem(GN_BEST_KEY, gnScore);
    document.getElementById('gn-best').textContent = gnScore;
  }

  const icon = record ? '🏆' : '🚦';
  const title = reason === 'nogo' ? 'NoGo をタップ！' : 'Goを見逃した！';
  showResult(
    icon,
    title,
    `スコア: ${gnScore}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    gnStart
  );
}
