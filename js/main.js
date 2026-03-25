/* ===== SCREEN ROUTING ===== */
let currentScreen = 'home';

function showScreen(id) {
  sfx.nav();
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
  if (typeof mpStop === 'function') mpStop();
  if (typeof plStop === 'function') plStop();
  if (typeof cwStop === 'function') cwStop();
  if (typeof bnStop === 'function') bnStop();
  if (typeof blStop === 'function') blStop();
  if (typeof pnStop === 'function') pnStop();
  if (typeof mnStop === 'function') mnStop();
  if (typeof gnStop === 'function') gnStop();
  if (typeof acStop === 'function') acStop();
  if (typeof spdStop === 'function') spdStop();
  if (typeof eqtStop === 'function') eqtStop();
  if (typeof norStop === 'function') norStop();
  if (typeof ocStop === 'function') ocStop();
  if (typeof hlStop === 'function') hlStop();
  if (typeof cseqStop === 'function') cseqStop();
  if (typeof phStop === 'function') phStop();
  if (typeof fcmpStop === 'function') fcmpStop();
  if (typeof cflipStop === 'function') cflipStop();
  if (typeof bplanStop === 'function') bplanStop();
  if (typeof ccntStop === 'function') ccntStop();
  if (id === 'home') refreshBestScores();
}

/* ===== BEST SCORES ON GAME CARDS ===== */
const BS_MAPPING = [
  { target: 'visual-calc',   key: 'vcBest' },
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
  { target: 'shell-game',    key: 'sgBest' },
  { target: 'just-stop',     key: 'jsBest' },
  { target: 'word-link',     key: 'wlBest' },
  { target: 'sequence-memory',key: 'smBest' },
  { target: 'emoji-order',   key: 'eoBest' },
  { target: 'color-vision',  key: ['cv_best_easy','cv_best_normal','cv_best_hard'] },
  { target: 'color-code',    key: ['cc_best_color2hex','cc_best_hex2color'] },
  { target: 'mirror-path',   key: 'mpBest' },
  { target: 'pair-logic',    key: 'plBest' },
  { target: 'chain-word',   key: 'cwBest' },
  { target: 'big-number',    key: 'bnBest' },
  { target: 'balance-scale', key: 'blBest' },
  { target: 'pattern-next',  key: 'pnBest' },
  { target: 'mental-nav',    key: 'mnBest' },
  { target: 'go-nogo',       key: 'gnBest' },
  { target: 'apple-catch',   key: 'acBest' },
  { target: 'speed-sum',    key: ['spd_best_easy','spd_best_normal','spd_best_hard'] },
  { target: 'eq-judge',     key: ['eqt_best_easy','eqt_best_normal','eqt_best_hard'] },
  { target: 'num-order',    key: ['nor_best_easy','nor_best_normal','nor_best_hard'] },
  { target: 'obj-count',    key: ['oc_best_easy','oc_best_normal','oc_best_hard'] },
  { target: 'hi-lo',        key: 'hlBest' },
  { target: 'color-seq',   key: 'cseqBest' },
  { target: 'prime-hunt',  key: ['ph_best_easy','ph_best_normal','ph_best_hard'] },
  { target: 'frac-cmp',    key: ['fcmp_best_easy','fcmp_best_normal','fcmp_best_hard'] },
  { target: 'card-flip',   key: ['cflip_best_easy','cflip_best_normal','cflip_best_hard'], reverse: true, suffix: '手' },
  { target: 'budget-plan', key: ['bplan_best_easy','bplan_best_normal','bplan_best_hard'] },
  { target: 'cube-count',  key: ['ccnt_best_easy','ccnt_best_normal','ccnt_best_hard'] }];

function refreshBestScores() {
  BS_MAPPING.forEach(g => {
    if (!g.key) return;
    const card = document.querySelector(`[onclick="showScreen('${g.target}')"]`);
    if (!card) return;

    let best = g.reverse ? Infinity : -Infinity;
    let hasScore = false;
    
    if (Array.isArray(g.key)) {
      g.key.forEach(k => {
        const raw = localStorage.getItem(k);
        if (raw !== null) {
          hasScore = true;
          const v = parseFloat(raw);
          if (!isNaN(v)) {
            if (g.reverse && v < best) best = v;
            else if (!g.reverse && v > best) best = v;
          }
        }
      });
    } else {
      const raw = localStorage.getItem(g.key);
      if (raw !== null) {
        hasScore = true;
        const v = parseFloat(raw);
        if (!isNaN(v)) best = v;
      }
    }
    
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
  sfx.result();
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
