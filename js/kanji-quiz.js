/* ===== KANJI QUIZ (難読漢字) ===== */

var KQ_RANKS = [
  { min: 300, label: '伝説', emoji: '👑', color: '#f59e0b' },
  { min: 240, label: '達人', emoji: '🏆', color: '#8b5cf6' },
  { min: 180, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 120, label: '上級者', emoji: '⭐', color: '#10b981' },
  { min: 80, label: '中級者', emoji: '🌟', color: '#6ee7b7' },
  { min: 40, label: '見習い', emoji: '🔰', color: '#94a3b8' },
  { min: 0, label: 'まだまだ', emoji: '🌱', color: '#64748b' },
];

const KQ_BEST_KEY = 'kq_best';
const KQ_TOTAL_Q = 10;
const KQ_TIME_PER_Q = 10;

const KQ_DATA = {
  '魚類': [
    { k: '鮪', r: 'まぐろ' }, { k: '鰹', r: 'かつお' }, { k: '鯵', r: 'あじ' }, { k: '鯖', r: 'さば' },
    { k: '鰯', r: 'いわし' }, { k: '鱚', r: 'きす' }, { k: '鰻', r: 'うなぎ' }, { k: '鮭', r: 'さけ' },
    { k: '鯛', r: 'たい' }, { k: '鱈', r: 'たら' }, { k: '鮃', r: 'ひらめ' }, { k: '鰈', r: 'かれい' },
    { k: '鰆', r: 'さわら' }, { k: '鰌', r: 'どじょう' }, { k: '鯔', r: 'ぼら' }, { k: '鯒', r: 'こち' },
    { k: '鯣', r: 'するめ' }, { k: '鱟', r: 'かぶとがに' }, { k: '鮎', r: 'あゆ' }, { k: '鮓', r: 'すし' }
  ],
  '植物': [
    { k: '薊', r: 'あざみ' }, { k: '柊', r: 'ひいらぎ' }, { k: '薇', r: 'ぜんまい' }, { k: '葵', r: 'あおい' },
    { k: '菫', r: 'すみれ' }, { k: '菖蒲', r: 'あやめ' }, { k: '牡丹', r: 'ぼたん' }, { k: '芍薬', r: 'しゃくやく' },
    { k: '杜若', r: 'かきつば' }, { k: '雛菊', r: 'ひなぎく' }, { k: '鳳仙花', r: 'ほうせんか' }, { k: '鈴蘭', r: 'すずらん' },
    { k: '柘榴', r: 'ざくろ' }, { k: '枇杷', r: 'びわ' }, { k: '葡萄', r: 'ぶどう' }, { k: '無花果', r: 'いちじく' },
    { k: '仙人掌', r: 'さぼてん' }, { k: '葦', r: 'あし' }, { k: '茨', r: 'いばら' }, { k: '蓮', r: 'はす' }
  ],
  '動物': [
    { k: '馴鹿', r: 'となかい' }, { k: '海豹', r: 'あざらし' }, { k: '駱駝', r: 'らくだ' }, { k: '栗鼠', r: 'りす' },
    { k: '鼬', r: 'いたち' }, { k: '獏', r: 'ばく' }, { k: '羚羊', r: 'かもしか' }, { k: '麒麟', r: 'きりん' },
    { k: '熊猫', r: 'ぱんだ' }, { k: '縞馬', r: 'しまうま' }, { k: '穿山甲', r: 'せんざんこう' }, { k: '山荒', r: 'やまあらし' },
    { k: '猩猩', r: 'しょうじょう' }, { k: '狒狒', r: 'ひひ' }, { k: '豹', r: 'ひょう' }, { k: '鼠', r: 'ねずみ' }
  ],
  '鳥類': [
    { k: '鸚鵡', r: 'おうむ' }, { k: '翡翠', r: 'かわせみ' }, { k: '鴎', r: 'かもめ' }, { k: '雉', r: 'きじ' },
    { k: '鴛鴦', r: 'おしどり' }, { k: '鴇', r: 'とき' }, { k: '梟', r: 'ふくろう' }, { k: '鸚哥', r: 'いんこ' },
    { k: '鶺鴒', r: 'せきれい' }, { k: '鶫', r: 'つぐみ' }, { k: '雲雀', r: 'ひばり' }, { k: '啄木鳥', r: 'きつつき' },
    { k: '鵜', r: 'う' }, { k: '鴉', r: 'からす' }, { k: '鵲', r: 'かささぎ' }
  ],
  '昆虫': [
    { k: '蜻蛉', r: 'とんぼ' }, { k: '蟷螂', r: 'かまきり' }, { k: '蜘蛛', r: 'くも' }, { k: '虻', r: 'あぶ' },
    { k: '蜚蠊', r: 'ごきぶり' }, { k: '蟋蟀', r: 'こおろぎ' }, { k: '蝉', r: 'せみ' }, { k: '蛾', r: 'が' },
    { k: '蚕', r: 'かいこ' }, { k: '鍬形虫', r: 'くわがたむし' }, { k: '兜虫', r: 'かぶとむし' }, { k: '蛍', r: 'ほたる' },
    { k: '蚤', r: 'のみ' }, { k: '蚊', r: 'か' }, { k: '蜂', r: 'はち' }, { k: '蜈蚣', r: 'むかで' }
  ],
  '食物': [
    { k: '羊羹', r: 'ようかん' }, { k: '饅頭', r: 'まんじゅう' }, { k: '饂飩', r: 'うどん' }, { k: '蕎麦', r: 'そば' },
    { k: '檸檬', r: 'れもん' }, { k: '蜜柑', r: 'みかん' }, { k: '梨', r: 'なし' }, { k: '李', r: 'すもも' },
    { k: '杏', r: 'あんず' }, { k: '苺', r: 'いちご' }, { k: '桜桃', r: 'さくらんぼ' }, { k: '橄欖', r: 'かんらん' },
    { k: '乾酪', r: 'ちーず' }, { k: '麺麭', r: 'ぱん' }, { k: '餅', r: 'もち' }, { k: '粥', r: 'かゆ' }, { k: '飴', r: 'あめ' }
  ]
};

let kqRunning = false;
let kqScore = 0;
let kqQNum = 0;
let kqAnswer = null;
let kqTimerLeft = 0;
let kqTimerInterval = null;
let kqWaiting = false;

function kqLoadBest() {
  const b = localStorage.getItem(KQ_BEST_KEY) || 0;
  document.getElementById('kq-best').textContent = b;
}

function kqStop() {
  kqRunning = false;
  kqWaiting = false;
  if (kqTimerInterval) clearInterval(kqTimerInterval);
  document.getElementById('kq-start-btn').style.display = '';
  document.getElementById('kq-choices').style.display = 'none';
  document.getElementById('kq-question-kanji').textContent = '難読漢字';
  document.getElementById('kq-cat-badge').textContent = '準備完了';
  document.getElementById('kq-timer-fill').style.width = '100%';
}

function kqStart() {
  kqStop();
  kqRunning = true;
  kqScore = 0;
  kqQNum = 0;
  document.getElementById('kq-score').textContent = 0;
  document.getElementById('kq-start-btn').style.display = 'none';
  document.getElementById('kq-choices').style.display = 'grid';
  kqLoadBest();
  kqNextQuestion();
}

function kqNextQuestion() {
  if (!kqRunning) return;
  if (kqQNum >= KQ_TOTAL_Q) {
    kqEnd();
    return;
  }
  kqQNum++;
  kqWaiting = false;
  document.getElementById('kq-q-num').textContent = `${kqQNum}/${KQ_TOTAL_Q}`;

  // Random Category
  const cats = Object.keys(KQ_DATA);
  const cat = cats[Math.floor(Math.random() * cats.length)];
  const items = KQ_DATA[cat];

  // Target Kanji
  const targetIdx = Math.floor(Math.random() * items.length);
  kqAnswer = items[targetIdx];

  document.getElementById('kq-question-kanji').textContent = kqAnswer.k;
  document.getElementById('kq-cat-badge').textContent = cat;

  // Distractors from same cat
  let others = items.filter((_, i) => i !== targetIdx);
  others = shuffle(others).slice(0, 3);

  const choices = shuffle([kqAnswer, ...others]);
  const choiceContainer = document.getElementById('kq-choices');
  choiceContainer.innerHTML = '';

  choices.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'kq-choice-btn';
    btn.textContent = c.r;
    btn.onclick = () => kqSelect(c);
    choiceContainer.appendChild(btn);
  });

  kqTimerLeft = KQ_TIME_PER_Q;
  kqStartTimer();
}

function kqStartTimer() {
  if (kqTimerInterval) clearInterval(kqTimerInterval);
  kqUpdateTimerBar();
  kqTimerInterval = setInterval(() => {
    kqTimerLeft -= 0.1;
    kqUpdateTimerBar();
    if (kqTimerLeft <= 0) {
      clearInterval(kqTimerInterval);
      kqSelect(null, true); // Timeout
    }
  }, 100);
}

function kqUpdateTimerBar() {
  const pct = Math.max(0, (kqTimerLeft / KQ_TIME_PER_Q) * 100);
  const fill = document.getElementById('kq-timer-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 30 ? 'var(--secondary)' : 'linear-gradient(90deg, var(--accent), var(--primary))';
}

function kqSelect(choice, isTimeout = false) {
  if (!kqRunning || kqWaiting) return;
  kqWaiting = true;
  clearInterval(kqTimerInterval);

  const isCorrect = !isTimeout && choice && choice.k === kqAnswer.k;

  const btns = document.querySelectorAll('.kq-choice-btn');
  btns.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === kqAnswer.r) {
      btn.classList.add('correct');
    } else if (choice && btn.textContent === choice.r && !isCorrect) {
      btn.classList.add('wrong');
    }
  });

  if (isCorrect) {
    kqScore += 10 + Math.floor(kqTimerLeft * 3);
    document.getElementById('kq-score').textContent = kqScore;
    sfx.correct();
    flashGameContent(true, 'kq-content');
  } else {
    sfx.wrong();
    flashGameContent(false, 'kq-content');
  }

  setTimeout(() => {
    if (kqRunning) kqNextQuestion();
  }, 1200);
}

function kqEnd() {
  kqRunning = false;
  clearInterval(kqTimerInterval);

  const prev = parseInt(localStorage.getItem(KQ_BEST_KEY)) || 0;
  const isNewRecord = kqScore > prev;

  if (isNewRecord) {
    localStorage.setItem(KQ_BEST_KEY, kqScore);
  }

  const rank = getScoreRank(kqScore, KQ_RANKS);
  saveScore('kanji-quiz', 'default', kqScore);

  showResult(
    isNewRecord ? '🏆' : '📚',
    'ゲーム終了！',
    `スコア: ${kqScore}\n${isNewRecord ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    kqStart,
    rank
  );

  if (typeof refreshBestScores === 'function') refreshBestScores();
}
