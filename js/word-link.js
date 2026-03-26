/* ===== WORD LINK GAME ===== */

var WL_RANKS = [
  { min: 22, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 17, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 13, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 9,  label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 6,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 3,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

let wlState = 'idle';
let wlScore = 0;
let wlBest  = parseInt(localStorage.getItem('wlBest')) || 0;
let wlRound = 0;
let wlCurrentWord = null;
let wlSelectedIndices = []; // indices into wlShuffled
let wlShuffled = [];        // shuffled char array
let wlTimerFill = null;
let wlTimeLeft = 0;
let wlTotalTime = 45;       // seconds per round set

// Word bank: { word, hint }
const WL_WORDS = [
  // くだもの (Fruits)
  { word: 'りんご',     hint: '🍎 くだもの' },
  { word: 'みかん',     hint: '🍊 くだもの' },
  { word: 'いちご',     hint: '🍓 くだもの' },
  { word: 'ぶどう',     hint: '🍇 くだもの' },
  { word: 'もも',       hint: '🍑 くだもの' },
  { word: 'なし',       hint: '🍐 くだもの' },
  { word: 'すいか',     hint: '🍉 くだもの' },
  { word: 'バナナ',     hint: '🍌 くだもの' },
  { word: 'メロン',     hint: '🍈 くだもの' },
  { word: 'レモン',     hint: '🍋 くだもの' },
  { word: 'さくらんぼ', hint: '🍒 くだもの' },
  { word: 'キウイ',     hint: '🥝 くだもの' },
  { word: 'マンゴー',   hint: '🥭 くだもの' },
  // どうぶつ (Animals)
  { word: 'いぬ',       hint: '🐕 どうぶつ' },
  { word: 'ねこ',       hint: '🐱 どうぶつ' },
  { word: 'うさぎ',     hint: '🐰 どうぶつ' },
  { word: 'ぞう',       hint: '🐘 どうぶつ' },
  { word: 'きりん',     hint: '🦒 どうぶつ' },
  { word: 'らいおん',   hint: '🦁 どうぶつ' },
  { word: 'さる',       hint: '🐒 どうぶつ' },
  { word: 'とら',       hint: '🐯 どうぶつ' },
  { word: 'くま',       hint: '🐻 どうぶつ' },
  { word: 'パンダ',     hint: '🐼 どうぶつ' },
  { word: 'ひつじ',     hint: '🐑 どうぶつ' },
  { word: 'うま',       hint: '🐴 どうぶつ' },
  { word: 'ぶた',       hint: '🐷 どうぶつ' },
  { word: 'ペンギン',   hint: '🐧 どうぶつ' },
  { word: 'いるか',     hint: '🐬 どうぶつ' },
  { word: 'くじら',     hint: '🐳 どうぶつ' },
  { word: 'かめ',       hint: '🐢 どうぶつ' },
  { word: 'へび',       hint: '🐍 どうぶつ' },
  { word: 'わし',       hint: '🦅 どうぶつ' },
  { word: 'こあら',     hint: '🐨 どうぶつ' },
  // のりもの (Vehicles)
  { word: 'くるま',     hint: '🚗 のりもの' },
  { word: 'でんしゃ',   hint: '🚃 のりもの' },
  { word: 'ひこうき',   hint: '✈️ のりもの' },
  { word: 'じてんしゃ', hint: '🚲 のりもの' },
  { word: 'バス',       hint: '🚌 のりもの' },
  { word: 'タクシー',   hint: '🚕 のりもの' },
  { word: 'ふね',       hint: '🚢 のりもの' },
  { word: 'ロケット',   hint: '🚀 のりもの' },
  { word: 'ヘリコプター', hint: '🚁 のりもの' },
  // いろ (Colors)
  { word: 'あか',       hint: '🔴 いろ' },
  { word: 'あお',       hint: '🔵 いろ' },
  { word: 'きいろ',     hint: '🟡 いろ' },
  { word: 'みどり',     hint: '🟢 いろ' },
  { word: 'むらさき',   hint: '🟣 いろ' },
  { word: 'しろ',       hint: '⚪ いろ' },
  { word: 'くろ',       hint: '⚫ いろ' },
  { word: 'オレンジ',   hint: '🟠 いろ' },
  { word: 'ピンク',     hint: '💗 いろ' },
  // てんき (Weather)
  { word: 'はれ',       hint: '☀️ てんき' },
  { word: 'くもり',     hint: '☁️ てんき' },
  { word: 'あめ',       hint: '🌧️ てんき' },
  { word: 'ゆき',       hint: '❄️ てんき' },
  { word: 'かみなり',   hint: '⚡ てんき' },
  { word: 'たいふう',   hint: '🌀 てんき' },
  { word: 'にじ',       hint: '🌈 てんき' },
  { word: 'かぜ',       hint: '💨 てんき' },
  // からだ (Body)
  { word: 'あたま',     hint: '🧠 からだ' },
  { word: 'め',         hint: '👁️ からだ' },
  { word: 'みみ',       hint: '👂 からだ' },
  { word: 'はな',       hint: '👃 からだ' },
  { word: 'くち',       hint: '👄 からだ' },
  { word: 'て',         hint: '✋ からだ' },
  { word: 'あし',       hint: '🦶 からだ' },
  { word: 'ゆび',       hint: '👆 からだ' },
  // たべもの (Food)
  { word: 'おにぎり',   hint: '🍙 たべもの' },
  { word: 'すし',       hint: '🍣 たべもの' },
  { word: 'ラーメン',   hint: '🍜 たべもの' },
  { word: 'カレー',     hint: '🍛 たべもの' },
  { word: 'ピザ',       hint: '🍕 たべもの' },
  { word: 'ハンバーガー', hint: '🍔 たべもの' },
  { word: 'ケーキ',     hint: '🎂 たべもの' },
  { word: 'パン',       hint: '🍞 たべもの' },
  { word: 'たまご',     hint: '🥚 たべもの' },
  { word: 'サラダ',     hint: '🥗 たべもの' },
  { word: 'アイス',     hint: '🍦 たべもの' },
  { word: 'チョコレート', hint: '🍫 たべもの' },
  // しぜん (Nature)
  { word: 'やま',       hint: '⛰️ しぜん' },
  { word: 'うみ',       hint: '🌊 しぜん' },
  { word: 'かわ',       hint: '🏞️ しぜん' },
  { word: 'もり',       hint: '🌲 しぜん' },
  { word: 'はな',       hint: '🌸 しぜん' },
  { word: 'つき',       hint: '🌙 しぜん' },
  { word: 'ほし',       hint: '⭐ しぜん' },
  { word: 'たいよう',   hint: '☀️ しぜん' },
  // せいかつ (Daily life)
  { word: 'いえ',       hint: '🏠 せいかつ' },
  { word: 'がっこう',   hint: '🏫 せいかつ' },
  { word: 'ほん',       hint: '📖 せいかつ' },
  { word: 'えんぴつ',   hint: '✏️ せいかつ' },
  { word: 'かばん',     hint: '🎒 せいかつ' },
  { word: 'とけい',     hint: '⏰ せいかつ' },
  { word: 'かぎ',       hint: '🔑 せいかつ' },
  { word: 'めがね',     hint: '👓 せいかつ' },
  { word: 'かさ',       hint: '☂️ せいかつ' },
  { word: 'でんわ',     hint: '📞 せいかつ' },
  // スポーツ (Sports)
  { word: 'サッカー',   hint: '⚽ スポーツ' },
  { word: 'やきゅう',   hint: '⚾ スポーツ' },
  { word: 'テニス',     hint: '🎾 スポーツ' },
  { word: 'すいえい',   hint: '🏊 スポーツ' },
  { word: 'バスケット', hint: '🏀 スポーツ' },
  // しごと (Occupations)
  { word: 'いしゃ',     hint: '👨‍⚕️ しごと' },
  { word: 'せんせい',   hint: '👩‍🏫 しごと' },
  { word: 'けいさつ',   hint: '👮 しごと' },
  { word: 'コック',     hint: '👨‍🍳 しごと' },
];

const DISTRACTORS = ['あ','い','う','え','お','か','き','く','け','こ',
                     'さ','し','す','せ','そ','た','ち','つ','て','と',
                     'な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ',
                     'ま','み','む','め','も','や','ゆ','よ','ら','り',
                     'る','れ','ろ','わ','を','ん',
                     'ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ',
                     'サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト',
                     'ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ',
                     'マ','ミ','ム','メ','モ','ヤ','ユ','ヨ','ラ','リ',
                     'ル','レ','ロ','ワ','ン','ー'];

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
  document.getElementById('wl-best').textContent = wlBest;
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
    localStorage.setItem('wlBest', wlBest);
  }
  document.getElementById('wl-start-btn').style.display = 'inline-flex';
  document.getElementById('wl-start-btn').textContent = 'もう一度';
  document.getElementById('wl-clear-btn').style.display = 'none';
  const rank = getScoreRank(wlScore, WL_RANKS);
  showResult('🔤', 'タイムアップ！', `${wlTotalTime}秒で ${wlScore} 問正解！ (ベスト: ${wlBest})`, wlStart, rank);
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
