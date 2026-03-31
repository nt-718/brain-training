// Clock Calc (クロックマスター)

var CL_RANKS = [
  { min: 40, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 30, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 25, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 18, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 12, label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 6,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

let clDiff = 'normal';
let clScore = 0;
let clBest = 0;
let clTimer = null;
let clTimeLeft = 60;
let clTotalTime = 60;
let clIsPlaying = false;
let clCorrectAnswer = '';

function clSetDiff(btn, diff) {
  if (clIsPlaying) return;
  document.querySelectorAll('#cl-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  clDiff = diff;
  clLoadBest();
}

function clLoadBest() {
  const k = `cl_best_${clDiff}`;
  const saved = localStorage.getItem(k);
  clBest = saved ? parseInt(saved, 10) : 0;
  const bestEl = document.getElementById('cl-best');
  if(bestEl) bestEl.textContent = clBest;
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  if(document.getElementById('cl-best')) {
    clLoadBest();
  }
});

function clFormatTime(h, m) {
  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function clStart() {
  if (clIsPlaying) return;
  sfx.start();
  
  clScore = 0;
  clTotalTime = 60;
  clTimeLeft = clTotalTime;
  
  document.getElementById('cl-score').textContent = clScore;
  document.getElementById('cl-message').style.display = 'none';
  document.getElementById('cl-start-btn').style.display = 'none';
  
  document.getElementById('cl-clock-disp').style.display = 'block';
  document.getElementById('cl-question').style.display = 'block';
  document.getElementById('cl-answers').style.display = 'grid';
  
  clIsPlaying = true;
  clUpdateTimerDisplay();
  clNextRound();
  
  clTimer = setInterval(() => {
    clTimeLeft -= 1;
    clUpdateTimerDisplay();
    if (clTimeLeft <= 0) {
      clGameOver();
    }
  }, 1000);
}

function clUpdateTimerDisplay() {
  const pct = Math.max(0, (clTimeLeft / clTotalTime) * 100);
  document.getElementById('cl-timer-fill').style.width = pct + '%';
  if (pct < 20) {
    document.getElementById('cl-timer-fill').style.background = 'linear-gradient(90deg, #f43f5e, #e11d48)';
  } else {
    document.getElementById('cl-timer-fill').style.background = 'linear-gradient(90deg, var(--secondary), var(--primary))';
  }
}

function clNextRound() {
  const disp = document.getElementById('cl-clock-disp');
  const qStr = document.getElementById('cl-question');
  
  let h = rand(0, 23);
  let m = 0;
  let offsetAmount = 0;
  
  if (clDiff === 'easy') {
    // Minutes: 00, 15, 30, 45
    m = rand(0, 3) * 15;
    // Offset: 15, 30, 45, 60 minutes
    offsetAmount = rand(1, 4) * 15; 
  } else if (clDiff === 'normal') {
    // Minutes: multiple of 5
    m = rand(0, 11) * 5;
    // Offset: 10 to 90 minutes (multiple of 10)
    offsetAmount = rand(1, 9) * 10;
  } else {
    // Hard: any minute
    m = rand(0, 59);
    // Offset: 13 to 142 minutes (random)
    offsetAmount = rand(13, 142);
  }
  
  // Decide direction
  const isAfter = Math.random() < 0.5;
  const dirStr = isAfter ? "後" : "前";
  
  disp.textContent = clFormatTime(h, m);
  
  let qText = "";
  if (offsetAmount >= 60) {
    const hours = Math.floor(offsetAmount / 60);
    const mins = offsetAmount % 60;
    if (mins === 0) {
      qText = `${hours}時間${dirStr}は？`;
    } else {
      qText = `${hours}時間${mins}分${dirStr}は？`;
    }
  } else {
    qText = `${offsetAmount}分${dirStr}は？`;
  }
  
  qStr.textContent = qText;
  
  // Calculate correct time
  let totalMin = h * 60 + m;
  if (isAfter) {
    totalMin += offsetAmount;
  } else {
    totalMin -= offsetAmount;
  }
  
  // Wrap around 24 hours
  totalMin = (totalMin % 1440 + 1440) % 1440;
  
  const correctH = Math.floor(totalMin / 60);
  const correctM = totalMin % 60;
  clCorrectAnswer = clFormatTime(correctH, correctM);
  
  // Generate 3 wrong answers
  const options = new Set();
  options.add(clCorrectAnswer);
  
  while(options.size < 4) {
    let wrongH = correctH;
    let wrongM = correctM;
    
    // Slight modifications to make trick answers
    const trickType = rand(0, 3);
    if (trickType === 0) {
        wrongH = (wrongH + (Math.random() < 0.5 ? 1 : -1) + 24) % 24; // off by 1 hour
    } else if (trickType === 1) {
        // Did the opposite math (e.g. subtracted instead of added)
        let flipMin = h * 60 + m + (isAfter ? -offsetAmount : offsetAmount);
        flipMin = (flipMin % 1440 + 1440) % 1440;
        wrongH = Math.floor(flipMin / 60);
        wrongM = flipMin % 60;
    } else if (trickType === 2 && clDiff === 'normal') {
        wrongM = (wrongM + (Math.random() < 0.5 ? 10 : -10) + 60) % 60; // off by 10 mins
    } else {
        // totally random
        wrongH = rand(0, 23);
        wrongM = clDiff === 'hard' ? rand(0, 59) : rand(0, 11) * 5;
    }
    
    options.add(clFormatTime(wrongH, wrongM));
  }
  
  const optsArray = shuffle(Array.from(options));
  const btns = document.querySelectorAll('.cl-answer-btn');
  btns.forEach((btn, i) => {
    btn.textContent = optsArray[i];
    btn.onclick = () => clAnswer(optsArray[i]);
  });
}

function clAnswer(selected) {
  if (!clIsPlaying) return;
  
  if (selected === clCorrectAnswer) {
    sfx.correct();
    clScore++;
    document.getElementById('cl-score').textContent = clScore;
    setTimeout(clNextRound, 200);
  } else {
    sfx.wrong();
    clTimeLeft -= 3.0; // 3 sec penalty for wrong
    clUpdateTimerDisplay();
  }
}

function clGameOver() {
  clearInterval(clTimer);
  clIsPlaying = false;
  
  const k = `cl_best_${clDiff}`;
  if (clScore > clBest) {
    clBest = clScore;
    localStorage.setItem(k, clBest.toString());
    const bestEl = document.getElementById('cl-best');
    if(bestEl) bestEl.textContent = clBest;
  }
  
  document.getElementById('cl-clock-disp').style.display = 'none';
  document.getElementById('cl-question').style.display = 'none';
  document.getElementById('cl-answers').style.display = 'none';
  
  document.getElementById('cl-message').style.display = 'block';
  document.getElementById('cl-message').textContent = '終了！';
  
  document.getElementById('cl-start-btn').style.display = 'inline-block';
  document.getElementById('cl-start-btn').textContent = 'もう一度';
  
  const rank = getScoreRank(clScore, CL_RANKS);
  showResult('⏳', 'タイムアップ', `正解数: ${clScore}回\n難易度: ${clDiff}`, () => clStart(), rank);
}

function clStop() {
  if (clIsPlaying) {
    clearInterval(clTimer);
    clIsPlaying = false;
    document.getElementById('cl-clock-disp').style.display = 'none';
    document.getElementById('cl-question').style.display = 'none';
    document.getElementById('cl-answers').style.display = 'none';
    
    document.getElementById('cl-message').style.display = 'block';
    document.getElementById('cl-start-btn').style.display = 'inline-block';
    document.getElementById('cl-start-btn').textContent = 'スタート';
  }
}
