// Swipe Sort

let ssDiff = 'easy';
let ssScore = 0;
let ssBest = 0;
let ssTimer = null;
let ssTimeLeft = 30;
let ssTotalTime = 30;
let ssIsPlaying = false;

let ssCurrentCorrect = ''; // 'left' or 'right'

const savedSsBest = localStorage.getItem('ssBest');
if (savedSsBest) {
  ssBest = parseInt(savedSsBest, 10);
  document.getElementById('ss-best').textContent = ssBest;
}

function ssSetDiff(btn, diff) {
  if (ssIsPlaying) return;
  document.querySelectorAll('#ss-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  ssDiff = diff;
}

function ssStart() {
  if (ssIsPlaying) return;
  
  ssScore = 0;
  ssTotalTime = ssDiff === 'easy' ? 45 : (ssDiff === 'normal' ? 60 : 75);
  ssTimeLeft = ssTotalTime;
  
  document.getElementById('ss-score').textContent = ssScore;
  document.getElementById('ss-message').style.display = 'none';
  document.getElementById('ss-start-btn').style.display = 'none';
  
  document.getElementById('ss-rule').style.display = 'block';
  document.getElementById('ss-card').style.display = 'flex';
  document.getElementById('ss-actions').style.display = 'flex';
  
  ssIsPlaying = true;
  ssUpdateTimerDisplay();
  ssNextRound();
  
  ssTimer = setInterval(() => {
    ssTimeLeft -= 0.1;
    ssUpdateTimerDisplay();
    if (ssTimeLeft <= 0) {
      ssGameOver();
    }
  }, 100);
}

function ssUpdateTimerDisplay() {
  const pct = Math.max(0, (ssTimeLeft / ssTotalTime) * 100);
  document.getElementById('ss-timer-fill').style.width = pct + '%';
  if (pct < 20) {
    document.getElementById('ss-timer-fill').style.background = 'linear-gradient(90deg, #f43f5e, #e11d48)';
  } else {
    document.getElementById('ss-timer-fill').style.background = 'linear-gradient(90deg, var(--secondary), var(--primary))';
  }
}

function ssNextRound() {
  const card = document.getElementById('ss-card');
  const ruleEl = document.getElementById('ss-rule');
  
  card.className = 'ss-card'; // reset animation classes
  card.style.opacity = 1;
  card.style.transform = 'none';
  
  let val = '';
  let color = '#ffffff';
  
  if (ssDiff === 'easy') {
    // Number only. Left=Odd, Right=Even
    ruleEl.textContent = "奇数(←) / 偶数(→)";
    const n = rand(1, 99);
    val = n.toString();
    ssCurrentCorrect = (n % 2 !== 0) ? 'left' : 'right';
    
  } else if (ssDiff === 'normal') {
    // Colors. Left=Blue, Right=Red
    ruleEl.textContent = "青色(←) / 赤色(→)";
    const isRed = Math.random() < 0.5;
    color = isRed ? '#f87171' : '#60a5fa'; // flat colors
    val = '●';
    ssCurrentCorrect = isRed ? 'right' : 'left';
    
  } else {
    // Hard: Mix of number and color matching
    const testType = Math.random() < 0.5 ? 'number' : 'color';
    const n = rand(1, 99);
    const isRed = Math.random() < 0.5;
    
    val = n.toString();
    color = isRed ? '#f87171' : '#60a5fa';
    
    if (testType === 'number') {
      ruleEl.innerHTML = "<span style='color:var(--accent)'>数字</span>で判断: 奇数(←) / 偶数(→)";
      ssCurrentCorrect = (n % 2 !== 0) ? 'left' : 'right';
    } else {
      ruleEl.innerHTML = "<span style='color:var(--secondary)'>色</span>で判断: 青(←) / 赤(→)";
      ssCurrentCorrect = isRed ? 'right' : 'left';
    }
  }
  
  card.textContent = val;
  card.style.color = color;
  card.style.borderColor = color !== '#ffffff' ? color : 'var(--card-border)';
}

function ssAnswer(dir) {
  if (!ssIsPlaying) return;
  
  const card = document.getElementById('ss-card');
  
  if (dir === ssCurrentCorrect) {
    // Correct
    card.classList.add(dir === 'left' ? 'swipe-left' : 'swipe-right');
    ssScore++;
    document.getElementById('ss-score').textContent = ssScore;
    setTimeout(ssNextRound, 250); // wait for animation
  } else {
    // Wrong
    ssTimeLeft -= 2.0; // penalty
    
    // shake card
    card.style.transform = 'translateX(-10px)';
    card.style.borderColor = '#ef4444';
    setTimeout(() => { card.style.transform = 'translateX(10px)'; }, 50);
    setTimeout(() => { card.style.transform = 'translateX(-10px)'; }, 100);
    setTimeout(() => { card.style.transform = 'translateX(10px)'; }, 150);
    setTimeout(() => { card.style.transform = 'none'; card.style.borderColor = 'var(--card-border)'; }, 200);
  }
}

window.addEventListener('keydown', (e) => {
  if (currentScreen === 'swipe-sort' && ssIsPlaying) {
    if (e.key === 'ArrowLeft') ssAnswer('left');
    if (e.key === 'ArrowRight') ssAnswer('right');
  }
});

// Touch swipe support
let ssTouchStartX = 0;
let ssTouchStartY = 0;
document.addEventListener('touchstart', (e) => {
  if (currentScreen !== 'swipe-sort' || !ssIsPlaying) return;
  ssTouchStartX = e.touches[0].clientX;
  ssTouchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (currentScreen !== 'swipe-sort' || !ssIsPlaying) return;
  const dx = e.changedTouches[0].clientX - ssTouchStartX;
  const dy = e.changedTouches[0].clientY - ssTouchStartY;
  // Only trigger if horizontal swipe is dominant and exceeds threshold
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
    ssAnswer(dx < 0 ? 'left' : 'right');
  }
}, { passive: true });

function ssGameOver() {
  clearInterval(ssTimer);
  ssIsPlaying = false;
  
  if (ssScore > ssBest) {
    ssBest = ssScore;
    localStorage.setItem('ssBest', ssBest.toString());
    document.getElementById('ss-best').textContent = ssBest;
  }
  
  document.getElementById('ss-rule').style.display = 'none';
  document.getElementById('ss-card').style.display = 'none';
  document.getElementById('ss-actions').style.display = 'none';
  
  document.getElementById('ss-message').style.display = 'block';
  document.getElementById('ss-message').textContent = '終了！';
  
  document.getElementById('ss-start-btn').style.display = 'inline-block';
  document.getElementById('ss-start-btn').textContent = 'もう一度';
  
  showResult('↔️', 'タイムアップ', `仕分けた数: ${ssScore}`, () => ssStart());
}

function ssStop() {
  if (ssIsPlaying) {
    clearInterval(ssTimer);
    ssIsPlaying = false;
    document.getElementById('ss-rule').style.display = 'none';
    document.getElementById('ss-card').style.display = 'none';
    document.getElementById('ss-actions').style.display = 'none';
    document.getElementById('ss-message').style.display = 'block';
    
    document.getElementById('ss-start-btn').style.display = 'inline-block';
    document.getElementById('ss-start-btn').textContent = 'スタート';
  }
};
