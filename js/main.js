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
    { id:'visual-calc',    name:'ドットカウンター',     icon:'assets/icons/dot-counter.svg', cat:'計算', color:'rgba(251,191,36,0.6)' },
    { id:'flash-math',     name:'フラッシュサム',        icon:'⚡️', cat:'計算', color:'rgba(251,146,60,0.6)' },
    { id:'speed-sum',      name:'ラピッドサム',          icon:'➕', cat:'計算', color:'rgba(74,222,128,0.6)' },
    { id:'eq-judge',       name:'イコールジャッジ',      icon:'✅', cat:'計算', color:'rgba(52,211,153,0.6)' },
    { id:'balance-scale',  name:'バランスバトル',        icon:'⚖️', cat:'計算', color:'rgba(250,204,21,0.6)' },
    { id:'prime-hunt',     name:'プライムハンター',      icon:'🔬', cat:'計算', color:'rgba(45,212,191,0.6)' },
    { id:'frac-cmp',       name:'フラクションバトル',    icon:'➗', cat:'計算', color:'rgba(96,165,250,0.6)' },
    { id:'budget-plan',    name:'バジェットマスター',    icon:'🛒', cat:'計算', color:'rgba(34,197,94,0.6)' },
    { id:'make-ten',       name:'メイク10',              icon:'assets/icons/make-ten.svg', cat:'計算', color:'rgba(251,113,133,0.6)' },
    { id:'race-pos',       name:'レースビジョン',        icon:'🏃', cat:'計算', color:'rgba(249,115,22,0.6)' },
    { id:'day-calc',       name:'カレンダーマスター',    icon:'📅', cat:'計算', color:'rgba(167,139,250,0.6)' },
    { id:'clock-calc',     name:'クロックマスター',      icon:'⏳', cat:'計算', color:'rgba(96,165,250,0.6)' },
    { id:'symbol-logic',   name:'シンボルブレイカー',    icon:'🎯', cat:'論理', color:'rgba(232,121,249,0.6)' },
    { id:'pair-logic',     name:'ペアロジック',          icon:'🃏', cat:'論理', color:'rgba(129,140,248,0.6)' },
    { id:'pattern-next',   name:'パターンブレイカー',    icon:'🔮', cat:'論理', color:'rgba(192,132,252,0.6)' },
    { id:'mirror-path',    name:'リバースナビ',          icon:'🪞', cat:'論理', color:'rgba(34,211,238,0.6)' },
    { id:'mental-nav',     name:'メンタルナビ',          icon:'🗺️', cat:'論理', color:'rgba(20,184,166,0.6)' },
    { id:'word-link',      name:'ワードリンク',          icon:'🔤', cat:'論理', color:'rgba(56,189,248,0.6)' },
    { id:'chain-word',     name:'チェーンワード',        icon:'🔗', cat:'論理', color:'rgba(6,182,212,0.6)' },
    { id:'flash-sudoku',   name:'ブラインド数独',        icon:'🔦', cat:'論理', color:'rgba(99,102,241,0.6)' },
    { id:'lights-out',     name:'ライトアウト',          icon:'💡', cat:'論理', color:'rgba(250,204,21,0.6)' },
    { id:'memory-matrix',  name:'ライトマトリックス',    icon:'🔲', cat:'記憶', color:'rgba(34,197,94,0.6)' },
    { id:'n-back',         name:'Nバックチャレンジ',     icon:'🔄', cat:'記憶', color:'rgba(147,51,234,0.6)' },
    { id:'sequence-memory',name:'シーケンスマスター',    icon:'🌈', cat:'記憶', color:'rgba(244,114,182,0.6)' },
    { id:'emoji-order',    name:'エモジメモリー',        icon:'🎴', cat:'記憶', color:'rgba(245,158,11,0.6)' },
    { id:'color-seq',      name:'カラーチェーン',        icon:'🎨', cat:'記憶', color:'rgba(244,63,94,0.6)' },
    { id:'card-flip',      name:'ペアフリップ',          icon:'🀄', cat:'記憶', color:'rgba(234,88,12,0.6)' },
    { id:'otp-memory',     name:'コードメモリー',        icon:'🔐', cat:'記憶', color:'rgba(16,185,129,0.6)' },
    { id:'num-tap',        name:'ナンバータッチ',        icon:'🔢', cat:'反射', color:'rgba(59,130,246,0.6)' },
    { id:'swipe-sort',     name:'スワイプジャッジ',      icon:'↔️', cat:'反射', color:'rgba(236,72,153,0.6)' },
    { id:'color-match',    name:'カラートラップ',        icon:'🎭', cat:'反射', color:'rgba(168,85,247,0.6)' },
    { id:'big-number',     name:'ビッグナンバー',        icon:'🆚', cat:'反射', color:'rgba(239,68,68,0.6)' },
    { id:'go-nogo',        name:'ゴー！ノーゴー！',      icon:'🚦', cat:'反射', color:'rgba(22,163,74,0.6)' },
    { id:'apple-catch',    name:'アップルキャッチ',      icon:'🍎', cat:'反射', color:'rgba(220,38,38,0.6)' },
    { id:'hi-lo',          name:'ハイ＆ロー',            icon:'♠️', cat:'反射', color:'rgba(5,150,105,0.6)' },
    { id:'just-stop',      name:'パーフェクトストップ',  icon:'⏱️', cat:'反射', color:'rgba(37,99,235,0.6)' },
    { id:'arrow-swipe',    name:'アローマスター',        icon:'↗️', cat:'反射', color:'rgba(52,211,153,0.6)' },
    { id:'target-search',  name:'ターゲットサーチ',      icon:'🔍', cat:'知覚', color:'rgba(202,138,4,0.6)' },
    { id:'num-order',      name:'ナンバーオーダー',      icon:'🔀', cat:'知覚', color:'rgba(14,165,233,0.6)' },
    { id:'obj-count',      name:'フラッシュカウント',    icon:'🔵', cat:'知覚', color:'rgba(8,145,178,0.6)' },
    { id:'cube-count',     name:'キューブカウント',      icon:'🧊', cat:'知覚', color:'rgba(125,211,252,0.6)' },
    { id:'shell-game',     name:'シェルゲーム',          icon:'🎩', cat:'知覚', color:'rgba(124,58,237,0.6)' },
    { id:'color-vision',   name:'カラービジョン',        icon:'👁️', cat:'知覚', color:'rgba(219,39,119,0.6)' },
    { id:'color-code',     name:'カラーコード',          icon:'#️⃣', cat:'知覚', color:'rgba(13,148,136,0.6)' },
    { id:'comp-color',     name:'カラーオポジット',      icon:'🌗', cat:'知覚', color:'rgba(217,119,6,0.6)' },
    { id:'double-detect',  name:'ダブル検知',            icon:'🃏', cat:'判断', color:'rgba(139,92,246,0.6)' },
  ];



  function seededRand(seed) {
    let s = seed;
    return function() {
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
      const days = ['日','月','火','水','木','金','土'];
      dateEl.textContent = `${today.getMonth()+1}/${today.getDate()}（${days[today.getDay()]}）`;
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
    { id:'visual-calc',     name:'ドットカウンター',  icon:'assets/icons/dot-counter.svg', cat:'計算' },
    { id:'make-ten',        name:'メイク10',          icon:'assets/icons/make-ten.svg', cat:'計算' },
    { id:'day-calc',        name:'カレンダーマスター',icon:'📅', cat:'計算' },
    { id:'clock-calc',      name:'クロックマスター',  icon:'⏳', cat:'計算' },
    { id:'lights-out',      name:'ライトアウト',      icon:'💡', cat:'論理' },
    { id:'memory-matrix',   name:'ライトマトリックス',icon:'🔲', cat:'記憶' },
    { id:'emoji-order',     name:'絵文字メモリー',    icon:'🎴', cat:'記憶' },
    { id:'sequence-memory', name:'シーケンスマスター',icon:'🌈', cat:'記憶' },
    { id:'otp-memory',      name:'コードメモリー',    icon:'🔐', cat:'記憶' },
    { id:'num-tap',         name:'ナンバータッチ',    icon:'🔢', cat:'反射' },
    { id:'arrow-swipe',     name:'アローマスター',    icon:'↗️', cat:'反射' },
    { id:'shell-game',      name:'シェルゲーム',      icon:'🎩', cat:'知覚' },
    { id:'color-vision',    name:'カラービジョン',    icon:'👁️', cat:'知覚' },
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
  });

  window.toggleDevPick = function() {
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
  const sections = ['calc','logic','memory','reflex','perception'];
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

function showScreen(id) {
  if (isTransitioning || currentScreen === id) return;
  sfx.nav();
  
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
    if (id === 'home') refreshBestScores();
    if (id === 'records') refreshRecords();

    window.scrollTo(0, 0);



    // フェードイン（暗転を解除）
    if (overlay) overlay.classList.remove('active');
    
    setTimeout(() => {
      isTransitioning = false;
    }, 150); // アニメーション終了待ち
  }, 150); // 暗転までの待ち時間
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
  { target: 'day-calc',       key: ['dc_best_easy','dc_best_normal','dc_best_hard'],                               ranksVar: 'DC_RANKS' },
  { target: 'arrow-swipe',    key: 'asBest',                                                                      ranksVar: 'AS_RANKS' },
  { target: 'clock-calc',     key: ['cl_best_easy','cl_best_normal','cl_best_hard'],                               ranksVar: 'CL_RANKS' },
  { target: 'lights-out',     key: ['lo_best_easy','lo_best_normal','lo_best_hard'], reverse: true, suffix: '手', ranksVar: 'LO_RANKS' },
  { target: 'dollar-calc',   key: ['dca_best_easy','dca_best_normal','dca_best_hard'],                           ranksVar: 'DCA_RANKS' },
  { target: 'double-detect', key: ['dd_best_easy','dd_best_normal','dd_best_hard'],                              ranksVar: 'DD_RANKS' },
  { target: 'tax-calc',     key: ['tc_best_easy','tc_best_normal','tc_best_hard'],                              ranksVar: 'TC_RANKS' }];

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
  document.getElementById('res-icon').innerHTML   = renderIcon(icon);
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

/* ===== RECORDS PAGE ===== */
const RANK_TIERS = [
  { emoji: '👑', label: '伝説',        color: '#f59e0b' },
  { emoji: '🏆', label: '達人',        color: '#8b5cf6' },
  { emoji: '💫', label: 'エキスパート', color: '#3b82f6' },
  { emoji: '⭐', label: '上級者',      color: '#10b981' },
  { emoji: '🌟', label: '中級者',      color: '#6ee7b7' },
  { emoji: '🔰', label: '見習い',      color: '#94a3b8' },
  { emoji: '🌱', label: 'まだまだ',    color: '#64748b' },
];

function refreshRecords() {
  const list     = document.getElementById('records-list');
  const statsEl  = document.getElementById('records-stats');
  const chartEl  = document.getElementById('records-chart');
  if (!list || !statsEl || !chartEl) return;

  let crownCount = 0;
  let playedCount = 0;
  const totalCount = BS_MAPPING.length;

  // Count per rank tier (by label)
  const tierCounts = {};
  RANK_TIERS.forEach(t => { tierCounts[t.label] = 0; });

  const rows = BS_MAPPING.map(g => {
    const card = document.querySelector(`.game-card[data-game="${g.target}"]`);
    if (!card) return null;

    const icon = card.querySelector('.game-icon').innerHTML;
    const name = card.querySelector('h2').textContent;
    const cat  = card.querySelector('.badge').textContent;

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
      if (raw !== null) { hasScore = true; const v = parseFloat(raw); if (!isNaN(v)) best = v; }
    }

    let rank = null;
    let isCrown = false;
    if (hasScore && g.ranksVar && window[g.ranksVar]) {
      rank = getScoreRank(best, window[g.ranksVar]);
      if (rank === window[g.ranksVar][0]) { isCrown = true; crownCount++; }
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
    <div class="record-row${r.isCrown ? ' record-crown' : ''}${!r.hasScore ? ' record-unplayed' : ''}" onclick="showScreen('${r.target}')">
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
