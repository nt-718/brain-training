/* ===== FLASH MATH ===== */

var FM_RANKS = [
  { min: 15, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 12, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 9,  label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 7,  label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 5,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 3,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

const FM_BEST_KEY = 'fm_best_';
let fmRunning = false;
let fmScore = 1; // round
let fmDiff = 'easy';
let fmType = 'number';
let fmAnswer = 0;
let fmInputVal = '';

let fmSequence = [];
let fmFlashIndex = 0;
let fmFlashInterval = null;

let fmTimerLeft = 0;
let fmTimeTotal = 15;
let fmTimerInterval = null;

function fmSetType(btn, type) {
  document.querySelectorAll('#fm-type-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  fmType = type;
  fmLoadBest();
}

function fmSetDiff(btn, diff) {
  document.querySelectorAll('#fm-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  fmDiff = diff;
  fmLoadBest();
}

function fmLoadBest() {
  const b = localStorage.getItem(FM_BEST_KEY + fmType + '_' + fmDiff);
  document.getElementById('fm-best').textContent = b ? b : '1';
}

function fmStop() {
  fmRunning = false;
  clearInterval(fmTimerInterval);
  fmTimerInterval = null;
  document.getElementById('fm-start-btn').style.display = '';
  document.getElementById('fm-start-btn').textContent = 'スタート';
  document.getElementById('fm-numpad').style.display = 'none';
  document.getElementById('fm-number').textContent = '?';
  document.getElementById('fm-number').classList.remove('show');
  document.getElementById('fm-visual').classList.remove('show');
  document.getElementById('fm-visual').innerHTML = '';
  document.getElementById('fm-message').textContent = '集中してください！';
  document.getElementById('fm-timer-fill').style.width = '100%';
  document.getElementById('fm-input').textContent = '?';
}

function fmStart() {
  fmScore = 1;
  fmRunning = true;
  document.getElementById('fm-start-btn').style.display = 'none';
  document.getElementById('fm-numpad').style.display = 'none';
  document.getElementById('fm-round').textContent = fmScore;
  fmLoadBest();
  fmNextRound();
}

function fmNextRound() {
  if (!fmRunning) return;
  document.getElementById('fm-round').textContent = fmScore;
  fmInputVal = '';
  document.getElementById('fm-input').textContent = '?';
  document.getElementById('fm-numpad').style.display = 'none';
  document.getElementById('fm-message').textContent = '覚える準備...';
  document.getElementById('fm-timer-fill').style.width = '100%';
  
  let count = 3;
  let maxNum = 9;
  let flashSpeed = 800; // ms
  
  if (fmDiff === 'easy') {
    count = 2 + Math.floor(fmScore / 3);
    maxNum = 9;
    flashSpeed = Math.max(500, 1000 - (fmScore * 50));
  } else if (fmDiff === 'normal') {
    count = 3 + Math.floor(fmScore / 2);
    maxNum = 20;
    flashSpeed = Math.max(350, 800 - (fmScore * 40));
  } else {
    count = 3 + fmScore;
    maxNum = 50;
    flashSpeed = Math.max(200, 600 - (fmScore * 30));
  }
  
  count = Math.min(count, 15);

  fmSequence = [];
  fmAnswer = 0;
  for (let i = 0; i < count; i++) {
    const n = Math.floor(Math.random() * maxNum) + 1;
    fmSequence.push(n);
    fmAnswer += n;
  }
  
  fmFlashIndex = 0;
  setTimeout(() => {
    if (!fmRunning) return;
    document.getElementById('fm-message').textContent = 'フラッシュ！';
    fmDoFlash(flashSpeed);
  }, 1000);
}

function fmDoFlash(speed) {
  const elNum = document.getElementById('fm-number');
  const elVis = document.getElementById('fm-visual');
  
  if (fmFlashIndex >= fmSequence.length) {
    elNum.textContent = '?';
    elNum.classList.remove('show');
    elVis.classList.remove('show');
    document.getElementById('fm-message').textContent = '合計は？';
    document.getElementById('fm-numpad').style.display = 'grid';
    
    fmTimeTotal = 12 + (fmSequence.length * 0.8);
    fmTimerLeft = fmTimeTotal;
    clearInterval(fmTimerInterval);
    fmUpdateTimerBar();
    fmTimerInterval = setInterval(() => {
      fmTimerLeft -= 0.1;
      fmUpdateTimerBar();
      if (fmTimerLeft <= 0) {
        fmGameOver();
      }
    }, 100);
    return;
  }
  
  let currentType = fmType;
  if (currentType === 'mixed') {
    currentType = Math.random() < 0.5 ? 'number' : 'visual';
  }
  
  const val = fmSequence[fmFlashIndex];
  
  if (currentType === 'number') {
    elNum.textContent = val;
    elVis.innerHTML = '';
    elNum.classList.add('show');
  } else {
    elNum.textContent = '';
    elVis.innerHTML = '';
    // Use renderNumber from visual-calc.js globally
    renderNumber(elVis, val, '#8b5cf6');
    elVis.classList.add('show');
  }
  
  setTimeout(() => {
    if(!fmRunning) return;
    elNum.classList.remove('show');
    elVis.classList.remove('show');
  }, speed * 0.6); 
  
  setTimeout(() => {
    if(!fmRunning) return;
    fmFlashIndex++;
    fmDoFlash(speed);
  }, speed);
}

function fmNumpad(key) {
  if (!fmRunning || fmFlashIndex < fmSequence.length) return;
  if (key === 'del') {
    fmInputVal = fmInputVal.slice(0, -1);
  } else if (key === 'ok') {
    fmSubmit();
    return;
  } else {
    if (fmInputVal.length >= 4) return;
    fmInputVal += key;
  }
  document.getElementById('fm-input').textContent = fmInputVal || '?';
}

function fmSubmit() {
  if (!fmRunning) return;
  const val = parseInt(fmInputVal, 10);
  if (isNaN(val)) return;
  clearInterval(fmTimerInterval);

  if (val === fmAnswer) {
    fmScore++;
    document.getElementById('fm-message').textContent = '正解！';
    setTimeout(fmNextRound, 800);
  } else {
    fmGameOver();
  }
}

function fmUpdateTimerBar() {
  const pct = Math.max(0, (fmTimerLeft / fmTimeTotal) * 100);
  const fill = document.getElementById('fm-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function fmGameOver() {
  fmRunning = false;
  clearInterval(fmTimerInterval);
  document.getElementById('fm-start-btn').style.display = '';
  document.getElementById('fm-start-btn').textContent = 'もう一度';
  document.getElementById('fm-numpad').style.display = 'none';
  document.getElementById('fm-message').textContent = `終了！ 答えは ${fmAnswer}`;

  const bestKey = FM_BEST_KEY + fmType + '_' + fmDiff;
  const best = parseInt(localStorage.getItem(bestKey)) || 1;
  const record = fmScore > best;
  
  if (record) {
    localStorage.setItem(bestKey, fmScore);
    document.getElementById('fm-best').textContent = fmScore;
  }
  
  const msg = record ? '🏆 新記録!' : `ベスト: ${best} ラウンド`;
  const rank = getScoreRank(fmScore, FM_RANKS);
  saveScore('flash-math', fmDiff, fmScore);
  showResult(record ? '🏆' : '😢', 'ゲームオーバー', `到達: ${fmScore} ラウンド\n${msg}`, fmStart, rank);
}
