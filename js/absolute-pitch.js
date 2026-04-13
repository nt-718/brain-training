/* ===== ABSOLUTE PITCH TRAINER (絶対音感) ===== */

// 1. Define RANKS (7 tiers, descending min score)
var AP_RANKS = [
  { min: 50, label: '伝説級',        emoji: '👑', color: '#f59e0b' },
  { min: 40, label: '絶対音感の達人', emoji: '🏆', color: '#8b5cf6' },
  { min: 30, label: '音楽家',        emoji: '💫', color: '#3b82f6' },
  { min: 22, label: '上級者',        emoji: '⭐', color: '#10b981' },
  { min: 14, label: '中級者',        emoji: '🌟', color: '#6ee7b7' },
  { min: 6,  label: '聞き習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',      emoji: '🌱', color: '#64748b' },
];

// 2. LocalStorage Key
const AP_BEST_KEY = 'ap_best';

const AP_NOTES = [
  { id: 'C',  name: 'ド', alpha: 'C4', freq: 261.63 },
  { id: 'D',  name: 'レ', alpha: 'D4', freq: 293.66 },
  { id: 'E',  name: 'ミ', alpha: 'E4', freq: 329.63 },
  { id: 'F',  name: 'ファ', alpha: 'F4', freq: 349.23 },
  { id: 'G',  name: 'ソ', alpha: 'G4', freq: 392.00 },
  { id: 'A',  name: 'ラ', alpha: 'A4', freq: 440.00 },
  { id: 'B',  name: 'シ', alpha: 'B4', freq: 493.88 },
  { id: 'C2', name: 'ド', alpha: 'C5', freq: 523.25 },
];

const AP_HARD_NOTES = [
  ...AP_NOTES,
  { id: 'Cs', name: 'ド♯', alpha: 'C#', freq: 277.18 },
  { id: 'Ds', name: 'レ♯', alpha: 'D#', freq: 311.13 },
  { id: 'Fs', name: 'ファ♯', alpha: 'F#', freq: 369.99 },
  { id: 'Gs', name: 'ソ♯', alpha: 'G#', freq: 415.30 },
  { id: 'As', name: 'ラ♯', alpha: 'A#', freq: 466.16 },
];

// 3. State Variables
let apRunning = false;
let apScore = 0;
let apRound = 0;
const AP_MAX_ROUNDS = 20;
let apCurrentNote = null;
let apDifficulty = 'normal';
let apAnswered = false;

// 4. Initialization
function apLoadBest() {
  const best = localStorage.getItem(AP_BEST_KEY) || 0;
  const bestEl = document.getElementById('ap-best');
  if (bestEl) bestEl.textContent = best;
}

function apSetDiff(btn, diff) {
  apDifficulty = diff;
  document.querySelectorAll('#absolute-pitch .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  apLoadBest();
}

// 5. STOP FUNCTION
function apStop() {
  apRunning = false;
  document.getElementById('ap-start-btn').style.display = 'inline-block';
  document.getElementById('ap-play-area').style.display = 'none';
  document.getElementById('ap-answer-grid').style.display = 'none';
  document.getElementById('ap-message').textContent = 'スタートを押してください';
  document.getElementById('ap-message').className = 'ap-message';
  const playBtn = document.getElementById('ap-play-btn');
  if (playBtn) playBtn.classList.remove('playing');
}

// 6. START FUNCTION
function apStart() {
  apStop();
  apRunning = true;
  apScore = 0;
  apRound = 0;
  document.getElementById('ap-score').textContent = 0;
  document.getElementById('ap-start-btn').style.display = 'none';
  document.getElementById('ap-play-area').style.display = 'flex';
  document.getElementById('ap-answer-grid').style.display = 'grid';
  apLoadBest();
  apNextRound();
}

// 7. GAME LOGIC
function apNextRound() {
  if (!apRunning) return;
  if (apRound >= AP_MAX_ROUNDS) {
    apEnd();
    return;
  }

  apRound++;
  apAnswered = false;
  document.getElementById('ap-round').textContent = `${apRound} / ${AP_MAX_ROUNDS}`;
  document.getElementById('ap-message').textContent = '音を聴いてください';
  document.getElementById('ap-message').className = 'ap-message';

  // Pick random note based on difficulty
  let pool = AP_NOTES;
  if (apDifficulty === 'easy') {
    pool = AP_NOTES.filter(n => ['C', 'E', 'G'].includes(n.id));
  } else if (apDifficulty === 'hard') {
    pool = AP_HARD_NOTES;
  }
  
  // Show/Hide buttons based on pool
  const btns = document.querySelectorAll('.ap-note-btn');
  btns.forEach(btn => {
    const noteId = btn.getAttribute('data-note');
    const exists = pool.some(n => n.id === noteId);
    btn.style.display = exists ? 'flex' : 'none';
  });
  
  apCurrentNote = pool[Math.floor(Math.random() * pool.length)];
  
  // Highlight play button to encourage tapping
  const playBtn = document.getElementById('ap-play-btn');
  playBtn.classList.add('playing');
  setTimeout(() => playBtn.classList.remove('playing'), 1000);

  // Auto-play the first time? No, let's wait for user tap to avoid policy issues
  // But for better flow, we can play it if they've already interacted.
  if (apRound > 1) {
    // Play slightly after screen update
    setTimeout(apPlayCurrentNote, 300);
  }
}

function apPlayCurrentNote() {
  if (!apRunning || !apCurrentNote) return;
  const playBtn = document.getElementById('ap-play-btn');
  playBtn.classList.add('playing');
  
  // Tone duration based on difficulty?
  const duration = apDifficulty === 'hard' ? 0.4 : 0.6;
  sfx.playNote(apCurrentNote.freq, duration);
  
  setTimeout(() => {
    playBtn.classList.remove('playing');
  }, duration * 1000);
}

function apAnswer(noteId) {
  if (!apRunning || apAnswered || !apCurrentNote) return;
  apAnswered = true;

  const isCorrect = (noteId === apCurrentNote.id);
  const msgEl = document.getElementById('ap-message');

  if (isCorrect) {
    apScore++;
    document.getElementById('ap-score').textContent = apScore;
    msgEl.textContent = '正解！ ' + apCurrentNote.name;
    msgEl.className = 'ap-message correct';
    sfx.correct();
  } else {
    msgEl.textContent = '違うよ！ 正解は ' + apCurrentNote.name;
    msgEl.className = 'ap-message wrong';
    sfx.wrong();
  }

  setTimeout(() => {
    if (apRunning) apNextRound();
  }, 1200);
}

// 8. END FUNCTION
function apEnd() {
  apRunning = false;
  const prev = parseInt(localStorage.getItem(AP_BEST_KEY)) || 0;
  const isNewRecord = apScore > prev;
  
  if (isNewRecord) {
    localStorage.setItem(AP_BEST_KEY, apScore);
  }
  
  const rank = getScoreRank(apScore, AP_RANKS);
  showResult(
    isNewRecord ? '🏆' : '🎵',
    'ゲーム終了',
    `スコア: ${apScore} / ${AP_MAX_ROUNDS}\n${isNewRecord ? '新記録達成！' : 'ベスト: ' + prev}`,
    apStart,
    rank
  );
  
  if (typeof refreshBestScores === 'function') refreshBestScores();
  saveScore('absolute-pitch', 'default', apScore);
}
