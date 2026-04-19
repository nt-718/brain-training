/* ===== ASSETS ===== */
function renderIcon(icon) {
  if (icon && icon.endsWith('.svg')) {
    return `<img src="${icon}" class="icon-img" alt="">`;
  }
  return icon || '';
}

/* ===== DAILY PICK ===== */
(function initDailyPick() {
  const ALL_GAMES = [
    { id: 'visual-calc', name: 'ドットカウンター', icon: 'assets/icons/dot-counter.svg', cat: '計算', color: 'rgba(251,191,36,0.6)' },
    { id: 'flash-math', name: 'フラッシュサム', icon: '⚡️', cat: '計算', color: 'rgba(251,146,60,0.6)' },
    { id: 'balance-scale', name: 'バランスバトル', icon: '⚖️', cat: '計算', color: 'rgba(250,204,21,0.6)' },
    { id: 'prime-hunt', name: 'プライムハンター', icon: '🔬', cat: '計算', color: 'rgba(45,212,191,0.6)' },
    { id: 'make-ten', name: 'メイク10', icon: 'assets/icons/make-ten.svg', cat: '計算', color: 'rgba(251,113,133,0.6)' },
    { id: 'race-pos', name: 'レースビジョン', icon: '🏃', cat: '計算', color: 'rgba(249,115,22,0.6)' },
    { id: 'day-calc', name: 'カレンダーマスター', icon: '📅', cat: '計算', color: 'rgba(167,139,250,0.6)' },
    { id: 'clock-calc', name: 'クロックマスター', icon: '⏳', cat: '計算', color: 'rgba(96,165,250,0.6)' },
    { id: 'pair-logic', name: 'ペアロジック', icon: '🃏', cat: '論理', color: 'rgba(129,140,248,0.6)' },
    { id: 'pattern-next', name: 'パターンブレイカー', icon: '🔮', cat: '論理', color: 'rgba(192,132,252,0.6)' },
    { id: 'mirror-path', name: 'リバースナビ', icon: '🪞', cat: '論理', color: 'rgba(34,211,238,0.6)' },
    { id: 'mental-nav', name: 'メンタルナビ', icon: '🗺️', cat: '論理', color: 'rgba(20,184,166,0.6)' },
    { id: 'flash-sudoku', name: 'ブラインド数独', icon: '🔦', cat: '論理', color: 'rgba(99,102,241,0.6)' },
    { id: 'lights-out', name: 'ライトアウト', icon: '💡', cat: '論理', color: 'rgba(250,204,21,0.6)' },
    { id: 'memory-matrix', name: 'ライトマトリックス', icon: '🔲', cat: '記憶', color: 'rgba(34,197,94,0.6)' },
    { id: 'n-back', name: 'Nバックチャレンジ', icon: '🔄', cat: '記憶', color: 'rgba(147,51,234,0.6)' },
    { id: 'sequence-memory', name: 'シーケンスマスター', icon: '🌈', cat: '記憶', color: 'rgba(244,114,182,0.6)' },
    { id: 'emoji-order', name: 'エモジメモリー', icon: '🎴', cat: '記憶', color: 'rgba(245,158,11,0.6)' },
    { id: 'color-seq', name: 'カラーチェーン', icon: '🎨', cat: '記憶', color: 'rgba(244,63,94,0.6)' },
    { id: 'card-flip', name: 'ペアフリップ', icon: '🀄', cat: '記憶', color: 'rgba(234,88,12,0.6)' },
    { id: 'otp-memory', name: 'コードメモリー', icon: '🔐', cat: '記憶', color: 'rgba(16,185,129,0.6)' },
    { id: 'num-tap', name: 'ナンバータッチ', icon: '🔢', cat: '反射', color: 'rgba(59,130,246,0.6)' },
    { id: 'color-match', name: 'カラートラップ', icon: '🎭', cat: '反射', color: 'rgba(168,85,247,0.6)' },
    { id: 'apple-catch', name: 'アップルキャッチ', icon: '🍎', cat: '反射', color: 'rgba(220,38,38,0.6)' },
    { id: 'hi-lo', name: 'ハイ＆ロー', icon: '♠️', cat: '反射', color: 'rgba(5,150,105,0.6)' },
    { id: 'just-stop', name: 'パーフェクトストップ', icon: '⏱️', cat: '反射', color: 'rgba(37,99,235,0.6)' },
    { id: 'arrow-swipe', name: 'アローマスター', icon: '↗️', cat: '反射', color: 'rgba(52,211,153,0.6)' },
    { id: 'num-order', name: 'ナンバーオーダー', icon: '🔀', cat: '知覚', color: 'rgba(14,165,233,0.6)' },
    { id: 'obj-count', name: 'フラッシュカウント', icon: '🔵', cat: '知覚', color: 'rgba(8,145,178,0.6)' },
    { id: 'cube-count', name: 'キューブカウント', icon: '🧊', cat: '知覚', color: 'rgba(125,211,252,0.6)' },
    { id: 'shell-game', name: 'シェルゲーム', icon: '🎩', cat: '知覚', color: 'rgba(124,58,237,0.6)' },
    { id: 'color-vision', name: 'カラービジョン', icon: '👁️', cat: '知覚', color: 'rgba(219,39,119,0.6)' },
    { id: 'double-detect', name: 'ダブル検知', icon: '🃏', cat: '判断', color: 'rgba(139,92,246,0.6)' },
    { id: 'kanji-quiz', name: '難読漢字', icon: '📚', cat: '論理', color: 'rgba(139,92,246,0.6)' },
    { id: 'absolute-pitch', name: '絶対音感', icon: '🎵', cat: '知覚', color: 'rgba(167,139,250,0.6)' },
    { id: 'emoji-cipher', name: '絵文字暗号', icon: '🔐', cat: '論理', color: 'rgba(168,85,247,0.6)' },
  ];



  function seededRand(seed) {
    let s = seed;
    return function () {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const rand = seededRand(seed);

    // Pick 3 unique games
    const indices = [];
    const pool = [...Array(ALL_GAMES.length).keys()];
    while (indices.length < 3) {
      const i = Math.floor(rand() * pool.length);
      indices.push(pool.splice(i, 1)[0]);
    }
    const picks = indices.map(i => ALL_GAMES[i]);

    // Render date
    const dateEl = document.getElementById('pick-date');
    if (dateEl) {
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      dateEl.textContent = `${today.getMonth() + 1}/${today.getDate()}（${days[today.getDay()]}）`;
    }

    // Render cards
    const list = document.getElementById('daily-pick-list');
    if (!list) return;
    list.innerHTML = picks.map(g => `
      <div class="pick-card" data-game="${g.id}" onclick="showScreen('${g.id}')" style="--pick-color:${g.color}">
        <div class="pick-icon-wrap">${renderIcon(g.icon)}</div>
        <div class="pick-name">${g.name}</div>
        <div class="pick-cat-badge">${g.cat}</div>
      </div>
    `).join('');

    // Ensure best scores are shown on pickup cards too
    if (typeof refreshBestScores === 'function') refreshBestScores();
  });
})();

/* ===== DEV PICK ===== */
(function initDevPick() {
  const DEV_PICKS = [
    { id: 'visual-calc', name: 'ドットカウンター', icon: 'assets/icons/dot-counter.svg', cat: '計算' },
    { id: 'make-ten', name: 'メイク10', icon: 'assets/icons/make-ten.svg', cat: '計算' },
    { id: 'day-calc', name: 'カレンダーマスター', icon: '📅', cat: '計算' },
    { id: 'clock-calc', name: 'クロックマスター', icon: '⏳', cat: '計算' },
    { id: 'lights-out', name: 'ライトアウト', icon: '💡', cat: '論理' },
    { id: 'memory-matrix', name: 'ライトマトリックス', icon: '🔲', cat: '記憶' },
    { id: 'emoji-order', name: '絵文字メモリー', icon: '🎴', cat: '記憶' },
    { id: 'sequence-memory', name: 'シーケンスマスター', icon: '🌈', cat: '記憶' },
    { id: 'otp-memory', name: 'コードメモリー', icon: '🔐', cat: '記憶' },
    { id: 'num-tap', name: 'ナンバータッチ', icon: '🔢', cat: '反射' },
    { id: 'arrow-swipe', name: 'アローマスター', icon: '↗️', cat: '反射' },
    { id: 'shell-game', name: 'シェルゲーム', icon: '🎩', cat: '知覚' },
    { id: 'color-vision', name: 'カラービジョン', icon: '👁️', cat: '知覚' },
  ];
  const INITIAL_COUNT = 6;
  let expanded = false;

  document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('dev-pick-list');
    if (!list) return;
    list.innerHTML = DEV_PICKS.map((g, i) => `
      <div class="pick-card${i >= INITIAL_COUNT ? ' hidden' : ''}" data-game="${g.id}" onclick="showScreen('${g.id}')">
        <div class="pick-icon-wrap">${renderIcon(g.icon)}</div>
        <div class="pick-name">${g.name}</div>
        <div class="pick-cat-badge">${g.cat}</div>
      </div>
    `).join('');
    if (typeof refreshBestScores === 'function') refreshBestScores();

    // Render global leaderboard
    if (typeof renderGlobalLeaderboard === 'function') {
      renderGlobalLeaderboard('home-global-leaderboard');
    }
  });

  window.toggleDevPick = function () {
    expanded = !expanded;
    const list = document.getElementById('dev-pick-list');
    const label = document.getElementById('dev-pick-more-label');
    const arrow = document.getElementById('dev-pick-more-arrow');
    if (!list) return;
    list.querySelectorAll('.pick-card').forEach((card, i) => {
      if (i >= INITIAL_COUNT) card.classList.toggle('hidden', !expanded);
    });
    label.textContent = expanded ? '閉じる' : 'もっと見る';
    arrow.classList.toggle('open', expanded);
  };
})();

/* ===== CATEGORY NAV ===== */
function scrollToCategory(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  const cat = id.replace('cat-', '');
  const tab = document.querySelector(`.cat-tab[data-cat="${cat}"]`);
  if (tab) tab.classList.add('active');
}

// Highlight tab on scroll
(function initCatTabScroll() {
  const sections = ['calc', 'logic', 'memory', 'reflex', 'perception'];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const cat = e.target.dataset.cat;
        document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
        const tab = document.querySelector(`.cat-tab[data-cat="${cat}"]`);
        if (tab) tab.classList.add('active');
      }
    });
  }, { threshold: 0.3 });
  document.addEventListener('DOMContentLoaded', () => {
    sections.forEach(cat => {
      const el = document.getElementById('cat-' + cat);
      if (el) observer.observe(el);
    });
  });
})();

/* ===== SCREEN ROUTING ===== */
let currentScreen = 'home';
let isTransitioning = false;

// Known valid screen IDs (non-game pages + all games)
const VALID_SCREENS = new Set(['home', 'records', 'stats', 'settings']);

function showScreen(id, skipHistory = false) {
  if (isTransitioning || currentScreen === id) return;
  sfx.nav();
  if (!skipHistory) location.hash = id === 'home' ? '' : id;

  isTransitioning = true;
  const overlay = document.getElementById('scene-transition');
  if (overlay) overlay.classList.add('active'); // 暗転フェードイン

  setTimeout(() => {
    // 完全に暗転した裏側でDomを付け替え、各種ゲームのStop処理を呼ぶ
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
    if (typeof asStop === 'function') asStop();
    if (typeof clStop === 'function') clStop();
    if (typeof loStop === 'function') loStop();
    if (typeof dcaStop === 'function') dcaStop();
    if (typeof ddStop === 'function') ddStop();
    if (typeof tcStop === 'function') tcStop();
    if (typeof efStop === 'function') efStop();
    if (typeof mmutStop === 'function') mmutStop();
    if (typeof kqStop === 'function') kqStop();
    if (typeof apStop === 'function') apStop();
    if (typeof ecStop === 'function') ecStop();
    if (id === 'home') refreshBestScores();
    if (id === 'records') refreshRecords();
    if (id === 'stats') refreshStats();
    if (id === 'game-stats') refreshGameStatsScreen();

    window.scrollTo(0, 0);



    // フェードイン（暗転を解除）
    if (overlay) overlay.classList.remove('active');

    setTimeout(() => {
      isTransitioning = false;
    }, 150); // アニメーション終了待ち
  }, 150); // 暗転までの待ち時間
}

/* ===== HASH ROUTER ===== */
(function initHashRouter() {
  function navigateToHash() {
    const hash = location.hash.replace('#', '') || 'home';

    // game-stats/gameId pattern
    if (hash.startsWith('game-stats/')) {
      const gameId = hash.slice('game-stats/'.length);
      showGameStats(gameId, /*skipHistory=*/true);
      return;
    }

    const el = document.getElementById(hash);
    if (!el || !el.classList.contains('screen')) {
      location.hash = ''; return;
    }

    if (hash === 'settings' && typeof openSettings === 'function') {
      openSettings(true);
    } else {
      showScreen(hash, /*skipHistory=*/true);
    }
  }

  window.addEventListener('hashchange', navigateToHash);

  document.addEventListener('DOMContentLoaded', () => {
    if (location.hash && location.hash !== '#') {
      navigateToHash();
    }
  });
})();

/* ===== BEST SCORES ON GAME CARDS ===== */
const BS_MAPPING = [
  { target: 'visual-calc', key: 'vcBest', ranksVar: 'VC_RANKS' },
  { target: 'num-tap', key: 'nt_best_random', suffix: 's', reverse: true, ranksVar: 'NT_RANKS' },
  { target: 'memory-matrix', key: ['mm_best_easy', 'mm_best_normal', 'mm_best_hard'], ranksVar: 'MM_RANKS' },
  { target: 'color-match', key: 'cm_best', ranksVar: 'CM_RANKS' },
  { target: 'n-back', key: ['nb_best_1', 'nb_best_2', 'nb_best_3'], ranksVar: 'NB_RANKS' },
  {
    target: 'flash-math', key: ['fm_best_number_easy', 'fm_best_number_normal', 'fm_best_number_hard',
      'fm_best_visual_easy', 'fm_best_visual_normal', 'fm_best_visual_hard',
      'fm_best_mixed_easy', 'fm_best_mixed_normal', 'fm_best_mixed_hard'], ranksVar: 'FM_RANKS'
  },
  { target: 'shell-game', key: 'sgBest', ranksVar: 'SG_RANKS' },
  { target: 'just-stop', key: 'jsBest', ranksVar: 'JS_RANKS' },
  { target: 'sequence-memory', key: 'smBest', ranksVar: 'SM_RANKS' },
  { target: 'emoji-order', key: 'eoBest', ranksVar: 'EO_RANKS' },
  { target: 'color-vision', key: ['cv_best_easy', 'cv_best_normal', 'cv_best_hard'], ranksVar: 'CV_RANKS' },
  { target: 'mirror-path', key: 'mpBest', ranksVar: 'MP_RANKS' },
  { target: 'pair-logic', key: 'plBest', ranksVar: 'PL_RANKS' },
  { target: 'balance-scale', key: 'blBest', ranksVar: 'BL_RANKS' },
  { target: 'pattern-next', key: 'pnBest', ranksVar: 'PN_RANKS' },
  { target: 'mental-nav', key: 'mnBest', ranksVar: 'MN_RANKS' },
  { target: 'apple-catch', key: 'acBest', ranksVar: 'AC_RANKS' },
  { target: 'num-order', key: ['nor_best_easy', 'nor_best_normal', 'nor_best_hard'], ranksVar: 'NOR_RANKS' },
  { target: 'obj-count', key: ['oc_best_easy', 'oc_best_normal', 'oc_best_hard'], ranksVar: 'OC_RANKS' },
  { target: 'hi-lo', key: 'hlBest', ranksVar: 'HL_RANKS' },
  { target: 'color-seq', key: 'cseqBest', ranksVar: 'CSEQ_RANKS' },
  { target: 'prime-hunt', key: ['ph_best_easy', 'ph_best_normal', 'ph_best_hard'], ranksVar: 'PH_RANKS' },
  { target: 'card-flip', key: ['cflip_best_easy', 'cflip_best_normal', 'cflip_best_hard'], reverse: true, suffix: '手', ranksVar: 'CFLIP_RANKS' },
  { target: 'cube-count', key: ['ccnt_best_easy', 'ccnt_best_normal', 'ccnt_best_hard'], ranksVar: 'CCNT_RANKS' },
  { target: 'make-ten', key: 'mten_best', ranksVar: 'MTEN_RANKS' },
  { target: 'flash-sudoku', key: ['fsd_best_easy', 'fsd_best_normal', 'fsd_best_hard'], ranksVar: 'FSD_RANKS' },
  { target: 'race-pos', key: ['rp_best_easy', 'rp_best_normal', 'rp_best_hard'], ranksVar: 'RP_RANKS' },
  { target: 'otp-memory', key: ['om_best_easy', 'om_best_normal', 'om_best_hard'], ranksVar: 'OM_RANKS' },
  { target: 'day-calc', key: ['dc_best_easy', 'dc_best_normal', 'dc_best_hard'], ranksVar: 'DC_RANKS' },
  { target: 'arrow-swipe', key: 'asBest', ranksVar: 'AS_RANKS' },
  { target: 'clock-calc', key: ['cl_best_easy', 'cl_best_normal', 'cl_best_hard'], ranksVar: 'CL_RANKS' },
  { target: 'lights-out', key: ['lo_best_easy', 'lo_best_normal', 'lo_best_hard'], reverse: true, suffix: '手', ranksVar: 'LO_RANKS' },
  { target: 'dollar-calc', key: ['dca_best_easy', 'dca_best_normal', 'dca_best_hard'], ranksVar: 'DCA_RANKS' },
  { target: 'double-detect', key: ['dd_best_easy', 'dd_best_normal', 'dd_best_hard'], ranksVar: 'DD_RANKS' },
  { target: 'tax-calc', key: ['tc_best_easy', 'tc_best_normal', 'tc_best_hard'], ranksVar: 'TC_RANKS' },
  { target: 'emoji-finder', key: ['ef_best_normal', 'ef_best_hard', 'ef_best_easy'], ranksVar: 'EF_RANKS' },
  { target: 'mental-mult', key: ['mmut_best_easy', 'mmut_best_normal', 'mmut_best_hard'], ranksVar: 'MMUT_RANKS' },
  { target: 'kanji-quiz', key: 'kq_best', ranksVar: 'KQ_RANKS' },
  { target: 'absolute-pitch', key: ['ap_best_easy', 'ap_best_normal', 'ap_best_hard'], ranksVar: 'AP_RANKS' },
  { target: 'emoji-cipher', key: 'ec_best', ranksVar: 'EC_RANKS' }];

// Register all score keys for history tracking
BS_MAPPING.forEach(g => {
  const keys = Array.isArray(g.key) ? g.key : [g.key];
  keys.forEach(k => window._scoreHistoryKeys && window._scoreHistoryKeys.add(k));
});

// Seed history from existing scores (one-time migration for pre-history data)
(function seedScoreHistory() {
  const FLAG = '_hist_seeded_v1';
  if (localStorage.getItem(FLAG)) return;
  const now = Date.now();
  BS_MAPPING.forEach(g => {
    const keys = Array.isArray(g.key) ? g.key : [g.key];
    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val === null) return;
      const histKey = k + '__hist';
      const existing = localStorage.getItem(histKey);
      if (!existing || existing === '[]') {
        const v = parseFloat(val);
        if (!isNaN(v)) {
          // Use _rawStorageSet to bypass scoping so it lands in the right namespace
          const pfx = window._rawStoragePrefix ? window._rawStoragePrefix() : '';
          const rawHistKey = pfx + histKey;
          const rawExisting = window._rawStorageGet ? window._rawStorageGet(rawHistKey) : null;
          if (!rawExisting || rawExisting === '[]') {
            const entry = JSON.stringify([[now, v]]);
            if (window._rawStorageSet) window._rawStorageSet(rawHistKey, entry);
          }
        }
      }
    });
  });
  localStorage.setItem(FLAG, '1');
})();

function refreshBestScores() {
  BS_MAPPING.forEach(g => {
    if (!g.key) return;
    const cards = document.querySelectorAll(`[onclick="showScreen('${g.target}')"]`);
    if (cards.length === 0) return;

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

    cards.forEach(card => {
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
  },
  {
    id: 'ann_20260331',
    icon: '✨',
    title: '新しいゲーム3種が追加されました！',
    items: [
      '↗️ <strong>アローマスター</strong> — 色に従って正しい方向へスワイプしよう！',
      '⏳ <strong>クロックマスター</strong> — 指定された時間を素早く計算しよう！',
      '🧩 <strong>ライトアウト</strong> — すべての明かりを消灯させよう！',
    ]
  },
  {
    id: 'ann_20260331b',
    icon: '💱',
    title: '新しいゲームを追加しました！',
    items: [
      '💱 <strong>ドル換算</strong> — $1=¥150で円↔ドルを瞬時に換算しよう！',
    ]
  },
  {
    id: 'ann_20260401',
    icon: '🃏',
    title: '新しいゲームを追加しました！',
    items: [
      '🃏 <strong>ダブル検知</strong> — 同じ数字が出たら即ボタン！最初の枚数も答えよう！',
    ]
  },
  {
    id: 'ann_20260402',
    icon: '🧾',
    title: '新しいゲームを追加しました！',
    items: [
      '🧾 <strong>消費税計算</strong> — 税抜き価格から税込み価格を素早く答えよう！',
    ]
  },
  {
    id: 'ann_20260404',
    icon: '🔍',
    title: '新しいゲームを追加しました！',
    items: [
      '🔍 <strong>絵文字さがし</strong> — フラッシュされた絵文字の中で増えた1個を探し当てよう！',
    ]
  },
  {
    id: 'ann_20260413',
    icon: '❌',
    title: '新しいゲームを追加しました！',
    items: [
      '❌ <strong>掛け算暗算</strong> — 2桁・3桁の掛け算を素早く解こう',
    ]
  },
  {
    id: 'ann_20260413b',
    icon: '📚',
    title: '新しいゲームを追加しました！',
    items: [
      '📚 <strong>難読漢字</strong> — 魚・植物・動物など、手強い漢字に挑もう！',
    ]
  },
  {
    id: 'ann_20260413c',
    icon: '🎵',
    title: '新しいゲームを追加しました！',
    items: [
      '🎵 <strong>絶対音感</strong> — 再生される音を聴いて、ドレミを当てよう！',
    ]
  }
  ,{
    id: 'ann_20260419',
    icon: '🔐',
    title: '新しいゲームを追加しました！',
    items: [
      '🔐 <strong>絵文字暗号</strong> — 絵文字で暗号化された文章を解読しよう！',
    ]
  },
  {
    id: 'ann_20260419_update',
    icon: '✨',
    title: 'ゲームのアップデート！',
    items: [
      '🔢 <strong>ナンバータッチ</strong> — 難易度選択（10〜25）と見やすいマス表示に対応しました！',
      '🔐 <strong>絵文字暗号</strong> — あいうえお表を常時表示し、時間制限を無くして遊びやすくなりました！'
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
    const allIds = ANNOUNCEMENTS.map(a => a.id);
    localStorage.setItem('seenAnnouncements', JSON.stringify(allIds));
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


  // Dynamic Rule Button Injection

  document.querySelectorAll('.screen').forEach(screen => {
    if (screen.id === 'home') return;
    const nav = screen.querySelector('.nav');
    if (!nav) return;
    const btn = document.createElement('button');
    btn.className = 'btn-rule';
    btn.innerHTML = 'ℹ️';
    btn.onclick = () => showRuleModal(screen.id);
    nav.appendChild(btn);

    const mapping = BS_MAPPING.find(m => m.target === screen.id);
    if (mapping && mapping.ranksVar && window[mapping.ranksVar]) {
      const gbtn = document.createElement('button');
      gbtn.className = 'btn-rule';
      gbtn.innerHTML = '🏆';
      gbtn.onclick = () => showRankGuide(mapping.ranksVar);
      nav.appendChild(gbtn);
    }
  });
});

/* ===== RULE OVERLAY ===== */
function showRuleModal(gameId) {
  sfx.nav();
  // Always prefer extracting from .game-card as it has the full description <p>
  let card = document.querySelector(`.game-card[data-game="${gameId}"]`);
  if (!card) {
    // Fallback if not in category list (unlikely but safe)
    card = document.querySelector(`.pick-card[data-game="${gameId}"]`);
  }
  if (!card) return;

  const icon = (card.querySelector('.game-icon') || card.querySelector('.pick-icon-wrap')).innerHTML;
  const title = (card.querySelector('h2') || card.querySelector('.pick-name')).textContent;
  const desc = card.querySelector('p') ? card.querySelector('p').textContent : "ルールを読み込み中...";
  const badge = (card.querySelector('.badge') || card.querySelector('.pick-cat-badge')).textContent;

  document.getElementById('rule-icon').innerHTML = icon;
  document.getElementById('rule-title').textContent = title;
  document.getElementById('rule-badge').textContent = badge;
  document.getElementById('rule-desc').textContent = desc;

  document.getElementById('rule-overlay').classList.add('show');
}

function closeRuleModal() {
  sfx.nav();
  document.getElementById('rule-overlay').classList.remove('show');
}

/* ===== RESULT OVERLAY ===== */
let _retryFn = null;

function showResult(icon, title, detail, onRetry, rank = null) {
  sfx.result();
  document.getElementById('res-icon').innerHTML = renderIcon(icon);
  document.getElementById('res-title').textContent = title;
  const detailEl = document.getElementById('res-detail');
  detailEl.innerHTML = detail.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  const rankEl = document.getElementById('res-rank');
  if (rank) {
    rankEl.style.display = '';
    rankEl.innerHTML = `<span class="rank-badge" style="--rank-color:${rank.color}">${rank.emoji} ${rank.label}</span>`;
  } else {
    rankEl.style.display = 'none';
  }
  _retryFn = onRetry;

  // Add leaderboard button if logged in
  const btnRow = document.querySelector('#result-overlay .btn-row');
  const oldLb = btnRow.querySelector('.btn-leaderboard');
  if (oldLb) oldLb.remove();
  if (typeof isLoggedIn === 'function' && isLoggedIn() && typeof _lastSaveInfo !== 'undefined' && _lastSaveInfo) {
    const lb = document.createElement('button');
    lb.className = 'btn-outline btn-leaderboard';
    lb.innerHTML = '🏆 ランキング';
    lb.onclick = () => showLeaderboard(_lastSaveInfo.gameId, _lastSaveInfo.difficulty, _lastSaveInfo.score);
    btnRow.appendChild(lb);
  }

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

let _rgCurrentMapping = null;
let _rgCurrentUnit = '点';
let _rgLbLoaded = false;

function showRankGuide(ranksVar) {
  const ranks = window[ranksVar];
  if (!ranks) return;

  _rgCurrentMapping = typeof BS_MAPPING !== 'undefined' ? BS_MAPPING.find(m => m.ranksVar === ranksVar) : null;
  _rgCurrentUnit = ranks.unit || '点';
  _rgLbLoaded = false;

  // Title
  const titleEl = document.getElementById('rank-guide-title');
  if (titleEl) {
    if (_rgCurrentMapping) {
      const card = document.querySelector(`.game-card[data-game="${_rgCurrentMapping.target}"]`);
      titleEl.textContent = card ? card.querySelector('h2').textContent : 'ランク基準';
    } else {
      titleEl.textContent = 'ランク基準';
    }
  }

  // Rank content
  const isReverse = 'max' in ranks[0];
  document.getElementById('rank-guide-content').innerHTML = ranks.map((r, i) => {
    let range;
    if (isReverse) {
      const prev = ranks[i - 1];
      const from = prev ? prev.max + 1 : null;
      const to = r.max === Infinity ? null : r.max;
      range = from === null ? `〜${to}${_rgCurrentUnit}` : to === null ? `${from}${_rgCurrentUnit}〜` : `${from}〜${to}${_rgCurrentUnit}`;
    } else {
      const next = ranks[i - 1];
      range = next ? `${r.min}〜${next.min - 1}${_rgCurrentUnit}` : `${r.min}${_rgCurrentUnit}〜`;
    }
    return `<div class="rank-guide-row">
      <span class="rank-guide-badge" style="--rank-color:${r.color}">${r.emoji} ${r.label}</span>
      <span class="rank-guide-score">${range}</span>
    </div>`;
  }).join('');

  document.getElementById('rank-guide-leaderboard-wrap').innerHTML = '';

  document.getElementById('rank-guide-overlay').classList.add('show');
  rgSelectTab('rank');
}

function rgSelectTab(tab) {
  const rankPanel = document.getElementById('rank-guide-content');
  const lbPanel = document.getElementById('rank-guide-leaderboard-wrap');
  const rankTab = document.getElementById('rgtab-rank');
  const lbTab = document.getElementById('rgtab-lb');

  const isRank = tab === 'rank';
  rankPanel.style.display = isRank ? '' : 'none';
  lbPanel.style.display = isRank ? 'none' : '';
  rankTab.classList.toggle('active', isRank);
  lbTab.classList.toggle('active', !isRank);

  if (!isRank && !_rgLbLoaded) {
    _rgLbLoaded = true;
    rgLoadLeaderboard();
  }
}

function rgLoadLeaderboard() {
  const lbWrap = document.getElementById('rank-guide-leaderboard-wrap');
  if (!lbWrap) return;

  if (!_rgCurrentMapping || typeof getLeaderboard !== 'function') {
    lbWrap.innerHTML = '<p class="rg-lb-empty">ランキングデータがありません</p>';
    return;
  }

  lbWrap.innerHTML = '<div class="lb-loading"><div class="lb-spinner"></div></div>';

  getLeaderboard(_rgCurrentMapping.target, 'all', 10).then(entries => {
    if (!entries || entries.length === 0) {
      lbWrap.innerHTML = '<p class="rg-lb-empty">まだランキングデータがありません</p>';
      return;
    }
    const user = typeof getAuthUser === 'function' ? getAuthUser() : null;
    lbWrap.innerHTML = '<div class="lb-list">' + entries.map(e => {
      const isMe = user && user.id === e.user_id;
      const rClass = e.rank <= 3 ? `lb-rank-${e.rank}` : '';
      const seed = encodeURIComponent(e.user_id || e.user_name || 'player');
      const av = `<img src="https://api.dicebear.com/9.x/bottts/svg?seed=${seed}" class="lb-avatar">`;
      const name = e.user_name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<div class="lb-row ${isMe ? 'lb-me' : ''} ${rClass}">
        <div class="lb-rank">${e.rank}</div>
        ${av}
        <div class="lb-name">${name}</div>
        <div class="lb-score">${e.score}${_rgCurrentUnit}</div>
      </div>`;
    }).join('') + '</div>';
  }).catch(() => {
    lbWrap.innerHTML = '<p class="rg-lb-empty" style="color:#f87171">取得エラー</p>';
  });
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

/* ===== RECORDS PAGE ===== */
const RANK_TIERS = [
  { emoji: '👑', label: '伝説', color: '#f59e0b' },
  { emoji: '🏆', label: '達人', color: '#8b5cf6' },
  { emoji: '💫', label: 'エキスパート', color: '#3b82f6' },
  { emoji: '⭐', label: '上級者', color: '#10b981' },
  { emoji: '🌟', label: '中級者', color: '#6ee7b7' },
  { emoji: '🔰', label: '見習い', color: '#94a3b8' },
  { emoji: '🌱', label: 'まだまだ', color: '#64748b' },
];

let _dbRecordsCache = null;
let _dbHistoryCache = null;

// Call this when user logs in/out or saves a score to invalidate
function invalidateDbCache() {
  _dbRecordsCache = null;
  _dbHistoryCache = null;
}

async function refreshRecords() {
  const list = document.getElementById('records-list');
  const statsEl = document.getElementById('records-stats');
  const chartEl = document.getElementById('records-chart');
  if (!list || !statsEl || !chartEl) return;

  let crownCount = 0;
  let playedCount = 0;
  const totalCount = BS_MAPPING.length;

  // Count per rank tier (by label)
  const tierCounts = {};
  RANK_TIERS.forEach(t => { tierCounts[t.label] = 0; });

  const isLogged = typeof isLoggedIn === 'function' && isLoggedIn();
  if (isLogged && !_dbRecordsCache) {
    list.innerHTML = '<div style="padding:40px;text-align:center"><div class="lb-spinner"></div><div style="margin-top:16px;color:var(--text-3)">同期中...</div></div>';
    _dbRecordsCache = await getMyRecords();
  }

  const rows = BS_MAPPING.map(g => {
    const card = document.querySelector(`.game-card[data-game="${g.target}"]`);
    if (!card) return null;

    const icon = card.querySelector('.game-icon').innerHTML;
    const name = card.querySelector('h2').textContent;
    const cat = card.querySelector('.badge').textContent;

    let best = g.reverse ? Infinity : -Infinity;
    let hasScore = false;
    let isCrown = false;

    if (isLogged && _dbRecordsCache) {
      const gRecs = _dbRecordsCache.filter(r => r.game_id === g.target);
      if (gRecs.length > 0) {
        hasScore = true;
        if (g.reverse) best = Math.min(...gRecs.map(r => r.min_score));
        else best = Math.max(...gRecs.map(r => r.max_score));
        isCrown = gRecs.some(r => r.has_crown === 1 || r.has_crown === true);
      }
    } else {
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
        if (raw !== null) { hasScore = true; const v = parseFloat(raw); if (!isNaN(v)) best = v; }
      }
    }

    let rank = null;
    if (hasScore && g.ranksVar && window[g.ranksVar]) {
      rank = getScoreRank(best, window[g.ranksVar]);
      if (isLogged && _dbRecordsCache) {
        if (isCrown) crownCount++;
      } else {
        if (rank === window[g.ranksVar][0]) { isCrown = true; crownCount++; }
      }
      if (tierCounts[rank.label] !== undefined) tierCounts[rank.label]++;
    }

    if (hasScore) playedCount++;
    const display = hasScore ? (g.suffix ? best + g.suffix : best) : null;

    return { icon, name, cat, display, rank, isCrown, hasScore, target: g.target };
  }).filter(Boolean);

  // Stats
  statsEl.innerHTML = `
    <div class="records-stat">
      <div class="records-stat-value">${crownCount}</div>
      <div class="records-stat-label">👑 王冠</div>
    </div>
    <div class="records-stat">
      <div class="records-stat-value">${playedCount}</div>
      <div class="records-stat-label">🎮 プレイ済み</div>
    </div>
    <div class="records-stat">
      <div class="records-stat-value">${totalCount}</div>
      <div class="records-stat-label">🏆 全ゲーム</div>
    </div>`;

  // Chart
  chartEl.innerHTML = RANK_TIERS.map(t => {
    const count = tierCounts[t.label] || 0;
    const pct = Math.round((count / totalCount) * 100);
    return `
      <div class="chart-row">
        <div class="chart-label">
          <span class="chart-emoji">${t.emoji}</span>
          <span>${t.label}</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="--bar-color:${t.color}; width:${pct}%"></div>
        </div>
        <div class="chart-count" style="color:${count > 0 ? t.color : 'var(--text-3)'}">${count}</div>
      </div>`;
  }).join('');

  // Animate bars (requestAnimationFrame to allow CSS transition)
  requestAnimationFrame(() => {
    chartEl.querySelectorAll('.chart-bar-fill').forEach(bar => {
      bar.style.width = bar.style.width; // trigger reflow
    });
  });

  // Game list
  list.innerHTML = rows.map(r => `
    <div class="record-row${r.isCrown ? ' record-crown' : ''}${!r.hasScore ? ' record-unplayed' : ''}"
         ${r.hasScore ? `onclick="showGameStats('${r.target}',false,'records')"` : ''}>
      <div class="record-icon">${r.icon}</div>
      <div class="record-info">
        <div class="record-name">${r.name}</div>
        <div class="record-cat">${r.cat}</div>
      </div>
      <div class="record-score">
        ${r.hasScore && r.rank
      ? `<span class="record-rank-badge" style="--rank-color:${r.rank.color}">${r.rank.emoji} ${r.rank.label}</span><span class="record-value">${r.display}</span>`
      : '<span class="record-no-score">未プレイ</span>'}
      </div>
    </div>`).join('');
}

/* ===== STATS PAGE ===== */
async function refreshStats() {
  const el = document.getElementById('stats-content');
  if (!el) return;

  // Gather all history entries from all score keys
  const allEntries = []; // { ts, val, gameId, gameName, cat }
  const gameInfoMap = {}; // gameId -> { name, cat, icon }

  // Build game info from DOM
  BS_MAPPING.forEach(g => {
    const card = document.querySelector(`.game-card[data-game="${g.target}"]`);
    if (!card) return;
    gameInfoMap[g.target] = {
      name: card.querySelector('h2').textContent,
      cat: card.querySelector('.badge').textContent,
      icon: card.querySelector('.game-icon').innerHTML,
    };
  });

  const isLogged = typeof isLoggedIn === 'function' && isLoggedIn();
  if (isLogged && !_dbHistoryCache) {
    el.innerHTML = '<div style="padding:40px;text-align:center"><div class="lb-spinner"></div><div style="margin-top:16px;color:var(--text-3)">同期中...</div></div>';
    _dbHistoryCache = await getMyHistory();
  }

  if (isLogged && _dbHistoryCache) {
    _dbHistoryCache.forEach(r => {
      const info = gameInfoMap[r.game_id] || { name: r.game_id, cat: '?', icon: '🎮' };
      allEntries.push({ ts: new Date(r.played_at).getTime(), val: r.score, gameId: r.game_id, name: info.name, cat: info.cat });
    });
  } else {
    BS_MAPPING.forEach(g => {
      const keys = Array.isArray(g.key) ? g.key : [g.key];
      const info = gameInfoMap[g.target] || { name: g.target, cat: '?', icon: '🎮' };
      keys.forEach(k => {
        try {
          const raw = localStorage.getItem(k + '__hist');
          if (!raw) return;
          JSON.parse(raw).forEach(([ts, val]) => {
            allEntries.push({ ts, val, gameId: g.target, name: info.name, cat: info.cat });
          });
        } catch (e) { }
      });
    });
  }

  allEntries.sort((a, b) => a.ts - b.ts);

  const totalPlays = allEntries.length;
  const playedGames = new Set(allEntries.map(e => e.gameId)).size;

  // Activity by date (last 90 days)
  const now = Date.now();
  const DAY = 86400000;
  const dayCounts = {};
  allEntries.forEach(e => {
    const d = new Date(e.ts);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    dayCounts[key] = (dayCounts[key] || 0) + 1;
  });

  // Category breakdown
  const catCounts = {};
  allEntries.forEach(e => {
    catCounts[e.cat] = (catCounts[e.cat] || 0) + 1;
  });
  const catEntries = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  const maxCat = catEntries[0]?.[1] || 1;

  // Most played games (top 5)
  const gameCounts = {};
  allEntries.forEach(e => { gameCounts[e.gameId] = (gameCounts[e.gameId] || 0) + 1; });
  const topGames = Object.entries(gameCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, cnt]) => ({ ...gameInfoMap[id], id, cnt }));

  // Recent activity (last 7 days)
  const week = now - 7 * DAY;
  const recentPlays = allEntries.filter(e => e.ts >= week).length;
  const activeDays = new Set(
    allEntries.filter(e => e.ts >= week).map(e => {
      const d = new Date(e.ts); return `${d.getMonth()}-${d.getDate()}`;
    })
  ).size;

  el.innerHTML = `
    <div class="stats-section">
      <div class="stats-kpi-row">
        <div class="stats-kpi">
          <div class="stats-kpi-val">${totalPlays}</div>
          <div class="stats-kpi-label">総プレイ回数</div>
        </div>
        <div class="stats-kpi">
          <div class="stats-kpi-val">${playedGames}</div>
          <div class="stats-kpi-label">プレイ済みゲーム</div>
        </div>
        <div class="stats-kpi">
          <div class="stats-kpi-val">${recentPlays}</div>
          <div class="stats-kpi-label">直近7日</div>
        </div>
        <div class="stats-kpi">
          <div class="stats-kpi-val">${activeDays}</div>
          <div class="stats-kpi-label">アクティブ日数</div>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <div class="stats-section-title">プレイ履歴（90日）</div>
      <div class="stats-heatmap" id="stats-heatmap"></div>
    </div>

    ${catEntries.length ? `
    <div class="stats-section">
      <div class="stats-section-title">カテゴリ別プレイ回数</div>
      <div class="stats-catbar">
        ${catEntries.map(([cat, cnt]) => `
          <div class="stats-catbar-row">
            <div class="stats-catbar-label">${cat}</div>
            <div class="stats-catbar-track">
              <div class="stats-catbar-fill" style="width:${Math.round(cnt / maxCat * 100)}%"></div>
            </div>
            <div class="stats-catbar-count">${cnt}</div>
          </div>`).join('')}
      </div>
    </div>` : ''}

    ${topGames.length ? `
    <div class="stats-section">
      <div class="stats-section-title">よく遊んだゲーム</div>
      <div class="stats-topgames">
        ${topGames.map((g, i) => `
          <div class="stats-topgame-row" onclick="showGameStats('${g.id}',false,'stats')">
            <div class="stats-topgame-rank">${i + 1}</div>
            <div class="stats-topgame-icon">${g.icon || '🎮'}</div>
            <div class="stats-topgame-name">${g.name || g.id}</div>
            <div class="stats-topgame-cnt">${g.cnt}回</div>
          </div>`).join('')}
      </div>
    </div>` : ''}

    ${totalPlays === 0 ? `<div class="stats-empty">まだ記録がありません。<br>ゲームをプレイすると統計が表示されます。</div>` : ''}
  `;

  // Render heatmap
  renderActivityHeatmap(document.getElementById('stats-heatmap'), dayCounts, 90);
}

function renderActivityHeatmap(el, dayCounts, days) {
  if (!el) return;
  const now = new Date();
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const cnt = dayCounts[key] || 0;
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
    let level = 0;
    if (cnt >= 1) level = 1;
    if (cnt >= 5) level = 2;
    if (cnt >= 10) level = 3;
    if (cnt >= 20) level = 4;
    cells.push(`<div class="heatmap-cell lv${level}" title="${dateStr}: ${cnt}回"></div>`);
  }
  el.innerHTML = cells.join('');
}

/* ===== GAME STATS SCREEN ===== */
let _gameStatsId = null;
let _gameStatsFrom = 'records'; // which screen to go back to

function showGameStats(gameId, skipHistory = false, from = null) {
  _gameStatsId = gameId;
  if (from) _gameStatsFrom = from;
  if (!skipHistory) location.hash = 'game-stats/' + gameId;

  // Transition to game-stats screen without updating hash again
  const overlay = document.getElementById('scene-transition');
  if (isTransitioning) return;
  isTransitioning = true;
  sfx.nav();
  if (overlay) overlay.classList.add('active');
  setTimeout(() => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('game-stats');
    if (el) el.classList.add('active');
    currentScreen = 'game-stats';
    refreshGameStatsScreen();
    window.scrollTo(0, 0);
    if (overlay) overlay.classList.remove('active');
    setTimeout(() => { isTransitioning = false; }, 150);
  }, 150);
}

async function refreshGameStatsScreen() {
  const gameId = _gameStatsId;
  const mapping = BS_MAPPING.find(g => g.target === gameId);
  const el = document.getElementById('game-stats-content');
  const titleEl = document.getElementById('game-stats-title');
  if (!el || !mapping) return;

  const card = document.querySelector(`.game-card[data-game="${gameId}"]`);
  const gameName = card ? card.querySelector('h2').textContent : gameId;
  const gameIcon = card ? card.querySelector('.game-icon').innerHTML : '🎮';
  if (titleEl) titleEl.innerHTML = `${gameIcon} <span>${gameName}</span>`;

  // Update back button to return to the correct origin screen
  const backBtn = document.querySelector('#game-stats .btn-back');
  if (backBtn) {
    const backLabel = _gameStatsFrom === 'stats' ? '← 統計' : '← 記録一覧';
    backBtn.textContent = backLabel;
    backBtn.onclick = () => showScreen(_gameStatsFrom);
  }

  const isLogged = typeof isLoggedIn === 'function' && isLoggedIn();
  if (isLogged && (!_dbHistoryCache || !_dbRecordsCache)) {
    el.innerHTML = '<div style="padding:40px;text-align:center"><div class="lb-spinner"></div><div style="margin-top:16px;color:var(--text-3)">データ読み込み中...</div></div>';
    if (!_dbHistoryCache) _dbHistoryCache = await getMyHistory();
    if (!_dbRecordsCache) _dbRecordsCache = await getMyRecords();
  }

  const keys = Array.isArray(mapping.key) ? mapping.key : [mapping.key];
  const gRecs = (isLogged && _dbRecordsCache) ? _dbRecordsCache.filter(r => r.game_id === gameId) : [];
  const gHist = (isLogged && _dbHistoryCache) ? _dbHistoryCache.filter(r => r.game_id === gameId) : [];

  // Build per-key/difficulty label and history
  const difficulties = keys.map(k => {
    const m = k.match(/_(easy|normal|hard|[123])$/);
    let label = m ? m[1] : 'default';
    if (label === 'default' && k.includes('vcBest')) label = 'default'; // special casing if needed
    // Map existing key suffixes back to DB difficulty strings if needed, though they usually match
    if (k.includes('lo_best')) label = m ? m[1] : 'normal';

    const entries = [];
    let best = null;

    if (isLogged && gHist.length >= 0) {
      gHist.filter(r => r.difficulty === label).forEach(r => entries.push({ ts: new Date(r.played_at).getTime(), val: r.score }));
      const rec = gRecs.find(r => r.difficulty === label);
      if (rec) best = mapping.reverse ? rec.min_score : rec.max_score;
    } else {
      try {
        const raw = localStorage.getItem(k + '__hist');
        if (raw) JSON.parse(raw).forEach(([ts, val]) => entries.push({ ts, val }));
      } catch (e) { }
      const bestRaw = localStorage.getItem(k);
      best = bestRaw !== null ? parseFloat(bestRaw) : null;
    }

    entries.sort((a, b) => a.ts - b.ts);
    return { key: k, label, entries, best };
  });

  // Overall best across all difficulties
  let overallBest = mapping.reverse ? Infinity : -Infinity;
  let hasScore = false;
  difficulties.forEach(d => {
    if (d.best !== null && isFinite(d.best)) {
      hasScore = true;
      if (mapping.reverse ? d.best < overallBest : d.best > overallBest) overallBest = d.best;
    }
  });
  const bestDisplay = hasScore ? (mapping.suffix ? overallBest + mapping.suffix : overallBest) : '—';
  const rank = hasScore && mapping.ranksVar && window[mapping.ranksVar]
    ? getScoreRank(overallBest, window[mapping.ranksVar]) : null;

  const totalPlays = difficulties.reduce((s, d) => s + d.entries.length, 0);
  const allTs = difficulties.flatMap(d => d.entries.map(e => e.ts));
  const firstPlay = allTs.length ? new Date(Math.min(...allTs)) : null;
  const lastPlay = allTs.length ? new Date(Math.max(...allTs)) : null;
  const fmt = d => d ? `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}` : '—';

  const DIFF_LABELS = { easy: 'かんたん', normal: 'ふつう', hard: 'むずかしい', default: '—', '1': 'N=1', '2': 'N=2', '3': 'N=3' };
  const hasTabs = difficulties.length > 1;
  const tabsHtml = hasTabs ? `
    <div class="gs-tabs" id="gs-tabs">
      ${difficulties.map((d, i) => `
        <button class="gs-tab${i === 0 ? ' active' : ''}" onclick="gsSelectTab(${i})">${DIFF_LABELS[d.label] || d.label}</button>
      `).join('')}
    </div>` : '';

  el.innerHTML = `
    <div class="gs-best-card">
      <div class="gs-best-label">ベストスコア</div>
      <div class="gs-best-val">${bestDisplay}</div>
      ${rank ? `<div class="gs-best-rank" style="color:${rank.color}">${rank.emoji} ${rank.label}</div>` : ''}
    </div>
    <div class="gs-kpi-row">
      <div class="gs-kpi"><div class="gs-kpi-val">${totalPlays}</div><div class="gs-kpi-label">プレイ回数</div></div>
      <div class="gs-kpi"><div class="gs-kpi-val">${fmt(firstPlay)}</div><div class="gs-kpi-label">初プレイ</div></div>
      <div class="gs-kpi"><div class="gs-kpi-val">${fmt(lastPlay)}</div><div class="gs-kpi-label">最終プレイ</div></div>
    </div>
    <div class="gs-chart-section">
      ${tabsHtml}
      <div class="gs-chart-wrap">
        <canvas id="gs-canvas" class="gs-canvas"></canvas>
        <div id="gs-empty" class="gs-empty" style="display:none">まだ記録がありません</div>
      </div>
    </div>
    <button class="gs-play-btn" onclick="showScreen('${gameId}')">▶ このゲームをプレイ</button>
  `;

  // Store difficulties on element for tab switching
  el._gsDifficulties = difficulties;
  el._gsMapping = mapping;
  gsSelectTab(0);
}

function gsSelectTab(idx) {
  const el = document.getElementById('game-stats-content');
  if (!el || !el._gsDifficulties) return;
  const difficulties = el._gsDifficulties;
  const mapping = el._gsMapping;

  // Update tab active state
  document.querySelectorAll('.gs-tab').forEach((t, i) => t.classList.toggle('active', i === idx));

  const { entries } = difficulties[idx];
  const canvas = document.getElementById('gs-canvas');
  const emptyEl = document.getElementById('gs-empty');
  if (!canvas) return;

  if (entries.length === 0) {
    canvas.style.display = 'none';
    emptyEl.style.display = 'flex';
  } else {
    canvas.style.display = '';
    emptyEl.style.display = 'none';
    requestAnimationFrame(() => drawScoreChart(canvas, entries, mapping));
  }
}

function drawScoreChart(canvas, entries, mapping) {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const PAD = { top: 20, right: 16, bottom: 48, left: 44 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;

  const vals = entries.map(e => e.val).filter(v => isFinite(v));
  if (vals.length === 0) return;

  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#10b981';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-2').trim() || '#94a3b8';
  const gridColor = 'rgba(148,163,184,0.12)';

  ctx.clearRect(0, 0, W, H);

  // Grid lines (5 horizontal)
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = PAD.top + ch * (i / 4);
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + cw, y); ctx.stroke();
    // Y label
    const labelVal = maxV - (range * i / 4);
    ctx.fillStyle = textColor;
    ctx.font = `${10 * dpr / dpr}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(
      mapping.suffix ? Math.round(labelVal) + mapping.suffix : Math.round(labelVal * 10) / 10,
      PAD.left - 6, y + 4
    );
  }

  // X axis: play number labels (up to 6 evenly spaced)
  const n = entries.length;
  const labelCount = Math.min(6, n);
  const step = Math.max(1, Math.floor((n - 1) / (labelCount - 1 || 1)));
  ctx.fillStyle = textColor;
  ctx.font = `10px sans-serif`;
  ctx.textAlign = 'center';
  const indices = new Set([0]);
  for (let i = step; i < n - 1; i += step) indices.add(i);
  indices.add(n - 1);
  indices.forEach(i => {
    const x = PAD.left + (i / (n - 1 || 1)) * cw;
    ctx.fillText(`${i + 1}回`, x, H - PAD.bottom + 16);
  });

  // Area fill — parse accent hex to rgba
  function hexToRgba(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  const accentFill = accent.startsWith('#') ? hexToRgba(accent, 0.3) : 'rgba(16,185,129,0.3)';
  const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + ch);
  grad.addColorStop(0, accentFill);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  entries.forEach((e, i) => {
    if (!isFinite(e.val)) return;
    const x = PAD.left + (i / (entries.length - 1 || 1)) * cw;
    const y = PAD.top + (1 - (e.val - minV) / range) * ch;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  const lastX = PAD.left + cw;
  const lastY = PAD.top + ch;
  ctx.lineTo(lastX, lastY);
  ctx.lineTo(PAD.left, lastY);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  entries.forEach((e, i) => {
    if (!isFinite(e.val)) return;
    const x = PAD.left + (i / (entries.length - 1 || 1)) * cw;
    const y = PAD.top + (1 - (e.val - minV) / range) * ch;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dots
  entries.forEach((e, i) => {
    if (!isFinite(e.val)) return;
    const x = PAD.left + (i / (entries.length - 1 || 1)) * cw;
    const y = PAD.top + (1 - (e.val - minV) / range) * ch;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
  });
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
