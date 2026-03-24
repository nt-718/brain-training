/* ===== SCREEN ROUTING ===== */
let currentScreen = 'home';

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  currentScreen = id;
  if (typeof vcStop === 'function') vcStop();
  if (typeof ntStop === 'function') ntStop();
  if (typeof mmStop === 'function') mmStop();
  if (typeof cmStop === 'function') cmStop();
  if (typeof nbStop === 'function') nbStop();
  if (typeof fmStop === 'function') fmStop();
  if (typeof tsStop === 'function') tsStop();
  if (typeof slStop === 'function') slStop();
  if (typeof ssStop === 'function') ssStop();
  if (typeof sgStop === 'function') sgStop();
  if (typeof jsStop === 'function') jsStop();
  if (typeof wlStop === 'function') wlStop();
  if (typeof smStop === 'function') smStop();
  if (typeof eoStop === 'function') eoStop();
  if (typeof cvStop === 'function') cvStop();
  if (typeof ccStop === 'function') ccStop();
  if (id === 'home') refreshBestScores();
}

/* ===== BEST SCORES ON GAME CARDS ===== */
const BS_MAPPING = [
  { target: 'visual-calc',   key: null },
  { target: 'num-tap',       key: 'nt_best_random', suffix: 's', reverse: true },
  { target: 'memory-matrix', key: ['mm_best_easy','mm_best_normal','mm_best_hard'] },
  { target: 'color-match',   key: 'cm_best' },
  { target: 'n-back',        key: ['nb_best_1','nb_best_2','nb_best_3'] },
  { target: 'flash-math',    key: ['fm_best_number_easy','fm_best_number_normal','fm_best_number_hard',
                                   'fm_best_visual_easy','fm_best_visual_normal','fm_best_visual_hard',
                                   'fm_best_mixed_easy','fm_best_mixed_normal','fm_best_mixed_hard'] },
  { target: 'target-search', key: 'tsBest' },
  { target: 'symbol-logic',  key: 'slBest' },
  { target: 'swipe-sort',    key: 'ssBest' },
  { target: 'color-vision',  key: ['cv_best_easy','cv_best_normal','cv_best_hard'] },
  { target: 'color-code',    key: ['cc_best_color2hex','cc_best_hex2color'] }
];

function refreshBestScores() {
  BS_MAPPING.forEach(g => {
    if (!g.key) return;
    const card = document.querySelector(`[onclick="showScreen('${g.target}')"]`);
    if (!card) return;

    let best = g.reverse ? Infinity : 0;
    
    if (Array.isArray(g.key)) {
      g.key.forEach(k => {
        const v = parseFloat(localStorage.getItem(k));
        if (!isNaN(v)) {
          if (g.reverse && v < best) best = v;
          else if (!g.reverse && v > best) best = v;
        }
      });
    } else {
      const v = parseFloat(localStorage.getItem(g.key));
      if (!isNaN(v)) best = v;
    }

    const hasScore = g.reverse ? (best !== Infinity) : (best > 0);
    
    let badge = card.querySelector('.card-best-score');
    if (hasScore) {
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'card-best-score';
        card.appendChild(badge);
      }
      const display = g.suffix ? best + g.suffix : best;
      badge.textContent = `🏆 ${display}`;
    } else if (badge) {
      badge.remove();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  refreshBestScores();
  
  // Accessibility: Make game cards keyboard navigable
  document.querySelectorAll('.game-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
});

/* ===== RESULT OVERLAY ===== */
let _retryFn = null;

function showResult(icon, title, detail, onRetry) {
  document.getElementById('res-icon').textContent   = icon;
  document.getElementById('res-title').textContent  = title;
  const detailEl = document.getElementById('res-detail');
  detailEl.innerHTML = detail.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  _retryFn = onRetry;
  document.getElementById('result-overlay').classList.add('show');
}

function resultHome() {
  document.getElementById('result-overlay').classList.remove('show');
  showScreen('home');
}

function resultRetry() {
  document.getElementById('result-overlay').classList.remove('show');
  if (_retryFn) _retryFn();
}

/* ===== UTILITIES ===== */
function rand(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
