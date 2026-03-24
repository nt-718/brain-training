// Symbol Logic

let slDiff = 'easy';
let slScore = 0;
let slBest = 0;
let slTimer = null;
let slTimeLeft = 60;
let slTotalTime = 60;
let slIsPlaying = false;
let slCurrentAnswer = 0;
let slCurrentInput = '';

const slSymbols = ['🍎', '🍋', '🍇', '🍉', '🍓', '🍒', '🍑', '🥝', '🍍', '🥥'];

const savedSlBest = localStorage.getItem('slBest');
if (savedSlBest) {
  slBest = parseInt(savedSlBest, 10);
  document.getElementById('sl-best').textContent = slBest;
}

function slSetDiff(btn, diff) {
  if (slIsPlaying) return;
  document.querySelectorAll('#sl-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  slDiff = diff;
}

function slStart() {
  if (slIsPlaying) return;
  
  slScore = 0;
  slTotalTime = slDiff === 'easy' ? 40 : (slDiff === 'normal' ? 60 : 80);
  slTimeLeft = slTotalTime;
  
  document.getElementById('sl-score').textContent = slScore;
  document.getElementById('sl-message').style.display = 'none';
  document.getElementById('sl-equations').style.display = 'flex';
  
  document.getElementById('sl-start-btn').style.display = 'none';
  document.getElementById('sl-input').style.display = 'block';
  document.getElementById('sl-numpad').style.display = 'grid';
  
  slIsPlaying = true;
  slUpdateTimerDisplay();
  slNextRound();
  
  slTimer = setInterval(() => {
    slTimeLeft -= 0.1;
    slUpdateTimerDisplay();
    if (slTimeLeft <= 0) {
      slGameOver();
    }
  }, 100);
}

function slUpdateTimerDisplay() {
  const pct = Math.max(0, (slTimeLeft / slTotalTime) * 100);
  document.getElementById('sl-timer-fill').style.width = pct + '%';
  if (pct < 20) {
    document.getElementById('sl-timer-fill').style.background = 'linear-gradient(90deg, #f43f5e, #e11d48)';
  } else {
    document.getElementById('sl-timer-fill').style.background = 'linear-gradient(90deg, var(--secondary), var(--primary))';
  }
}

function slNextRound() {
  slCurrentInput = '';
  document.getElementById('sl-input').textContent = '?';
  document.getElementById('sl-input').classList.remove('wrong');
  
  const container = document.getElementById('sl-equations');
  container.innerHTML = '';
  
  // Choose symbols
  const syms = shuffle([...slSymbols]).slice(0, 3);
  let A = syms[0];
  let B = syms[1];
  let C = syms[2]; // Used only in hard
  
  let valA = rand(2, 9);
  let valB = rand(2, 9);
  let valC = rand(2, 9);
  
  let rowsHtml = '';
  
  if (slDiff === 'easy') {
    // A + A = X
    // A + B = Y
    // B = ?
    rowsHtml += `<div class="sl-eq-row"><span class="symbol">${A}</span><span class="op">+</span><span class="symbol">${A}</span><span class="op">=</span><span class="val">${valA + valA}</span></div>`;
    rowsHtml += `<div class="sl-eq-row"><span class="symbol">${A}</span><span class="op">+</span><span class="symbol">${B}</span><span class="op">=</span><span class="val">${valA + valB}</span></div>`;
    rowsHtml += `<div class="sl-eq-row question"><span class="symbol">${B}</span><span class="op">=</span><span class="quest">?</span></div>`;
    slCurrentAnswer = valB;
  } else if (slDiff === 'normal') {
    // A + A = X
    // A * B = Y
    // A + B = ?
    rowsHtml += `<div class="sl-eq-row"><span class="symbol">${A}</span><span class="op">+</span><span class="symbol">${A}</span><span class="op">=</span><span class="val">${valA + valA}</span></div>`;
    rowsHtml += `<div class="sl-eq-row"><span class="symbol">${A}</span><span class="op">×</span><span class="symbol">${B}</span><span class="op">=</span><span class="val">${valA * valB}</span></div>`;
    rowsHtml += `<div class="sl-eq-row question"><span class="symbol">${A}</span><span class="op">+</span><span class="symbol">${B}</span><span class="op">=</span><span class="quest">?</span></div>`;
    slCurrentAnswer = valA + valB;
  } else {
    // Hard: A + A = X, A + B = Y, B - C = Z, A + B * C = ?
    // Avoid negative for B-C
    while (valB <= valC) {
      valB = rand(4, 9);
      valC = rand(1, valB - 1);
    }
    rowsHtml += `<div class="sl-eq-row"><span class="symbol">${A}</span><span class="op">+</span><span class="symbol">${A}</span><span class="op">=</span><span class="val">${valA + valA}</span></div>`;
    rowsHtml += `<div class="sl-eq-row"><span class="symbol">${A}</span><span class="op">+</span><span class="symbol">${B}</span><span class="op">=</span><span class="val">${valA + valB}</span></div>`;
    rowsHtml += `<div class="sl-eq-row"><span class="symbol">${B}</span><span class="op">-</span><span class="symbol">${C}</span><span class="op">=</span><span class="val">${valB - valC}</span></div>`;
    rowsHtml += `<div class="sl-eq-row question"><span class="symbol">${A}</span><span class="op">+</span><span class="symbol">${B}</span><span class="op">×</span><span class="symbol">${C}</span><span class="op">=</span><span class="quest">?</span></div>`;
    slCurrentAnswer = valA + (valB * valC); // Follow order of ops
  }
  
  container.innerHTML = rowsHtml;
}

function slNumpad(val) {
  if (!slIsPlaying) return;
  const inEl = document.getElementById('sl-input');
  
  if (val === 'del') {
    slCurrentInput = slCurrentInput.slice(0, -1);
    inEl.textContent = slCurrentInput === '' ? '?' : slCurrentInput;
  } else if (val === 'ok') {
    if (slCurrentInput === '') return;
    const num = parseInt(slCurrentInput, 10);
    if (num === slCurrentAnswer) {
      slScore++;
      document.getElementById('sl-score').textContent = slScore;
      slNextRound();
    } else {
      inEl.classList.remove('wrong');
      void inEl.offsetWidth; // trigger reflow
      inEl.classList.add('wrong');
      slCurrentInput = '';
      setTimeout(() => inEl.textContent = '?', 200);
      slTimeLeft -= 2.0; // penalty
    }
  } else {
    if (slCurrentInput.length < 3) {
      slCurrentInput += val;
      inEl.textContent = slCurrentInput;
    }
  }
}

function slGameOver() {
  clearInterval(slTimer);
  slIsPlaying = false;
  
  if (slScore > slBest) {
    slBest = slScore;
    localStorage.setItem('slBest', slBest.toString());
    document.getElementById('sl-best').textContent = slBest;
  }
  
  document.getElementById('sl-equations').style.display = 'none';
  document.getElementById('sl-input').style.display = 'none';
  document.getElementById('sl-numpad').style.display = 'none';
  
  document.getElementById('sl-message').style.display = 'block';
  document.getElementById('sl-message').textContent = '終了！';
  
  document.getElementById('sl-start-btn').style.display = 'inline-block';
  document.getElementById('sl-start-btn').textContent = 'もう一度';
  
  showResult('🍎', 'タイムアップ', `正解数: ${slScore}`, () => slStart());
}

window.slStop = function() {
  if (slIsPlaying) {
    clearInterval(slTimer);
    slIsPlaying = false;
    document.getElementById('sl-equations').style.display = 'none';
    document.getElementById('sl-input').style.display = 'none';
    document.getElementById('sl-numpad').style.display = 'none';
    document.getElementById('sl-message').style.display = 'block';
    
    document.getElementById('sl-start-btn').style.display = 'inline-block';
    document.getElementById('sl-start-btn').textContent = 'スタート';
  }
};
