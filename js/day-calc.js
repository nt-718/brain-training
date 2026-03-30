/* ===== 曜日計算 (day-calc) ===== */

var DC_RANKS = [
  { min: 50, label: '伝説', emoji: '👑', color: '#f59e0b' },
  { min: 35, label: '達人', emoji: '🏆', color: '#8b5cf6' },
  { min: 22, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 12, label: '上級者', emoji: '⭐', color: '#10b981' },
  { min: 6, label: '中級者', emoji: '🌟', color: '#6ee7b7' },
  { min: 1, label: '見習い', emoji: '🔰', color: '#94a3b8' },
  { min: 0, label: 'まだまだ', emoji: '🌱', color: '#64748b' },
];

const DC_DAYS = ['月', '火', '水', '木', '金', '土', '日'];

const DC_CONFIG = {
  easy: { yearMin: 2020, yearMax: 2025 },
  normal: { yearMin: 2000, yearMax: 2030 },
  hard: { yearMin: 1950, yearMax: 2050 },
};

let dcState = {
  playing: false,
  difficulty: 'easy',
  score: 0,
  timer: null,
  timeLeft: 0,
  currentAnswer: null,
  answering: false,
};

function dcGetBestKey() {
  return 'dc_best_' + dcState.difficulty;
}

function dcLoadBest() {
  const best = localStorage.getItem(dcGetBestKey()) || 0;
  document.getElementById('dc-best').textContent = best;
}

function dcSetDiff(btn, diff) {
  if (dcState.playing) return;
  sfx.tap();
  document.querySelectorAll('#dc-diff-row .diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  dcState.difficulty = diff;
  dcLoadBest();
}

function dcStop() {
  dcState.playing = false;
  dcState.answering = false;
  clearInterval(dcState.timer);
  document.getElementById('dc-diff-row').style.pointerEvents = 'auto';
  document.getElementById('dc-diff-row').style.opacity = '1';
  document.getElementById('dc-timer-fill').style.width = '100%';
  document.getElementById('dc-stage').style.display = 'none';
  document.getElementById('dc-start-btn').style.display = 'block';
  document.getElementById('dc-date-display').textContent = '';
  document.getElementById('dc-feedback').textContent = '';
}

function dcStart() {
  sfx.start();
  dcState.playing = true;
  dcState.answering = true;
  dcState.score = 0;
  dcState.timeLeft = 180000;
  document.getElementById('dc-score').textContent = '0';
  document.getElementById('dc-diff-row').style.pointerEvents = 'none';
  document.getElementById('dc-diff-row').style.opacity = '0.5';
  document.getElementById('dc-stage').style.display = 'flex';
  document.getElementById('dc-start-btn').style.display = 'none';

  dcNextQuestion();

  dcState.timer = setInterval(() => {
    dcState.timeLeft -= 100;
    if (dcState.timeLeft <= 0) {
      dcState.timeLeft = 0;
      dcEnd();
    }
    document.getElementById('dc-timer-fill').style.width = (dcState.timeLeft / 180000 * 100) + '%';
  }, 100);
}

// Date オブジェクトで曜日を取得 → DC_DAYS のインデックス（月=0…日=6）を返す
function dcGetDayOfWeek(year, month, day) {
  const d = new Date(year, month - 1, day).getDay(); // 0=日, 1=月, ..., 6=土
  return (d + 6) % 7; // 月=0, 火=1, ..., 日=6
}

function dcGenerateDate() {
  const cfg = DC_CONFIG[dcState.difficulty];
  const year = cfg.yearMin + Math.floor(Math.random() * (cfg.yearMax - cfg.yearMin + 1));
  const month = 1 + Math.floor(Math.random() * 12);
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = 1 + Math.floor(Math.random() * daysInMonth);
  return { year, month, day };
}

function dcNextQuestion() {
  const date = dcGenerateDate();
  dcState.currentAnswer = dcGetDayOfWeek(date.year, date.month, date.day);
  dcState.answering = true;

  document.getElementById('dc-date-display').textContent =
    `${date.year}年${date.month}月${date.day}日`;
  document.getElementById('dc-feedback').textContent = '何曜日？';
  document.getElementById('dc-feedback').className = 'dc-feedback';

  document.querySelectorAll('.dc-day-btn').forEach(b => {
    b.classList.remove('dc-correct', 'dc-wrong');
    b.disabled = false;
  });
}

function dcAnswer(dayIndex, btn) {
  if (!dcState.playing || !dcState.answering) return;
  dcState.answering = false;
  document.querySelectorAll('.dc-day-btn').forEach(b => b.disabled = true);

  if (dayIndex === dcState.currentAnswer) {
    sfx.correct();
    dcState.score++;
    document.getElementById('dc-score').textContent = dcState.score;
    btn.classList.add('dc-correct');
    document.getElementById('dc-feedback').textContent = '✓ 正解！';
    document.getElementById('dc-feedback').className = 'dc-feedback dc-ok';
    setTimeout(() => { if (dcState.playing) dcNextQuestion(); }, 400);
  } else {
    sfx.wrong();
    btn.classList.add('dc-wrong');
    document.querySelectorAll('.dc-day-btn')[dcState.currentAnswer].classList.add('dc-correct');
    document.getElementById('dc-feedback').textContent = `✗ ${DC_DAYS[dcState.currentAnswer]}曜日`;
    document.getElementById('dc-feedback').className = 'dc-feedback dc-ng';
    setTimeout(() => { if (dcState.playing) dcNextQuestion(); }, 800);
  }
}

function dcEnd() {
  dcStop();
  const key = dcGetBestKey();
  const prev = parseInt(localStorage.getItem(key) || '0', 10);
  const record = dcState.score > prev;
  if (record) {
    localStorage.setItem(key, dcState.score);
    document.getElementById('dc-best').textContent = dcState.score;
  }
  const diffLabel = { easy: 'かんたん', normal: 'ふつう', hard: 'むずかしい' }[dcState.difficulty];
  const rank = getScoreRank(dcState.score, DC_RANKS);
  showResult(
    record ? '🏆' : '📅',
    'タイムアップ！',
    `難易度: ${diffLabel}\nスコア: ${dcState.score}問\n${record ? '🎉 新記録！' : 'ベスト: ' + Math.max(prev, dcState.score) + '問'}`,
    dcStart,
    rank
  );
  refreshBestScores();
}

document.addEventListener('DOMContentLoaded', () => {
  dcLoadBest();
});
