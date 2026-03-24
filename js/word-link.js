/* ===== WORD LINK GAME ===== */

let wlState = 'idle';
let wlScore = 0;
let wlBest  = 0;
let wlRound = 0;
let wlCurrentWord = null;
let wlSelectedIndices = []; // indices into wlShuffled
let wlShuffled = [];        // shuffled char array
let wlTimerFill = null;
let wlTimeLeft = 0;
let wlTotalTime = 30;       // seconds per round set

// Word bank: { word, hint }
const WL_WORDS = [
  { word: 'りんご',     hint: '🍎 くだもの',       chars: 3 },
  { word: 'みかん',     hint: '🍊 くだもの',       chars: 3 },
  { word: 'いちご',     hint: '🍓 くだもの',       chars: 3 },
  { word: 'ぶどう',     hint: '🍇 くだもの',       chars: 3 },
  { word: 'もも',       hint: '🍑 くだもの',       chars: 2 },
  { word: 'なし',       hint: '🍐 くだもの',       chars: 2 },
  { word: 'すいか',     hint: '🍉 くだもの',       chars: 3 },
  { word: 'バナナ',     hint: '🍌 くだもの',       chars: 3 },
  { word: 'いぬ',       hint: '🐕 どうぶつ',       chars: 2 },
  { word: 'ねこ',       hint: '🐱 どうぶつ',       chars: 2 },
  { word: 'うさぎ',     hint: '🐰 どうぶつ',       chars: 3 },
  { word: 'ぞう',       hint: '🐘 どうぶつ',       chars: 2 },
  { word: 'きりん',     hint: '🦒 どうぶつ',       chars: 3 },
  { word: 'らいおん',   hint: '🦁 どうぶつ',       chars: 4 },
  { word: 'さる',       hint: '🐒 どうぶつ',       chars: 2 },
  { word: 'とら',       hint: '🐯 どうぶつ',       chars: 2 },
  { word: 'くるま',     hint: '🚗 のりもの',       chars: 3 },
  { word: 'でんしゃ',   hint: '🚃 のりもの',       chars: 4 },
  { word: 'ひこうき',   hint: '✈️ のりもの',       chars: 4 },
  { word: 'じてんしゃ', hint: '🚲 のりもの',       chars: 5 },
  { word: 'あか',       hint: '🔴 いろ',           chars: 2 },
  { word: 'あお',       hint: '🔵 いろ',           chars: 2 },
  { word: 'きいろ',     hint: '🟡 いろ',           chars: 3 },
  { word: 'みどり',     hint: '🟢 いろ',           chars: 3 },
  { word: 'むらさき',   hint: '🟣 いろ',           chars: 4 },
];

const DISTRACTORS = ['あ','い','う','え','お','か','き','く','け','こ',
                     'さ','し','す','せ','そ','た','ち','つ','て','と',
                     'な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ',
                     'ま','み','む','め','も','や','ゆ','よ','ら','り',
                     'る','れ','ろ','わ','を','ん'];

function wlSetDiff(btn, diff) {
  if (wlState !== 'idle') return;
  document.querySelectorAll('#wl-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function wlStart() {
  wlScore = 0;
  wlRound = 0;
  wlTimeLeft = wlTotalTime;
  document.getElementById('wl-score').textContent = 0;
  document.getElementById('wl-start-btn').style.display = 'none';
  document.getElementById('wl-clear-btn').style.display = 'inline-flex';
  wlStartTimer();
  wlNextWord();
}

function wlStop() {
  if (wlTimerFill) clearInterval(wlTimerFill);
  wlTimerFill = null;
  wlState = 'idle';
  document.getElementById('wl-start-btn').style.display = 'inline-flex';
  document.getElementById('wl-start-btn').textContent = 'スタート';
  document.getElementById('wl-clear-btn').style.display = 'none';
  document.getElementById('wl-timer-fill').style.width = '100%';
  document.getElementById('wl-grid').innerHTML = '';
  document.getElementById('wl-answer').innerHTML = '';
  document.getElementById('wl-hint').textContent = 'スタートを押してください';
  document.getElementById('wl-message').textContent = '';
}

function wlStartTimer() {
  const startTime = Date.now();
  document.getElementById('wl-timer-fill').style.width = '100%';

  wlTimerFill = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    wlTimeLeft = wlTotalTime - elapsed;
    const pct = Math.max(0, (wlTimeLeft / wlTotalTime) * 100);
    document.getElementById('wl-timer-fill').style.width = pct + '%';

    if (wlTimeLeft <= 0) {
      clearInterval(wlTimerFill);
      wlTimerFill = null;
      wlGameOver();
    }
  }, 50);
}

function wlGameOver() {
  wlState = 'idle';
  if (wlScore > wlBest) {
    wlBest = wlScore;
    document.getElementById('wl-best').textContent = wlBest;
  }
  document.getElementById('wl-start-btn').style.display = 'inline-flex';
  document.getElementById('wl-start-btn').textContent = 'もう一度';
  document.getElementById('wl-clear-btn').style.display = 'none';
  showResult('🔤', 'タイムアップ！', `${wlTotalTime}秒で ${wlScore} 問正解！ (ベスト: ${wlBest})`, wlStart);
}

function wlNextWord() {
  if (wlState === 'idle' && wlRound > 0) return;
  wlState = 'playing';
  wlSelectedIndices = [];

  // Pick a random word
  wlCurrentWord = WL_WORDS[rand(0, WL_WORDS.length - 1)];
  const answer = wlCurrentWord.word.split('');

  // Build tile set: answer chars + distractors to fill up to 8
  const totalTiles = Math.max(6, answer.length + 3);
  let tileChars = [...answer];
  let pool = shuffle([...DISTRACTORS].filter(c => !answer.includes(c)));
  while (tileChars.length < totalTiles) {
    tileChars.push(pool.pop() || 'ん');
  }
  wlShuffled = shuffle(tileChars);

  // Render hint
  document.getElementById('wl-hint').textContent = wlCurrentWord.hint;

  // Render answer slots
  const answerEl = document.getElementById('wl-answer');
  answerEl.innerHTML = '';
  for (let i = 0; i < answer.length; i++) {
    const slot = document.createElement('div');
    slot.className = 'wl-char-slot';
    slot.id = `wl-slot-${i}`;
    answerEl.appendChild(slot);
  }

  // Render tile grid
  const grid = document.getElementById('wl-grid');
  grid.innerHTML = '';
  wlShuffled.forEach((ch, idx) => {
    const tile = document.createElement('div');
    tile.className = 'wl-tile';
    tile.textContent = ch;
    tile.id = `wl-tile-${idx}`;
    tile.onclick = () => wlTap(idx);
    grid.appendChild(tile);
  });

  document.getElementById('wl-message').textContent = '';
  wlRound++;
}

function wlTap(idx) {
  if (wlState !== 'playing') return;
  if (document.getElementById(`wl-tile-${idx}`).classList.contains('used')) return;

  // Add to selected
  wlSelectedIndices.push(idx);
  const slotIdx = wlSelectedIndices.length - 1;
  const slot = document.getElementById(`wl-slot-${slotIdx}`);
  if (slot) {
    slot.textContent = wlShuffled[idx];
    slot.classList.add('filled');
  }
  document.getElementById(`wl-tile-${idx}`).classList.add('used');

  // Check if all slots filled
  const answerLen = wlCurrentWord.word.length;
  if (wlSelectedIndices.length === answerLen) {
    const input = wlSelectedIndices.map(i => wlShuffled[i]).join('');
    if (input === wlCurrentWord.word) {
      // Correct!
      wlScore++;
      document.getElementById('wl-score').textContent = wlScore;
      document.querySelectorAll('.wl-char-slot').forEach(s => {
        s.classList.remove('filled');
        s.classList.add('correct');
      });
      document.getElementById('wl-message').textContent = '正解！✨';
      setTimeout(() => {
        if (wlState === 'playing' && currentScreen === 'word-link') wlNextWord();
      }, 700);
    } else {
      // Wrong - shake and reset
      document.querySelectorAll('.wl-char-slot').forEach(s => {
        s.classList.remove('filled');
        s.classList.add('wrong');
      });
      document.getElementById('wl-message').textContent = '違います...';
      setTimeout(() => {
        wlClear();
        document.getElementById('wl-message').textContent = '';
      }, 600);
    }
  }
}

function wlClear() {
  wlSelectedIndices = [];
  document.querySelectorAll('.wl-char-slot').forEach(s => {
    s.textContent = '';
    s.className = 'wl-char-slot';
  });
  document.querySelectorAll('.wl-tile').forEach(t => t.classList.remove('used'));
}
