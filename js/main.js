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
  if (typeof ccolStop === 'function') ccolStop();
  if (typeof mtenStop === 'function') mtenStop();
  if (typeof fsdStop === 'function') fsdStop();
  if (typeof rpStop === 'function') rpStop();
  if (typeof omStop === 'function') omStop();
  if (typeof dcStop === 'function') dcStop();
  if (id === 'home') refreshBestScores();
}

/* ===== BEST SCORES ON GAME CARDS ===== */
const BS_MAPPING = [
  { target: 'visual-calc',    key: 'vcBest',                                                                     ranksVar: 'VC_RANKS' },
  { target: 'num-tap',        key: 'nt_best_random',        suffix: 's', reverse: true,                          ranksVar: 'NT_RANKS' },
  { target: 'memory-matrix',  key: ['mm_best_easy','mm_best_normal','mm_best_hard'],                              ranksVar: 'MM_RANKS' },
  { target: 'color-match',    key: 'cm_best',                                                                     ranksVar: 'CM_RANKS' },
  { target: 'n-back',         key: ['nb_best_1','nb_best_2','nb_best_3'],                                         ranksVar: 'NB_RANKS' },
  { target: 'flash-math',     key: ['fm_best_number_easy','fm_best_number_normal','fm_best_number_hard',
                                    'fm_best_visual_easy','fm_best_visual_normal','fm_best_visual_hard',
                                    'fm_best_mixed_easy','fm_best_mixed_normal','fm_best_mixed_hard'],             ranksVar: 'FM_RANKS' },
  { target: 'target-search',  key: 'tsBest',                                                                      ranksVar: 'TS_RANKS' },
  { target: 'symbol-logic',   key: 'slBest',                                                                      ranksVar: 'SL_RANKS' },
  { target: 'swipe-sort',     key: 'ssBest',                                                                      ranksVar: 'SS_RANKS' },
  { target: 'shell-game',     key: 'sgBest',                                                                      ranksVar: 'SG_RANKS' },
  { target: 'just-stop',      key: 'jsBest',                                                                      ranksVar: 'JS_RANKS' },
  { target: 'word-link',      key: 'wlBest',                                                                      ranksVar: 'WL_RANKS' },
  { target: 'sequence-memory',key: 'smBest',                                                                      ranksVar: 'SM_RANKS' },
  { target: 'emoji-order',    key: 'eoBest',                                                                      ranksVar: 'EO_RANKS' },
  { target: 'color-vision',   key: ['cv_best_easy','cv_best_normal','cv_best_hard'],                              ranksVar: 'CV_RANKS' },
  { target: 'color-code',     key: ['cc_best_color2hex','cc_best_hex2color'],                                     ranksVar: 'CC_RANKS' },
  { target: 'mirror-path',    key: 'mpBest',                                                                      ranksVar: 'MP_RANKS' },
  { target: 'pair-logic',     key: 'plBest',                                                                      ranksVar: 'PL_RANKS' },
  { target: 'chain-word',     key: 'cwBest',                                                                      ranksVar: 'CW_RANKS' },
  { target: 'big-number',     key: 'bnBest',                                                                      ranksVar: 'BN_RANKS' },
  { target: 'balance-scale',  key: 'blBest',                                                                      ranksVar: 'BL_RANKS' },
  { target: 'pattern-next',   key: 'pnBest',                                                                      ranksVar: 'PN_RANKS' },
  { target: 'mental-nav',     key: 'mnBest',                                                                      ranksVar: 'MN_RANKS' },
  { target: 'go-nogo',        key: 'gnBest',                                                                      ranksVar: 'GN_RANKS' },
  { target: 'apple-catch',    key: 'acBest',                                                                      ranksVar: 'AC_RANKS' },
  { target: 'speed-sum',      key: ['spd_best_easy','spd_best_normal','spd_best_hard'],                           ranksVar: 'SPD_RANKS' },
  { target: 'eq-judge',       key: ['eqt_best_easy','eqt_best_normal','eqt_best_hard'],                           ranksVar: 'EQT_RANKS' },
  { target: 'num-order',      key: ['nor_best_easy','nor_best_normal','nor_best_hard'],                           ranksVar: 'NOR_RANKS' },
  { target: 'obj-count',      key: ['oc_best_easy','oc_best_normal','oc_best_hard'],                              ranksVar: 'OC_RANKS' },
  { target: 'hi-lo',          key: 'hlBest',                                                                      ranksVar: 'HL_RANKS' },
  { target: 'color-seq',      key: 'cseqBest',                                                                    ranksVar: 'CSEQ_RANKS' },
  { target: 'prime-hunt',     key: ['ph_best_easy','ph_best_normal','ph_best_hard'],                              ranksVar: 'PH_RANKS' },
  { target: 'frac-cmp',       key: ['fcmp_best_easy','fcmp_best_normal','fcmp_best_hard'],                        ranksVar: 'FCMP_RANKS' },
  { target: 'card-flip',      key: ['cflip_best_easy','cflip_best_normal','cflip_best_hard'], reverse: true, suffix: '手', ranksVar: 'CFLIP_RANKS' },
  { target: 'budget-plan',    key: ['bplan_best_easy','bplan_best_normal','bplan_best_hard'],                     ranksVar: 'BPLAN_RANKS' },
  { target: 'cube-count',     key: ['ccnt_best_easy','ccnt_best_normal','ccnt_best_hard'],                        ranksVar: 'CCNT_RANKS' },
  { target: 'comp-color',     key: ['ccol_best_easy','ccol_best_normal','ccol_best_hard'],                        ranksVar: 'CCOL_RANKS' },
  { target: 'make-ten',       key: 'mten_best',                                                                   ranksVar: 'MTEN_RANKS' },
  { target: 'flash-sudoku',   key: ['fsd_best_easy','fsd_best_normal','fsd_best_hard'],                           ranksVar: 'FSD_RANKS' },
  { target: 'race-pos',       key: ['rp_best_easy','rp_best_normal','rp_best_hard'],                               ranksVar: 'RP_RANKS' },
  { target: 'otp-memory',     key: ['om_best_easy','om_best_normal','om_best_hard'],                               ranksVar: 'OM_RANKS' },
  { target: 'day-calc',       key: ['dc_best_easy','dc_best_normal','dc_best_hard'],                               ranksVar: 'DC_RANKS' }];

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
      if (g.ranksVar && window[g.ranksVar]) {
        const rank = getScoreRank(best, window[g.ranksVar]);
        badge.innerHTML = `<span style="color:${rank.color}">${rank.emoji}</span> ${display}`;
        badge.style.cursor = 'pointer';
        badge.dataset.ranksVar = g.ranksVar;
        badge.onclick = (e) => { e.stopPropagation(); showRankGuide(badge.dataset.ranksVar); };
      } else {
        badge.textContent = `🏆 ${display}`;
        badge.style.cursor = '';
        badge.onclick = null;
      }
    } else if (badge) {
      badge.remove();
    }
  });
}

/* ===== UPDATE POPUP ===== */
// 新しいお知らせを追加するときはここに追加するだけでOK
const ANNOUNCEMENTS = [
  {
    id: 'ann_20260326',
    icon: '🎮',
    title: '新しいゲームを追加しました！',
    items: [
      '🔢 <strong>メイク10</strong> — 数字を組み合わせて10を作ろう',
      '⚡ <strong>フラッシュ数独</strong> — 一瞬表示される数独の問題を解こう',
      '🎨 <strong>補色を探せ</strong> — 色の補色を素早く見つけよう',
    ]
  },
  {
    id: 'ann_20260327',
    icon: '🏃',
    title: '新しいゲームを追加しました！',
    items: [
      '🏃 <strong>レース順位</strong> — 抜いたり抜かれたりして最終何位か当てよう',
    ]
  },
  {
    id: 'ann_20260329',
    icon: '🔐',
    title: '新しいゲームを追加しました！',
    items: [
      '🔐 <strong>OTPメモリー</strong> — ワンタイムパスワードを记忆して入力しよう',
    ]
  },
  {
    id: 'ann_20260329b',
    icon: '📅',
    title: '新しいゲームを追加しました！',
    items: [
      '📅 <strong>曜日計算</strong> — 日付から曜日を素早く当てよう',
    ]
  },
  {
    id: 'ann_20260329c',
    icon: '👹',
    title: 'シェルゲームに難易度「鬼」を追加しました！',
    items: [
      '👹 <strong>シェルゲーム［鬼］</strong> — カップ8個・星3つ・超高速シャッフルに挑戦！',
    ]
  }
];

let _currentAnnouncementId = null;

function _getSeenAnnouncements() {
  try { return JSON.parse(localStorage.getItem('seenAnnouncements') || '[]'); }
  catch { return []; }
}

function checkUpdatePopup() {
  const seen = _getSeenAnnouncements();
  const unseen = ANNOUNCEMENTS.filter(a => !seen.includes(a.id));
  if (unseen.length === 0) return;
  const ann = unseen[unseen.length - 1];
  _currentAnnouncementId = ann.id;
  document.getElementById('popup-icon').textContent = ann.icon;
  document.getElementById('popup-title').textContent = ann.title;
  document.getElementById('popup-list').innerHTML = ann.items.map(item => `<li>${item}</li>`).join('');
  document.getElementById('update-popup-overlay').classList.add('show');
}

function closeUpdatePopup() {
  document.getElementById('update-popup-overlay').classList.remove('show');
}

function dismissUpdatePopup() {
  if (_currentAnnouncementId) {
    const seen = _getSeenAnnouncements();
    if (!seen.includes(_currentAnnouncementId)) {
      seen.push(_currentAnnouncementId);
      localStorage.setItem('seenAnnouncements', JSON.stringify(seen));
    }
  }
  document.getElementById('update-popup-overlay').classList.remove('show');
}

document.addEventListener('DOMContentLoaded', () => {
  refreshBestScores();
  checkUpdatePopup();

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

function showResult(icon, title, detail, onRetry, rank = null) {
  sfx.result();
  document.getElementById('res-icon').textContent   = icon;
  document.getElementById('res-title').textContent  = title;
  const detailEl = document.getElementById('res-detail');
  detailEl.innerHTML = detail.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  const rankEl = document.getElementById('res-rank');
  if (rank) {
    rankEl.style.display = '';
    rankEl.innerHTML = `<span class="rank-badge" style="--rank-color:${rank.color}">${rank.emoji} ${rank.label}</span>`;
  } else {
    rankEl.style.display = 'none';
  }
  _retryFn = onRetry;
  document.getElementById('result-overlay').classList.add('show');
}

/* ===== SCORE RANK UTILITY ===== */
// ranks: [{ min, label, emoji, color }, ...] sorted highest first
function getScoreRank(score, ranks) {
  for (const rank of ranks) {
    if ('max' in rank ? score <= rank.max : score >= rank.min) return rank;
  }
  return ranks[ranks.length - 1];
}

function showRankGuide(ranksVar) {
  const ranks = window[ranksVar];
  if (!ranks) return;
  const isReverse = 'max' in ranks[0];
  const unit = ranks.unit || '点';
  document.getElementById('rank-guide-content').innerHTML = ranks.map((r, i) => {
    let range;
    if (isReverse) {
      const prev = ranks[i - 1];
      const from = prev ? prev.max + 1 : null;
      const to   = r.max === Infinity ? null : r.max;
      range = from === null ? `〜${to}${unit}` : to === null ? `${from}${unit}〜` : `${from}〜${to}${unit}`;
    } else {
      const next = ranks[i - 1];
      range = next ? `${r.min}〜${next.min - 1}点` : `${r.min}点〜`;
    }
    return `<div class="rank-guide-row">
      <span class="rank-guide-badge" style="--rank-color:${r.color}">${r.emoji} ${r.label}</span>
      <span class="rank-guide-score">${range}</span>
    </div>`;
  }).join('');
  document.getElementById('rank-guide-overlay').classList.add('show');
}

function closeRankGuide() {
  document.getElementById('rank-guide-overlay').classList.remove('show');
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
