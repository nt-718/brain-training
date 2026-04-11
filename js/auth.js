/* ===== USER-SCOPED STORAGE ===== */
// Patch Storage.prototype so all localStorage reads/writes are automatically
// namespaced per user. Auth/app keys bypass this and remain global.
(function() {
  const GLOBAL_KEYS = new Set([
    'jwt', 'auth_user', 'user_display_name', 'sfx_muted', 'seenAnnouncements'
  ]);

  const _get    = Storage.prototype.getItem;
  const _set    = Storage.prototype.setItem;
  const _remove = Storage.prototype.removeItem;

  function storagePrefix() {
    // getAuthUser is declared (hoisted) later in this file
    if (typeof getAuthUser === 'function') {
      const u = getAuthUser();
      if (u && u.id) return 'u_' + u.id + '__';
    }
    return '';
  }

  function scopeKey(key) {
    if (typeof key !== 'string' || GLOBAL_KEYS.has(key)) return key;
    const pfx = storagePrefix();
    if (!pfx || key.startsWith(pfx)) return key;
    return pfx + key;
  }

  // Placeholder for main.js compatibility (history now recorded in saveScore)
  window._scoreHistoryKeys = new Set();

  Storage.prototype.getItem    = function(key) { return _get.call(this, scopeKey(key)); };
  Storage.prototype.setItem    = function(key, val) { return _set.call(this, scopeKey(key), val); };
  Storage.prototype.removeItem = function(key) { return _remove.call(this, scopeKey(key)); };

  // Expose raw helpers for migration
  window._rawStorageGet    = (key) => _get.call(localStorage, key);
  window._rawStorageSet    = (key, val) => _set.call(localStorage, key, val);
  window._rawStoragePrefix = storagePrefix;
})();

/* ===== AUTH MODULE ===== */

const AUTH_API_BASE = '/api';
let _authUser = null;

/* --- State --- */
function getAuthToken() {
  return localStorage.getItem('jwt');
}

function getAuthUser() {
  if (_authUser) return _authUser;
  const raw = localStorage.getItem('auth_user');
  if (raw) {
    try { _authUser = JSON.parse(raw); } catch { _authUser = null; }
  }
  return _authUser;
}

function isLoggedIn() {
  return !!getAuthToken();
}

/* --- Google Identity Services --- */
function initGoogleAuth(clientId) {
  if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    console.warn('Google Client ID not configured. Auth disabled.');
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredentialResponse,
      auto_select: true,
    });

    // Render button if not logged in
    if (!isLoggedIn()) {
      renderGoogleButton();
    } else {
      updateAuthUI();
    }
  };
  document.head.appendChild(script);
}

async function handleGoogleCredentialResponse(response) {
  try {
    const res = await fetch(`${AUTH_API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: response.credential }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Auth failed:', errText);
      return;
    }

    const data = await res.json();
    // Set _authUser BEFORE setting storage so scopeKey uses new prefix
    _authUser = data.user;
    // These are GLOBAL_KEYS so they bypass the prefix
    window._rawStorageSet('jwt', data.token);
    window._rawStorageSet('auth_user', JSON.stringify(data.user));

    migrateGuestScoresToUser();
    updateAuthUI();
    if (typeof refreshBestScores === 'function') refreshBestScores();
    sfx.result(); // success sound
  } catch (e) {
    console.error('Auth error:', e);
  }
}

function renderGoogleButton() {
  const container = document.getElementById('google-signin-btn');
  if (!container || typeof google === 'undefined') return;
  container.style.display = '';
  google.accounts.id.renderButton(container, {
    theme: 'filled_black',
    size: 'medium',
    shape: 'pill',
    text: 'signin',
    locale: 'ja',
  });
  // Hide avatar
  const avatar = document.getElementById('user-avatar-wrap');
  if (avatar) avatar.style.display = 'none';
}

function logout() {
  _authUser = null; // clear FIRST so scopeKey uses no prefix
  // jwt / auth_user are GLOBAL_KEYS so removeItem bypasses prefix logic
  localStorage.removeItem('jwt');
  localStorage.removeItem('auth_user');

  // Revoke Google session
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.disableAutoSelect();
  }

  updateAuthUI();
  if (typeof refreshBestScores === 'function') refreshBestScores();
}

/* ===== SCORE MIGRATION ===== */
// On first login, copy any existing guest (un-prefixed) scores to user-scoped keys.
function migrateGuestScoresToUser() {
  if (!_authUser || !_authUser.id) return;
  const pfx = 'u_' + _authUser.id + '__';
  const migratedFlag = pfx + '_migrated';
  if (window._rawStorageGet(migratedFlag)) return; // already migrated

  const keysToMigrate = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    // Skip global keys and already-prefixed keys
    if (k === 'jwt' || k === 'auth_user' || k === 'user_display_name' ||
        k === 'sfx_muted' || k === 'seenAnnouncements') continue;
    if (k.startsWith('u_')) continue;
    keysToMigrate.push(k);
  }

  keysToMigrate.forEach(k => {
    const val = window._rawStorageGet(k);
    if (val !== null) {
      // Only copy if user doesn't already have a score for this key
      if (window._rawStorageGet(pfx + k) === null) {
        window._rawStorageSet(pfx + k, val);
      }
    }
  });

  window._rawStorageSet(migratedFlag, '1');
}

function updateAuthUI() {
  const loginBtn = document.getElementById('google-signin-btn');
  const avatarWrap = document.getElementById('user-avatar-wrap');
  const avatarImg = document.getElementById('user-avatar-img');
  const userName = document.getElementById('user-name');

  const user = getAuthUser();

  if (user && isLoggedIn()) {
    // Logged in
    if (loginBtn) loginBtn.style.display = 'none';
    if (avatarWrap) avatarWrap.style.display = 'flex';
    if (avatarImg && user.photo_url) avatarImg.src = user.photo_url;
    if (userName) {
      userName.textContent = user.display_name || user.name;
    }
  } else {
    // Not logged in — show custom name if set (guest)
    const customName = localStorage.getItem('user_display_name');
    if (customName) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (avatarWrap) avatarWrap.style.display = 'flex';
      if (avatarImg) avatarImg.style.display = 'none';
      if (userName) userName.textContent = customName;
    } else {
      if (avatarWrap) avatarWrap.style.display = 'none';
      if (avatarImg) avatarImg.style.display = '';
      if (loginBtn) {
        loginBtn.style.display = '';
        renderGoogleButton();
      }
    }
  }
}

/* --- Init on page load --- */
document.addEventListener('DOMContentLoaded', async () => {
  updateAuthUI();

  // Fetch Google Client ID from server and initialize auth
  try {
    const res = await fetch('/api/auth/config');
    if (res.ok) {
      const config = await res.json();
      if (config.google_client_id) {
        initGoogleAuth(config.google_client_id);
      }
    }
  } catch (e) {
    console.warn('Auth config fetch failed (offline?):', e);
  }
});
