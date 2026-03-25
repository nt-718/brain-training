/* ========== COLOR CODE ========== */
let ccTimer = null;
let ccTimeLimit = 45;
let ccTimeLeft = 0;
let ccScore = 0;
let ccMode = 'color2hex'; // 'color2hex' or 'hex2color'
let ccIsPlaying = false;
let ccCorrectAnswer = '';

function ccSetMode(btn, mode) {
  if(ccIsPlaying) return;
  document.querySelectorAll('#cc-mode-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  ccMode = mode;
  
  // Update best display
  const key = 'cc_best_' + ccMode;
  const best = parseInt(localStorage.getItem(key) || '0');
  document.getElementById('cc-best').textContent = best;
}

function ccStart() {
  ccScore = 0;
  ccTimeLeft = ccTimeLimit;
  ccIsPlaying = true;
  
  document.getElementById('cc-score').textContent = ccScore;
  document.getElementById('cc-start-btn').style.display = 'none';
  document.getElementById('cc-mode-row').style.pointerEvents = 'none';
  document.getElementById('cc-mode-row').style.opacity = '0.5';
  
  document.getElementById('cc-message').textContent = ccMode === 'color2hex' ? 'この色のコードは？' : 'このコードの色は？';
  
  ccNext();
  ccUpdateTimerDisplay();
  
  if(ccTimer) clearInterval(ccTimer);
  ccTimer = setInterval(() => {
    ccTimeLeft -= 0.1;
    if(ccTimeLeft <= 0) {
      ccTimeLeft = 0;
      ccGameOver();
    }
    ccUpdateTimerDisplay();
  }, 100);
}

function ccUpdateTimerDisplay() {
  const pct = Math.max(0, (ccTimeLeft / ccTimeLimit)) * 100;
  document.getElementById('cc-timer-fill').style.width = pct + '%';
}

function ccRandomHex() {
  const r = Math.floor(Math.random()*256).toString(16).padStart(2,'0');
  const g = Math.floor(Math.random()*256).toString(16).padStart(2,'0');
  const b = Math.floor(Math.random()*256).toString(16).padStart(2,'0');
  return `#${r}${g}${b}`.toUpperCase();
}

function ccRandomSimilarHex(baseHex) {
  const r = parseInt(baseHex.slice(1,3), 16);
  const g = parseInt(baseHex.slice(3,5), 16);
  const b = parseInt(baseHex.slice(5,7), 16);
  
  const comp = Math.floor(Math.random() * 3);
  const change = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.floor(Math.random()*40));
  
  const nr = comp === 0 ? Math.max(0, Math.min(255, r + change)) : r;
  const ng = comp === 1 ? Math.max(0, Math.min(255, g + change)) : g;
  const nb = comp === 2 ? Math.max(0, Math.min(255, b + change)) : b;
  
  return `#${nr.toString(16).padStart(2,'0')}${ng.toString(16).padStart(2,'0')}${nb.toString(16).padStart(2,'0')}`.toUpperCase();
}

function ccNext() {
  const display = document.getElementById('cc-display');
  const optionsContainer = document.getElementById('cc-options');
  optionsContainer.innerHTML = '';
  
  const correctHex = ccRandomHex();
  ccCorrectAnswer = correctHex;
  
  let options = [correctHex];
  while(options.length < 4) {
    const rand = Math.random() > 0.4 ? ccRandomSimilarHex(correctHex) : ccRandomHex();
    if(!options.includes(rand)) options.push(rand);
  }
  
  // Shuffle options manually since shuffle() from main.js might not be perfectly available if scoped, but main.js functions are global
  if(typeof shuffle === 'function') {
    options = shuffle(options);
  } else {
    options.sort(() => Math.random() - 0.5);
  }
  
  if (ccMode === 'color2hex') {
    display.style.backgroundColor = correctHex;
    display.textContent = '';
    display.className = 'cc-display';
    
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'cc-btn';
      btn.textContent = opt;
      btn.onclick = () => ccAnswer(opt);
      optionsContainer.appendChild(btn);
    });
  } else {
    display.style.backgroundColor = 'transparent';
    display.textContent = correctHex;
    display.className = 'cc-display text-mode';
    
    options.forEach(opt => {
      const btn = document.createElement('div');
      btn.className = 'cc-color-btn';
      btn.style.backgroundColor = opt;
      btn.onclick = () => ccAnswer(opt);
      optionsContainer.appendChild(btn);
    });
  }
}

function ccAnswer(ans) {
  if(!ccIsPlaying) return;
  if(ans === ccCorrectAnswer) {
    ccScore++;
    document.getElementById('cc-score').textContent = ccScore;
    ccNext();
  } else {
    ccTimeLeft -= 3;
    const msg = document.getElementById('cc-message');
    msg.textContent = '❌ -3秒';
    msg.style.color = 'var(--secondary)';
    setTimeout(() => {
      if(ccIsPlaying) {
        msg.textContent = ccMode === 'color2hex' ? 'この色のコードは？' : 'このコードの色は？';
        msg.style.color = '';
      }
    }, 500);
    ccUpdateTimerDisplay();
  }
}

function ccGameOver() {
  ccStop();
  const key = 'cc_best_' + ccMode;
  let best = parseInt(localStorage.getItem(key) || '0');
  let isNewBest = false;
  if(ccScore > best) {
    best = ccScore;
    localStorage.setItem(key, best);
    isNewBest = true;
    document.getElementById('cc-best').textContent = best;
    if(typeof refreshBestScores === 'function') refreshBestScores();
  }
  
  showResult(
    '#️⃣',
    'タイムアップ！',
    `スコア: ${ccScore}\nモード: ${ccMode === 'color2hex' ? '色→コード' : 'コード→色'}${isNewBest ? '\n🌟自己ベスト更新！' : ''}`,
    ccStart
  );
}

function ccStop() {
  ccIsPlaying = false;
  if(ccTimer) clearInterval(ccTimer);
  const btn = document.getElementById('cc-start-btn');
  if(btn) {
    btn.style.display = 'block';
    btn.textContent = 'もう一度';
  }
  const row = document.getElementById('cc-mode-row');
  if(row) {
    row.style.pointerEvents = 'auto';
    row.style.opacity = '1';
  }
}
