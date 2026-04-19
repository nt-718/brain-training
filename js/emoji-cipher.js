/* ===== EMOJI CIPHER (絵文字暗号) ===== */

// 1. Ranks (var for window access)
var EC_RANKS = [
  { min: 140, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 120, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 100, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 80,  label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 60,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 40,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,   label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

// 2. LocalStorage Key
const EC_BEST_KEY = 'ec_best';
const EC_GAME_TIME = 180;

// 3. Emoji pool (50 emojis needed for full table)
const EC_EMOJIS = [
  '🌸','🔥','🌙','💎','⭐','🍎','🐱','🌊','🎵','💧',
  '🌺','🍊','🐶','🎈','🍰','🌻','🍇','🐸','🎀','🍋',
  '🌹','🍒','🐰','🎁','🍩','🌷','🍅','🐻','🎪','🍬',
  '🌼','🍓','🐼','🎨','🍭','🌿','🍑','🐧','🎯','🍮',
  '🌾','🍈','🐦','🎲','🍡','🌵','🍐','🐝','🎻','🍫',
  '🌴','🍄','🐞','🎹','🍿','🌈','🍆','🐙','🎺','🧁'
];

// 4. Sentence pools by difficulty
const EC_SENTENCES = {
  easy: [
    'あした','さくら','やまと','おはな','みかん',
    'うみべ','きつね','たぬき','ひかり','そらら',
    'にわか','せかい','まつり','はなび','ことり',
    'あめが','つくえ','ほしい','くるま','ともだ',
    'いのち','おかし','えがお','うたう','あるく',
    'ちから','ねこが','みどり','かぜが','ゆきが',
    'からす','とびら','さかな','はるか','おそら',
    'くもり','あおい','しろい','ひろい','ふかい',
  ],
  normal: [
    'あしたはれる','さくらさいた','おはようです',
    'やまにのぼる','うみであそぶ','ねこがねてる',
    'ほしがきれい','いぬとさんぽ','おやすみなさ',
    'たのしいひだ','ありがとうね','はなびたいか',
    'まつりのよる','こうえんへい','おやつのじか',
    'なつやすみだ','そらがあおい','かぜがつよい',
    'おおきなゆめ','ちいさなしあ','きょうもいい',
    'にほんがすき','しずかなよる','わらってるよ',
    'あさごはんだ','でんわしてね','えほんをよむ',
    'おかえりなさ','つきがきれい','ゆうやけそら',
    'あめがあがる','にじがでたよ','みんなげんき',
    'がんばろうね','たべるのすき','おおきなかぶ',
    'ぶんかのひだ','こどもがすき','ともだちつく',
    'むかしむかし',
  ],
  hard: [
    'あしたのてんきはどうかな',
    'さくらのきがさいています',
    'おはようございますげんき',
    'やまにのぼってけしきみた',
    'うみであそんでたのしかっ',
    'ねこがまどのそばでねてる',
    'おやすみなさいよいゆめを',
    'たのしいいちにちでしたね',
    'ありがとうきもちがうれし',
    'まつりのよるにはなびみた',
    'ほしがきれいにみえるよる',
    'きょうはとてもいいてんき',
    'あさからそらがまっさおだ',
    'にほんのなつはあついです',
    'あめがふったらかさをさす',
    'にじがおおきくみえたよね',
    'いっしょにおべんとうたべ',
    'こうえんでともだちとあそ',
    'みんなでちからをあわせよ',
    'おおきくなったらなにする',
    'えほんをよんでねむくなっ',
    'おかしをたくさんもらった',
    'でんしゃにのってでかけた',
    'ゆうがたのそらがうつくし',
    'ちいさなはなががさいてる',
    'おかあさんありがとうです',
    'なかよくいっしょにあるこ',
    'すずしいかぜがきもちいい',
    'うたをうたってたのしもう',
    'おおきなにじがかかったよ',
  ],
};

// Hiragana character set for keyboard and map
const EC_HIRAGANA_ROWS = [
  ['あ','い','う','え','お'],
  ['か','き','く','け','こ'],
  ['さ','し','す','せ','そ'],
  ['た','ち','つ','て','と'],
  ['な','に','ぬ','ね','の'],
  ['は','ひ','ふ','へ','ほ'],
  ['ま','み','む','め','も'],
  ['や','　','ゆ','　','よ'],
  ['ら','り','る','れ','ろ'],
  ['わ','　','　','　','を'],
  ['ん','　','　','　','　']
];

// Native input event listener for Enter key
document.addEventListener('DOMContentLoaded', () => {
  const ecInputEl = document.getElementById('ec-input-field');
  if (ecInputEl) {
    ecInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        ecSubmit();
      }
    });
  }
});

// 5. State vars
let ecRunning = false;
let ecScore = 0;
let ecCorrectCount = 0;
let ecTimeLeft = 0;
let ecTimerInterval = null;
let ecWaiting = false;
let ecDiff = 'easy';
let ecCurrentMap = {};
let ecCurrentAnswer = '';
let ecUsedIndices = [];

function ecSetDiff(btn, diff) {
  document.querySelectorAll('#ec-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  ecDiff = diff;
  ecLoadBest();
}

function ecLoadBest() {
  const b = localStorage.getItem(EC_BEST_KEY) || 0;
  document.getElementById('ec-best').textContent = b;
}

function ecStop() {
  ecRunning = false;
  ecWaiting = false;
  if (ecTimerInterval) clearInterval(ecTimerInterval);
  const startBtn = document.getElementById('ec-start-btn');
  if (startBtn) startBtn.style.display = '';
  const mapArea = document.getElementById('ec-map-area');
  if (mapArea) mapArea.innerHTML = '';
  const cipherArea = document.getElementById('ec-cipher-text');
  if (cipherArea) cipherArea.textContent = '🔐 絵文字暗号';
  const inputEl = document.getElementById('ec-input-field');
  if (inputEl) inputEl.value = '';
  const timerFill = document.getElementById('ec-timer-fill');
  if (timerFill) timerFill.style.width = '100%';
  
  // Clean up any remaining answer hints
  const hints = document.querySelectorAll('.ec-answer-hint');
  hints.forEach(h => h.remove());
}

function ecStart() {
  ecStop();
  ecRunning = true;
  ecScore = 0;
  ecCorrectCount = 0;
  ecTimeLeft = EC_GAME_TIME;
  ecUsedIndices = [];
  document.getElementById('ec-score').textContent = 0;
  document.getElementById('ec-q-num').textContent = 0;
  document.getElementById('ec-start-btn').style.display = 'none';
  
  ecLoadBest();
  ecNextQuestion();
  
  ecUpdateTimerBar();
  ecTimerInterval = setInterval(() => {
    ecTimeLeft -= 1;
    ecUpdateTimerBar();
    if (ecTimeLeft <= 0) {
      ecEnd();
    }
  }, 1000);
}

function ecUpdateTimerBar() {
  const pct = Math.max(0, (ecTimeLeft / EC_GAME_TIME) * 100);
  const fill = document.getElementById('ec-timer-fill');
  if (fill) {
    fill.style.width = pct + '%';
    fill.style.background = pct < 20 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
  }
}


function ecGenerateMap() {
  // Always use the full a-i-u-e-o table (46 chars + spaces)
  let flatChars = [];
  EC_HIRAGANA_ROWS.forEach(row => {
    row.forEach(ch => {
      if (ch !== '　') {
        flatChars.push(ch);
      }
    });
  });
  
  // Pick random emojis for the 46 chars
  const emojiPool = shuffle([...EC_EMOJIS]);
  const map = {};
  flatChars.forEach((ch, i) => {
    map[ch] = emojiPool[i % emojiPool.length];
  });

  return map;
}

function ecNextQuestion() {
  if (!ecRunning) return;
  ecWaiting = false;
  const inputEl = document.getElementById('ec-input-field');
  if (inputEl) {
    inputEl.value = '';
    inputEl.focus();
  }

  // Pick sentence
  const pool = EC_SENTENCES[ecDiff];
  if (ecUsedIndices.length >= pool.length) {
    ecUsedIndices = []; // Reset pool if exhausted
  }
  let idx;
  do {
    idx = Math.floor(Math.random() * pool.length);
  } while (ecUsedIndices.includes(idx));
  ecUsedIndices.push(idx);

  ecCurrentAnswer = pool[idx];
  
  // Every question generates a new random map
  ecCurrentMap = ecGenerateMap();

  // Render map
  ecRenderMap();

  // Render cipher text
  const cipherText = [...ecCurrentAnswer].map(ch => {
    // Check base char (for dakuten etc, we might need to map them back to base char + dakuten marker)
    // Wait, the cipher text only contains base hiragana from the sentence pools!
    return ecCurrentMap[ch] || '❓';
  }).join('');
  document.getElementById('ec-cipher-text').textContent = cipherText;
}

function ecRenderMap() {
  const mapArea = document.getElementById('ec-map-area');
  mapArea.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'ec-map-grid';

  EC_HIRAGANA_ROWS.forEach(row => {
    row.forEach(ch => {
      const item = document.createElement('div');
      item.className = 'ec-map-item';
      if (ch === '　') {
        item.classList.add('ec-map-empty');
      } else {
        const emoji = ecCurrentMap[ch];
        item.innerHTML = `<span class="ec-map-emoji">${emoji}</span><span class="ec-map-char">${ch}</span>`;
      }
      grid.appendChild(item);
    });
  });
  
  mapArea.appendChild(grid);
}

function ecSubmit() {
  if (!ecRunning || ecWaiting) return;
  ecWaiting = true;

  const inputEl = document.getElementById('ec-input-field');
  const userText = (inputEl.value || '').trim();
  const isCorrect = userText === ecCurrentAnswer;
  const cipherText = document.getElementById('ec-cipher-text');

  if (isCorrect) {
    ecScore += 10;
    ecCorrectCount++;
    document.getElementById('ec-score').textContent = ecScore;
    document.getElementById('ec-q-num').textContent = ecCorrectCount;
    sfx.correct();
    flashGameContent(true, 'ec-content');
    inputEl.classList.add('ec-correct');
  } else {
    sfx.wrong();
    flashGameContent(false, 'ec-content');
    inputEl.classList.add('ec-wrong');
    const answerHint = document.createElement('div');
    answerHint.className = 'ec-answer-hint';
    answerHint.textContent = '→ ' + ecCurrentAnswer;
    cipherText.parentNode.insertBefore(answerHint, cipherText.nextSibling);
    setTimeout(() => { if (answerHint) answerHint.remove(); }, 1500);
  }

  setTimeout(() => {
    inputEl.classList.remove('ec-correct', 'ec-wrong');
    inputEl.value = '';
    if (ecRunning) ecNextQuestion();
  }, 1500);
}

function ecEnd() {
  ecRunning = false;
  clearInterval(ecTimerInterval);
  
  const inputEl = document.getElementById('ec-input-field');
  if (inputEl) inputEl.blur();

  const prev = parseInt(localStorage.getItem(EC_BEST_KEY)) || 0;
  const isNewRecord = ecScore > prev;

  if (isNewRecord) {
    localStorage.setItem(EC_BEST_KEY, ecScore);
  }

  const rank = getScoreRank(ecScore, EC_RANKS);
  saveScore('emoji-cipher', ecDiff, ecScore);

  showResult(
    isNewRecord ? '🏆' : '🔐',
    'ゲーム終了！',
    `スコア: ${ecScore}\n${isNewRecord ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    ecStart,
    rank
  );

  if (typeof refreshBestScores === 'function') refreshBestScores();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
