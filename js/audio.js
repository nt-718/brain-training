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

    // 汎用タップ音（手触り感のあるアナログ風クリック）
    tap() {
      play(() => {
        const c = getCtx();
        const o = c.createOscillator();
        const g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(600, c.currentTime);
        o.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.05);
        g.gain.setValueAtTime(0.0, c.currentTime);
        g.gain.linearRampToValueAtTime(0.2, c.currentTime + 0.005);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);
        o.start(); o.stop(c.currentTime + 0.05);
      });
    },

    // 木の駒を置くような音
    woodClick() {
      play(() => {
        const c = getCtx();
        const o = c.createOscillator();
        const g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = 'square';
        o.frequency.setValueAtTime(300, c.currentTime);
        o.frequency.exponentialRampToValueAtTime(50, c.currentTime + 0.03);
        g.gain.setValueAtTime(0.0, c.currentTime);
        g.gain.linearRampToValueAtTime(0.3, c.currentTime + 0.003);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04);
        o.start(); o.stop(c.currentTime + 0.04);
      });
    },

    // カードをスナップするような音（ホワイトノイズ使用）
    cardSnap() {
      play(() => {
        const c = getCtx();
        const bufferSize = c.sampleRate * 0.06;
        const noiseBuffer = c.createBuffer(1, bufferSize, c.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
        const noiseSrc = c.createBufferSource();
        noiseSrc.buffer = noiseBuffer;
        const filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 3500;
        const g = c.createGain();
        noiseSrc.connect(filter); filter.connect(g); g.connect(c.destination);
        g.gain.setValueAtTime(0, c.currentTime);
        g.gain.linearRampToValueAtTime(0.5, c.currentTime + 0.005);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);
        noiseSrc.start();
      });
    },

    // 画面遷移（より柔らかくシネマティックな音に）
    nav() {
      play(() => {
        const c = getCtx();
        const o = c.createOscillator();
        const g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(450, c.currentTime);
        o.frequency.exponentialRampToValueAtTime(800, c.currentTime + 0.15);
        g.gain.setValueAtTime(0.0, c.currentTime);
        g.gain.linearRampToValueAtTime(0.15, c.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
        o.start(); o.stop(c.currentTime + 0.15);
      });
    },

    // メダルきらめき音
    medal() {
      play(() => {
        const c = getCtx();
        const now = c.currentTime;
        [1046.50, 1318.51, 1567.98, 2093.00].forEach((f, i) => {
          const o = c.createOscillator();
          const g = c.createGain();
          o.connect(g); g.connect(c.destination);
          o.type = 'sine';
          o.frequency.value = f;
          const t = now + (i * 0.05);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.1, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
          o.start(t); o.stop(t + 0.8);
        });
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
