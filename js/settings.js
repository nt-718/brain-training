/* ===== SETTINGS MODULE ===== */

/* --- Username --- */
function getDisplayName() {
  const user = getAuthUser ? getAuthUser() : null;
  if (user) return user.display_name || user.name || null;
  // Guest fallback
  return localStorage.getItem('user_display_name');
}

async function saveUsername() {
  const input = document.getElementById('settings-username-input');
  const val = input ? input.value.trim() : '';
  if (!val) return;

  const user = getAuthUser ? getAuthUser() : null;
  if (user && isLoggedIn()) {
    // Save to DB
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch(`${AUTH_API_BASE}/user/display_name`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ display_name: val }),
      });
      if (!res.ok) throw new Error(await res.text());
      // Update cached user object
      user.display_name = val;
      window._rawStorageSet('auth_user', JSON.stringify(user));
      updateAuthUI();
      showSettingsToast('ユーザー名を保存しました ✓');
    } catch (e) {
      showSettingsToast('保存に失敗しました');
      console.error(e);
    }
  } else {
    // Guest: localStorage only
    localStorage.setItem('user_display_name', val);
    updateAuthUI();
    showSettingsToast('ユーザー名を保存しました ✓');
  }
}

function clearUsername() {
  const user = getAuthUser ? getAuthUser() : null;
  const input = document.getElementById('settings-username-input');

  if (user && isLoggedIn()) {
    // Reset to Google name (save empty string treated as null on server → but we reset to original name visually)
    // Optimistically revert display_name in cache
    const originalName = user.name || '';
    user.display_name = null;
    window._rawStorageSet('auth_user', JSON.stringify(user));
    if (input) input.value = originalName;
    // Fire API with empty → server will treat as reset; send original google name
    fetch(`${AUTH_API_BASE}/user/display_name`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('jwt')}` },
      body: JSON.stringify({ display_name: originalName }),
    }).catch(() => {});
  } else {
    localStorage.removeItem('user_display_name');
    if (input) input.value = (user && user.name) ? user.name : '';
  }
  updateAuthUI();
  showSettingsToast('ユーザー名をリセットしました');
}

/* --- SFX toggle in settings --- */
function settingsToggleSfx() {
  const isMuted = sfx.toggleMute();
  updateSettingsSfxBtn(isMuted);
}

function updateSettingsSfxBtn(muted) {
  const btn = document.getElementById('settings-sfx-btn');
  if (!btn) return;
  if (muted) {
    btn.textContent = 'OFF';
    btn.classList.remove('toggle-on');
    btn.classList.add('toggle-off');
  } else {
    btn.textContent = 'ON';
    btn.classList.remove('toggle-off');
    btn.classList.add('toggle-on');
  }
}

/* --- Render account section --- */
function renderSettingsAccount() {
  const wrap = document.getElementById('settings-account-content');
  if (!wrap) return;
  const user = getAuthUser ? getAuthUser() : null;
  const loggedIn = typeof isLoggedIn === 'function' ? isLoggedIn() : false;

  if (loggedIn && user) {
    const seed = user.id || user.name || 'player';
    const avatarUrl = `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
    wrap.innerHTML = `
      <div class="settings-item settings-item-row">
        <div class="settings-account-info">
          <img src="${avatarUrl}" class="settings-avatar-img" alt="avatar">
          <div>
            <div class="settings-account-name">${user.name || ''}</div>
            <div class="settings-account-email">${user.email || ''}</div>
          </div>
        </div>
      </div>
      <div class="settings-item">
        <button class="settings-logout-btn" onclick="logout(); renderSettingsAccount();">ログアウト</button>
      </div>
    `;
  } else {
    const customName = localStorage.getItem('user_display_name');
    const avatarHtml = customName
      ? `<img src="https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(customName)}" class="settings-avatar-img" alt="avatar">`
      : `<div class="settings-avatar-placeholder">👤</div>`;

    wrap.innerHTML = `
      <div class="settings-item settings-item-row">
        <div class="settings-account-info">
          ${avatarHtml}
          <div>
            <div class="settings-account-name">${customName || 'ゲスト（未ログイン）'}</div>
            <div class="settings-account-email" style="font-size: 0.65rem; color: var(--text-3); margin-top: 3px;">端末へのローカル保存</div>
          </div>
        </div>
      </div>
      <div class="settings-item">
        <div class="settings-hint">Googleアカウントでログインするとランキングに参加できます</div>
        <div id="settings-google-signin-btn" style="margin-top:12px;"></div>
      </div>
    `;
    // render Google button if available
    if (typeof google !== 'undefined' && typeof renderGoogleButton === 'function') {
      const container = document.getElementById('settings-google-signin-btn');
      if (container) {
        google.accounts.id.renderButton(container, {
          theme: 'filled_black',
          size: 'medium',
          shape: 'pill',
          text: 'signin',
          locale: 'ja',
        });
      }
    }
  }
}

/* --- Toast --- */
function showSettingsToast(msg) {
  let toast = document.getElementById('settings-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'settings-toast';
    toast.className = 'settings-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2000);
}

/* --- Open settings screen --- */
function openSettings(skipHistory = false) {
  // Populate username input
  const input = document.getElementById('settings-username-input');
  if (input) {
    input.value = getDisplayName() || '';
  }
  // Sync SFX button
  if (typeof sfx !== 'undefined') {
    updateSettingsSfxBtn(sfx.muted);
  }
  // Render account
  renderSettingsAccount();
  showScreen('settings', skipHistory);
}
