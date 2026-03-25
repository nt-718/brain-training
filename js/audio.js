/* ===== SOUND ENGINE (Web Audio API) ===== */
const sfx = (() => {
  let ctx = null;
  let muted = localStorage.getItem('sfx_muted') === '1';

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, type, gainVal, duration, startOffset = 0) {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = type;
    o.frequency.value = freq;
    const t = c.currentTime + startOffset;
    g.gain.setValueAtTime(gainVal, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    o.start(t);
    o.stop(t + duration);
  }

  function play(fn) {
    if (muted) return;
    try { fn(); } catch (e) {}
  }

  const api = {
    get muted() { return muted; },

    toggleMute() {
      muted = !muted;
      localStorage.setItem('sfx_muted', muted ? '1' : '0');
      return muted;
    },

    // 汎用タップ音（ボタン押下）
    tap() {
      play(() => tone(700, 'sine', 0.12, 0.06));
    },

    // 画面遷移
    nav() {
      play(() => {
        const c = getCtx();
        const o = c.createOscillator();
        const g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(350, c.currentTime);
        o.frequency.linearRampToValueAtTime(560, c.currentTime + 0.09);
        g.gain.setValueAtTime(0.1, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.12);
        o.start(); o.stop(c.currentTime + 0.12);
      });
    },

    // ゲームスタート
    start() {
      play(() => {
        tone(440, 'sine', 0.15, 0.12, 0.00);
        tone(550, 'sine', 0.15, 0.12, 0.13);
        tone(660, 'sine', 0.18, 0.18, 0.26);
      });
    },

    // 正解
    correct() {
      play(() => {
        tone(523, 'sine', 0.18, 0.12, 0.00);
        tone(659, 'sine', 0.18, 0.12, 0.10);
        tone(784, 'sine', 0.20, 0.18, 0.20);
      });
    },

    // 不正解
    wrong() {
      play(() => {
        const c = getCtx();
        const o = c.createOscillator();
        const g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(280, c.currentTime);
        o.frequency.linearRampToValueAtTime(180, c.currentTime + 0.2);
        g.gain.setValueAtTime(0.14, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.22);
        o.start(); o.stop(c.currentTime + 0.22);
      });
    },

    // 結果表示（ゲーム終了）
    result() {
      play(() => {
        tone(523, 'sine', 0.15, 0.15, 0.00);
        tone(440, 'sine', 0.15, 0.15, 0.15);
        tone(349, 'sine', 0.18, 0.22, 0.30);
      });
    },

    // カウントダウン tick
    tick() {
      play(() => tone(900, 'square', 0.06, 0.04));
    },

    // 最終カウント（残り1秒など）
    tickFinal() {
      play(() => tone(1200, 'square', 0.08, 0.05));
    },
  };

  return api;
})();

/* ===== GLOBAL TAP SOUND (button 要素全般) ===== */
document.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (btn) sfx.tap();
}, true);

/* ===== MUTE TOGGLE BUTTON ===== */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('sfx-toggle');
  if (!btn) return;

  function updateIcon() {
    btn.textContent = sfx.muted ? '🔇' : '🔊';
    btn.title = sfx.muted ? '音ON' : '音OFF';
  }
  updateIcon();

  btn.addEventListener('click', e => {
    e.stopPropagation();
    sfx.toggleMute();
    updateIcon();
  });
});
