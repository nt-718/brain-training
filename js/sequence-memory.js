/* ===== SEQUENCE MEMORY GAME ===== */

let smState   = 'idle'; // idle, playing, input
let smSeq     = [];
let smUserSeq = [];
let smLevel   = 0;
let smBest    = 0;
let smPlayIdx = 0;
let smPlayTimeout = null;

const SM_COLORS = ['green', 'red', 'blue', 'yellow']; // matches button order

// Web Audio API for sound feedback
const smAudioCtx = typeof AudioContext !== 'undefined' ? new AudioContext() : (typeof webkitAudioContext !== 'undefined' ? new webkitAudioContext() : null);
const SM_TONES = { green: 261.63, red: 329.63, blue: 392.00, yellow: 493.88 }; // C4, E4, G4, B4

function smPlayTone(color, duration = 0.3) {
  if (!smAudioCtx) return;
  if (smAudioCtx.state === 'suspended') smAudioCtx.resume();
  const osc = smAudioCtx.createOscillator();
  const gain = smAudioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = SM_TONES[color] || 440;
  gain.gain.setValueAtTime(0.3, smAudioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, smAudioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(smAudioCtx.destination);
  osc.start();
  osc.stop(smAudioCtx.currentTime + duration);
}

function smStart() {
  smSeq   = [];
  smLevel = 0;
  smBest  = Math.max(smBest, 0);
  document.getElementById('sm-score').textContent = 0;
  document.getElementById('sm-start-btn').style.display = 'none';
  smNextLevel();
}

function smStop() {
  if (smPlayTimeout) clearTimeout(smPlayTimeout);
  smPlayTimeout = null;
  smState = 'idle';
  document.getElementById('sm-start-btn').style.display = 'inline-flex';
  document.getElementById('sm-start-btn').textContent = 'スタート';
  document.getElementById('sm-message').textContent = 'スタートを押してください';
  document.getElementById('sm-level-display').textContent = 'レベル -';
  smSetButtonsDisabled(true);
  smClearLit();
}

function smSetButtonsDisabled(disabled) {
  document.querySelectorAll('.sm-btn').forEach(b => b.disabled = disabled);
}

function smClearLit() {
  document.querySelectorAll('.sm-btn').forEach(b => b.classList.remove('lit'));
}

function smNextLevel() {
  smLevel++;
  smUserSeq = [];
  document.getElementById('sm-score').textContent = smLevel - 1;
  document.getElementById('sm-level-display').textContent = `レベル ${smLevel}`;
  document.getElementById('sm-message').textContent = '覚えて！';

  // Add one color to sequence
  smSeq.push(SM_COLORS[rand(0, 3)]);

  smSetButtonsDisabled(true);
  smPlayIdx = 0;

  // Delay before playback
  smPlayTimeout = setTimeout(() => smPlayNext(), 600);
}

function smPlayNext() {
  if (smPlayIdx >= smSeq.length) {
    // Playback done - accept input
    document.getElementById('sm-message').textContent = '同じ順番にタップ！';
    smSetButtonsDisabled(false);
    smState = 'input';
    return;
  }

  const color = smSeq[smPlayIdx];
  const btn = document.getElementById(`sm-btn-${color}`);
  btn.classList.add('lit');
  smPlayTone(color, smLevel <= 5 ? 0.5 : smLevel <= 10 ? 0.35 : 0.25);

  smPlayTimeout = setTimeout(() => {
    btn.classList.remove('lit');
    smPlayIdx++;
    smPlayTimeout = setTimeout(() => smPlayNext(), 250);
  }, smLevel <= 5 ? 600 : smLevel <= 10 ? 450 : 300);
}

function smTap(color) {
  if (smState !== 'input') return;

  const btn = document.getElementById(`sm-btn-${color}`);
  btn.classList.add('lit');
  smPlayTone(color, 0.15);
  setTimeout(() => btn.classList.remove('lit'), 150);

  smUserSeq.push(color);
  const idx = smUserSeq.length - 1;

  if (smUserSeq[idx] !== smSeq[idx]) {
    // Wrong
    smState = 'idle';
    smSetButtonsDisabled(true);

    // Flash all red briefly
    document.querySelectorAll('.sm-btn').forEach(b => b.style.filter = 'brightness(1.6) saturate(0)');
    setTimeout(() => document.querySelectorAll('.sm-btn').forEach(b => b.style.filter = ''), 400);

    if (smLevel - 1 > smBest) {
      smBest = smLevel - 1;
      document.getElementById('sm-best').textContent = smBest;
    }
    document.getElementById('sm-message').textContent = '残念...';
    setTimeout(() => {
      document.getElementById('sm-start-btn').style.display = 'inline-flex';
      document.getElementById('sm-start-btn').textContent = 'もう一度';
      showResult('🎵', 'ゲームオーバー！', `レベル ${smLevel - 1} まで到達！ (ベスト: ${smBest})`, smStart);
    }, 800);
    return;
  }

  if (smUserSeq.length === smSeq.length) {
    // Level cleared
    smState = 'playing';
    smSetButtonsDisabled(true);
    document.getElementById('sm-message').textContent = `レベル ${smLevel} クリア！✨`;
    smPlayTimeout = setTimeout(() => smNextLevel(), 1000);
  }
}
