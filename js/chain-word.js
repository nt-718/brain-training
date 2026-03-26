/* ===== CHAIN WORD GAME ===== */

var CW_RANKS = [
  { min: 22, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 17, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 13, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 9,  label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 6,  label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 3,  label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

let cwState = 'idle';
let cwChain = 0;
let cwBest  = parseInt(localStorage.getItem('cwBest')) || 0;
let cwTimerInterval = null;
const CW_TIME_PER_Q = 8; // seconds per question

// Word association pairs: { prompt, answer }
const CW_DATA = [
  { prompt: '海',     answer: '波' },
  { prompt: '波',     answer: '砂浜' },
  { prompt: '砂浜',   answer: '貝殻' },
  { prompt: '貝殻',   answer: '真珠' },
  { prompt: '空',     answer: '雲' },
  { prompt: '雲',     answer: '雨' },
  { prompt: '雨',     answer: '傘' },
  { prompt: '傘',     answer: '水たまり' },
  { prompt: '山',     answer: '雪' },
  { prompt: '雪',     answer: '冬' },
  { prompt: '冬',     answer: 'コート' },
  { prompt: '夏',     answer: 'スイカ' },
  { prompt: 'スイカ', answer: '縞模様' },
  { prompt: '春',     answer: '桜' },
  { prompt: '桜',     answer: 'お花見' },
  { prompt: 'お花見', answer: 'お弁当' },
  { prompt: 'お弁当', answer: '公園' },
  { prompt: '公園',   answer: 'ブランコ' },
  { prompt: '秋',     answer: '紅葉' },
  { prompt: '紅葉',   answer: '落ち葉' },
  { prompt: '花',     answer: '蜂' },
  { prompt: '蜂',     answer: '蜜' },
  { prompt: '蜜',     answer: '甘い' },
  { prompt: '甘い',   answer: 'チョコ' },
  { prompt: 'チョコ', answer: 'バレンタイン' },
  { prompt: '犬',     answer: 'しっぽ' },
  { prompt: 'ねこ',   answer: 'ひげ' },
  { prompt: '鳥',     answer: '羽' },
  { prompt: '羽',     answer: '飛行機' },
  { prompt: '飛行機', answer: '空港' },
  { prompt: '空港',   answer: 'スーツケース' },
  { prompt: 'スーツケース', answer: '旅行' },
  { prompt: '旅行',   answer: 'ホテル' },
  { prompt: 'ホテル', answer: 'ベッド' },
  { prompt: 'ベッド', answer: '枕' },
  { prompt: '枕',     answer: '夢' },
  { prompt: '夢',     answer: '眠り' },
  { prompt: '本',     answer: '図書館' },
  { prompt: '図書館', answer: '静寂' },
  { prompt: '学校',   answer: '教室' },
  { prompt: '教室',   answer: '黒板' },
  { prompt: '黒板',   answer: 'チョーク' },
  { prompt: '火',     answer: '炎' },
  { prompt: '炎',     answer: '太陽' },
  { prompt: '太陽',   answer: '光' },
  { prompt: '光',     answer: '影' },
  { prompt: '影',     answer: '夜' },
  { prompt: '夜',     answer: '星' },
  { prompt: '星',     answer: '宇宙' },
  { prompt: '宇宙',   answer: 'ロケット' },
  { prompt: 'ロケット', answer: '月' },
  { prompt: '月',     answer: 'うさぎ' },
  { prompt: '魚',     answer: '水族館' },
  { prompt: '水族館', answer: 'イルカ' },
  { prompt: 'サッカー', answer: 'ボール' },
  { prompt: 'ボール', answer: 'グラウンド' },
  { prompt: '電車',   answer: '駅' },
  { prompt: '駅',     answer: '改札' },
  { prompt: '改札',   answer: '切符' },
  { prompt: '料理',   answer: 'フライパン' },
  { prompt: 'フライパン', answer: '卵' },
  { prompt: '卵',     answer: 'ニワトリ' },
  { prompt: 'ニワトリ', answer: '農場' },
  { prompt: '農場',   answer: '牛' },
  { prompt: '牛',     answer: '牛乳' },
  { prompt: '牛乳',   answer: 'チーズ' },
  { prompt: 'チーズ', answer: 'ピザ' },
  { prompt: 'ピザ',   answer: 'イタリア' },
  { prompt: 'カメラ', answer: '写真' },
  { prompt: '写真',   answer: 'アルバム' },
  { prompt: '音楽',   answer: 'ギター' },
  { prompt: 'ギター', answer: 'バンド' },
  { prompt: 'バンド', answer: 'ライブ' },
  { prompt: '医者',   answer: '病院' },
  { prompt: '病院',   answer: '注射' },
  { prompt: '注射',   answer: '痛い' },
  { prompt: 'ケーキ', answer: 'バースデー' },
  { prompt: 'バースデー', answer: 'プレゼント' },
  { prompt: 'プレゼント', answer: 'リボン' },
  { prompt: 'コーヒー', answer: 'カフェ' },
  { prompt: 'カフェ', answer: '読書' },
  { prompt: 'お風呂', answer: '温泉' },
  { prompt: '温泉',   answer: '旅館' },
  { prompt: '旅館',   answer: '浴衣' },
  { prompt: '浴衣',   answer: '祭り' },
  { prompt: '祭り',   answer: '花火' },
  { prompt: '花火',   answer: '夏祭り' },
  { prompt: 'りんご', answer: '赤' },
  { prompt: '赤',     answer: '信号' },
  { prompt: '信号',   answer: '交差点' },
  { prompt: '交差点', answer: '車' },
  { prompt: '車',     answer: 'ガソリン' },
  { prompt: 'ガソリン', answer: '石油' },
  { prompt: '石油',   answer: '砂漠' },
  { prompt: '砂漠',   answer: 'サボテン' },
  { prompt: 'サボテン', answer: 'とげ' },
  { prompt: '図書館', answer: '本棚' },
  { prompt: '本棚',   answer: '辞書' },
  { prompt: '辞書',   answer: '言葉' },
  { prompt: '言葉',   answer: '詩' },
  { prompt: '詩',     answer: '俳句' },
  { prompt: '俳句',   answer: '松尾芭蕉' },
  { prompt: '子ども', answer: '笑顔' },
  { prompt: '笑顔',   answer: '幸せ' },
  { prompt: '幸せ',   answer: '家族' },
  { prompt: '家族',   answer: '食卓' },
  { prompt: '食卓',   answer: '夕食' },
  { prompt: '夕食',   answer: 'カレー' },
  { prompt: 'カレー', answer: 'スパイス' },
  { prompt: 'スパイス', answer: 'インド' },
  { prompt: 'インド', answer: 'ガンジス川' },
  { prompt: '川',     answer: '魚釣り' },
  { prompt: '魚釣り', answer: '釣り竿' },
  { prompt: '釣り竿', answer: '糸' },
  { prompt: '糸',     answer: '針' },
  { prompt: '針',     answer: '裁縫' },
  { prompt: '裁縫',   answer: '服' },
  { prompt: '服',     answer: 'ファッション' },
  { prompt: 'ファッション', answer: 'パリ' },
  { prompt: 'パリ',   answer: 'エッフェル塔' },
  { prompt: 'エッフェル塔', answer: 'フランス' },
];

function cwStart() {
  cwChain = 0;
  cwState = 'playing';
  document.getElementById('cw-start-btn').style.display = 'none';
  document.getElementById('cw-best').textContent = cwBest;
  cwUpdateChain();
  cwNextQuestion();
}

function cwStop() {
  if (cwTimerInterval) clearInterval(cwTimerInterval);
  cwTimerInterval = null;
  cwState = 'idle';
  document.getElementById('cw-start-btn').style.display = 'inline-flex';
  document.getElementById('cw-start-btn').textContent = 'スタート';
  document.getElementById('cw-prompt-word').textContent = '？';
  document.getElementById('cw-choices').innerHTML = '';
  document.getElementById('cw-timer-fill').style.width = '100%';
  document.getElementById('cw-timer-fill').style.background = '';
  cwChain = 0;
  cwUpdateChain();
}

function cwUpdateChain() {
  document.getElementById('cw-chain-count').textContent = cwChain;
}

function cwNextQuestion() {
  if (cwState !== 'playing') return;

  const pair = CW_DATA[rand(0, CW_DATA.length - 1)];
  const promptEl = document.getElementById('cw-prompt-word');
  promptEl.textContent = pair.prompt;
  promptEl.classList.remove('cw-pop');

  // Build choices: 1 correct + 3 distractors from other answers
  const otherAnswers = CW_DATA
    .map(d => d.answer)
    .filter(a => a !== pair.answer && a !== pair.prompt);
  const distractors = shuffle([...otherAnswers]).slice(0, 3);
  const choices = shuffle([pair.answer, ...distractors]);

  const container = document.getElementById('cw-choices');
  container.innerHTML = '';
  choices.forEach(word => {
    const btn = document.createElement('button');
    btn.className = 'cw-choice-btn';
    btn.textContent = word;
    btn.onclick = () => cwAnswer(btn, word === pair.answer);
    container.appendChild(btn);
  });

  cwStartTimer();
}

function cwStartTimer() {
  if (cwTimerInterval) clearInterval(cwTimerInterval);
  const fill = document.getElementById('cw-timer-fill');
  fill.style.width = '100%';
  fill.style.background = 'linear-gradient(90deg, #8b5cf6, #a78bfa)';

  const start = Date.now();
  cwTimerInterval = setInterval(() => {
    const elapsed = (Date.now() - start) / 1000;
    const remaining = CW_TIME_PER_Q - elapsed;
    const pct = Math.max(0, (remaining / CW_TIME_PER_Q) * 100);
    fill.style.width = pct + '%';
    if (pct < 30) {
      fill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
    }
    if (remaining <= 0) {
      clearInterval(cwTimerInterval);
      cwTimerInterval = null;
      cwGameOver(true);
    }
  }, 50);
}

function cwAnswer(btn, isCorrect) {
  if (cwState !== 'playing') return;
  cwState = 'answering';
  if (cwTimerInterval) clearInterval(cwTimerInterval);
  cwTimerInterval = null;

  // Disable all buttons
  document.querySelectorAll('.cw-choice-btn').forEach(b => { b.onclick = null; });

  if (isCorrect) {
    btn.classList.add('correct');
    cwChain++;
    cwUpdateChain();

    const promptEl = document.getElementById('cw-prompt-word');
    void promptEl.offsetWidth;
    promptEl.classList.add('cw-pop');

    setTimeout(() => {
      cwState = 'playing';
      if (currentScreen === 'chain-word') cwNextQuestion();
    }, 400);
  } else {
    btn.classList.add('wrong');
    const promptArea = document.getElementById('cw-prompt-area');
    promptArea.classList.remove('cw-shake');
    void promptArea.offsetWidth;
    promptArea.classList.add('cw-shake');

    setTimeout(() => cwGameOver(false), 600);
  }
}

function cwGameOver(isTimeout) {
  cwState = 'idle';
  const isBest = cwChain > cwBest;
  if (isBest) {
    cwBest = cwChain;
    localStorage.setItem('cwBest', cwBest);
    document.getElementById('cw-best').textContent = cwBest;
  }
  document.getElementById('cw-start-btn').style.display = 'inline-flex';
  document.getElementById('cw-start-btn').textContent = 'もう一度';

  const icon   = isTimeout ? '⏱️' : '❌';
  const reason = isTimeout ? 'タイムアップ！' : '不正解！';
  const bestStr = isBest ? '🎉 新記録！' : `ベスト: ${cwBest}`;
  const rank = getScoreRank(cwChain, CW_RANKS);
  showResult(icon, reason, `チェーン数: ${cwChain}\n${bestStr}`, cwStart, rank);
}
