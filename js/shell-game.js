let sgDiff = 'easy'; // easy, normal, hard
let sgState = 'idle'; // idle, showing, shuffling, waiting
let sgScore = 0;
let sgBest = 0;
let sgRound = 1;

let sgCupsData = [];
let sgShuffleCount = 0;
let sgMaxShuffles = 5;
let sgShuffleInterval = null;
let sgFoundStars = 0;
let sgTotalStars = 0;

// Config
const sgConfig = {
  easy:   { cups: 3, stars: 1, shuffles: 5, speed: 600 },
  normal: { cups: 5, stars: 1, shuffles: 8, speed: 450 },
  hard:   { cups: 6, stars: 2, shuffles: 12, speed: 350 }
};

function sgSetDiff(btn, diff) {
  if (sgState !== 'idle' && sgState !== 'waiting') return;
  document.querySelectorAll('#sg-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  sgDiff = diff;
}

function sgStart() {
  if (sgState === 'showing' || sgState === 'shuffling') return;
  
  sgScore = 0;
  sgRound = 1;
  document.getElementById('sg-score').textContent = sgScore;
  sgInitRound();
}

function sgStop() {
  if (sgShuffleInterval) clearInterval(sgShuffleInterval);
  sgShuffleInterval = null;
  sgState = 'idle';
  document.getElementById('sg-message').textContent = 'スタートを押してください';
  document.getElementById('sg-stage').innerHTML = '';
  document.getElementById('sg-start-btn').textContent = 'スタート';
}

function sgInitRound() {
  const conf = sgConfig[sgDiff];
  sgState = 'showing';
  sgFoundStars = 0;
  sgTotalStars = conf.stars;
  
  document.getElementById('sg-start-btn').textContent = 'プレイ中...';
  document.getElementById('sg-message').textContent = '星の位置を覚えて！';
  
  const stage = document.getElementById('sg-stage');
  stage.innerHTML = '';
  
  sgCupsData = [];
  
  // Decide which cups have stars
  let starIndices = [];
  while(starIndices.length < conf.stars) {
    let r = rand(0, conf.cups - 1);
    if(!starIndices.includes(r)) starIndices.push(r);
  }
  
  // Generate container positions
  // simple layout: evenly spaced in a row or slightly offset grid
  // Stage is 400x300, cup is 60x60
  const positions = sgGeneratePositions(conf.cups);
  
  // create cups
  for (let i = 0; i < conf.cups; i++) {
    const isStar = starIndices.includes(i);
    const cupEl = document.createElement('div');
    cupEl.className = 'sg-cup revealed'; // Start revealed
    cupEl.style.left = positions[i].x + 'px';
    cupEl.style.top = positions[i].y + 'px';
    
    // Icon
    const starEl = document.createElement('div');
    starEl.className = 'sg-star';
    starEl.textContent = '⭐';
    
    const emptyEl = document.createElement('div');
    emptyEl.className = 'sg-empty';
    emptyEl.textContent = '✖';
    
    if (isStar) {
      cupEl.appendChild(starEl);
    } else {
      cupEl.appendChild(emptyEl);
    }
    
    cupEl.onclick = () => sgTapCup(i);
    
    stage.appendChild(cupEl);
    
    sgCupsData.push({
      el: cupEl,
      hasStar: isStar,
      x: positions[i].x,
      y: positions[i].y
    });
  }
  
  // Hide after 2 seconds
  setTimeout(() => {
    if (sgState !== 'showing') return;
    document.getElementById('sg-message').textContent = 'シャッフルします...';
    sgCupsData.forEach(c => c.el.classList.remove('revealed'));
    
    setTimeout(() => {
      sgStartShuffle();
    }, 500);
  }, 2000);
}

function sgGeneratePositions(count) {
  // Try to distribute cups so they don't overlap initially.
  // Stage: 400w x 300h. Cup: 60x60
  // Safe bounds: x: 10-330, y: 10-230
  let pos = [];
  for(let i=0; i<count; i++) {
    let safe = false;
    let x, y;
    let attempts = 0;
    while(!safe && attempts < 100) {
      x = rand(10, 330);
      y = rand(10, 230);
      safe = true;
      for(let p of pos) {
        let dx = p.x - x;
        let dy = p.y - y;
        if(Math.sqrt(dx*dx + dy*dy) < 70) { // minimum distance
          safe = false;
          break;
        }
      }
      attempts++;
    }
    pos.push({x, y});
  }
  return pos;
}

function sgStartShuffle() {
  if (sgState !== 'showing') return;
  sgState = 'shuffling';
  const conf = sgConfig[sgDiff];
  sgShuffleCount = 0;
  
  sgShuffleInterval = setInterval(() => {
    sgDoShuffleStep();
  }, conf.speed);
}

function sgDoShuffleStep() {
  const conf = sgConfig[sgDiff];
  sgShuffleCount++;
  
  // Pick two random cups to swap positions
  let i = rand(0, conf.cups - 1);
  let j = rand(0, conf.cups - 1);
  while (i === j) { j = rand(0, conf.cups - 1); }
  
  // swap coords
  let tempX = sgCupsData[i].x;
  let tempY = sgCupsData[i].y;
  
  sgCupsData[i].x = sgCupsData[j].x;
  sgCupsData[i].y = sgCupsData[j].y;
  sgCupsData[j].x = tempX;
  sgCupsData[j].y = tempY;
  
  // Apply css
  sgCupsData[i].el.style.left = sgCupsData[i].x + 'px';
  sgCupsData[i].el.style.top = sgCupsData[i].y + 'px';
  sgCupsData[j].el.style.left = sgCupsData[j].x + 'px';
  sgCupsData[j].el.style.top = sgCupsData[j].y + 'px';
  
  if (sgShuffleCount >= conf.shuffles) {
    clearInterval(sgShuffleInterval);
    sgShuffleInterval = null;
    
    // Wait for animation to finish, then wait for tap
    setTimeout(() => {
      if (sgState !== 'shuffling') return;
      sgState = 'waiting';
      document.getElementById('sg-message').textContent = '星が入っているカップを探せ！';
      sgCupsData.forEach(c => c.el.classList.add('tap-ready'));
    }, conf.speed);
  }
}

function sgTapCup(idx) {
  if (sgState !== 'waiting') return;
  
  const cup = sgCupsData[idx];
  if (cup.el.classList.contains('revealed')) return; // already revealed
  
  cup.el.classList.remove('tap-ready');
  cup.el.classList.add('revealed');
  
  if (cup.hasStar) {
    sgFoundStars++;
    if (sgFoundStars >= sgTotalStars) {
      // Round clear
      sgState = 'idle';
      sgScore += 10;
      sgRound++;
      document.getElementById('sg-score').textContent = sgScore;
      document.getElementById('sg-message').textContent = '正解！次のラウンドへ...';
      
      setTimeout(() => {
        if(currentScreen === 'shell-game') sgInitRound();
      }, 1500);
    }
  } else {
    // Wrong
    sgState = 'idle';
    if (sgScore > sgBest) {
      sgBest = sgScore;
      document.getElementById('sg-best').textContent = sgBest;
    }
    
    // Reveal all remaining stars
    sgCupsData.forEach(c => {
      if (c.hasStar && !c.el.classList.contains('revealed')) {
        c.el.classList.add('revealed');
      }
      c.el.classList.remove('tap-ready');
    });
    
    document.getElementById('sg-message').textContent = 'ゲームオーバー...';
    document.getElementById('sg-start-btn').textContent = 'もう一度';
    
    setTimeout(() => {
      showResult('👁️‍🗨️', '終了!', `スコア: ${sgScore} (ベスト: ${sgBest})`, sgStart);
    }, 1500);
  }
}
