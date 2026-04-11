/* ===== LEADERBOARD UI ===== */

/**
 * Show leaderboard overlay for a specific game.
 * Fetches data from the server and renders a top-10 ranking.
 *
 * @param {string} gameId - Game identifier
 * @param {string} difficulty - Difficulty level
 * @param {number} myScore - The player's current score (for highlighting)
 */
async function showLeaderboard(gameId, difficulty, myScore) {
  const overlay = document.getElementById('leaderboard-overlay');
  const content = document.getElementById('leaderboard-content');
  const title = document.getElementById('leaderboard-title');
  
  if (!overlay || !content) return;

  title.textContent = 'ランキング読み込み中...';
  content.innerHTML = '<div class="lb-loading"><div class="lb-spinner"></div></div>';
  overlay.classList.add('show');

  try {
    const entries = await getLeaderboard(gameId, difficulty, 10);
    const myData = await getMyScore(gameId, difficulty);

    title.textContent = '🏆 ランキング';

    if (entries.length === 0) {
      content.innerHTML = `
        <div class="lb-empty">
          <div class="lb-empty-icon">🏆</div>
          <p>まだスコアが登録されていません</p>
          <p class="lb-empty-sub">ログインしてプレイすると<br>ランキングに参加できます</p>
        </div>`;
      return;
    }

    const user = getAuthUser();
    const myUserId = user ? user.id : null;

    let html = '<div class="lb-list">';
    entries.forEach((entry, i) => {
      const isMe = myUserId && entry.user_id === myUserId;
      const rankIcon = i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${entry.rank}`;
      const rankClass = i < 3 ? `lb-rank-${i + 1}` : '';
      
      html += `
        <div class="lb-row ${isMe ? 'lb-me' : ''} ${rankClass}">
          <div class="lb-rank">${rankIcon}</div>
          <div class="lb-avatar-wrap">
            <img class="lb-avatar" src="https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(entry.user_id || entry.user_name || 'player')}" alt="">
          </div>
          <div class="lb-name">${isMe ? 'あなた' : entry.user_name}</div>
          <div class="lb-score">${entry.score}<span class="lb-unit">点</span></div>
        </div>`;
    });
    html += '</div>';

    // Show my rank if not in top 10
    if (myData.rank && myData.rank > 10) {
      html += `
        <div class="lb-my-rank">
          <span class="lb-my-rank-label">あなたの順位</span>
          <span class="lb-my-rank-value">${myData.rank}位</span>
          <span class="lb-my-rank-score">${myData.score}点</span>
        </div>`;
    }

    content.innerHTML = html;
  } catch (e) {
    console.error('Leaderboard error:', e);
    content.innerHTML = `
      <div class="lb-empty">
        <div class="lb-empty-icon">⚠️</div>
        <p>ランキング取得に失敗しました</p>
        <p class="lb-empty-sub">ネットワーク接続を確認してください</p>
      </div>`;
  }
}

function closeLeaderboard() {
  const overlay = document.getElementById('leaderboard-overlay');
  if (overlay) overlay.classList.remove('show');
}

/**
 * Enhanced showResult that optionally shows a leaderboard button.
 * Adds a ranking button to the result overlay when the user is logged in.
 */
function _addLeaderboardButton(gameId, difficulty, score) {
  const btnRow = document.querySelector('#result-overlay .btn-row');
  if (!btnRow) return;

  // Remove old leaderboard button if exists
  const old = btnRow.querySelector('.btn-leaderboard');
  if (old) old.remove();

  // Only show if user is logged in
  if (!isLoggedIn()) return;

  const btn = document.createElement('button');
  btn.className = 'btn-outline btn-leaderboard';
  btn.innerHTML = '🏆 ランキング';
  btn.onclick = () => showLeaderboard(gameId, difficulty, score);
  btnRow.appendChild(btn);
}

/**
 * Render the global leaderboard in a specific container.
 * This is used on the home screen.
 * @param {string} containerId - Container element ID
 * @param {'alltime'|'weekly'} mode - Ranking mode (default: 'alltime')
 */
async function renderGlobalLeaderboard(containerId, mode = 'alltime') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<div class="lb-loading"><div class="lb-spinner"></div></div>';

  try {
    const entries = mode === 'weekly'
      ? await getWeeklyGlobalLeaderboard()
      : await getGlobalLeaderboard();

    if (entries.length === 0) {
      const emptyMsg = mode === 'weekly'
        ? '今週はまだスコアが登録されていません'
        : 'まだスコアが登録されていません';
      container.innerHTML = `
        <div class="lb-empty">
          <p>${emptyMsg}</p>
        </div>`;
      return;
    }

    const user = getAuthUser();
    const myUserId = user ? user.id : null;

    let html = '<div class="lb-list">';
    entries.forEach((entry, i) => {
      const isMe = myUserId && entry.user_id === myUserId;
      const rankIcon = i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${entry.rank}`;
      const rankClass = i < 3 ? `lb-rank-${i + 1}` : '';
      
      html += `
        <div class="lb-row ${isMe ? 'lb-me' : ''} ${rankClass}">
          <div class="lb-rank">${rankIcon}</div>
          <div class="lb-avatar-wrap">
            <img class="lb-avatar" src="https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(entry.user_id || entry.user_name || 'player')}" alt="">
          </div>
          <div class="lb-name">${isMe ? 'あなた' : entry.user_name}</div>
          <div class="lb-score">${entry.score}<span class="lb-unit">点</span></div>
        </div>`;
    });
    html += '</div>';

    container.innerHTML = html;
  } catch (e) {
    console.error('Global leaderboard error:', e);
    container.innerHTML = `
      <div class="lb-empty">
        <p>ランキング取得に失敗しました</p>
      </div>`;
  }
}

/** Current global leaderboard tab */
let _globalTabMode = 'alltime';

/**
 * Switch global leaderboard tab between all-time and weekly.
 * @param {'alltime'|'weekly'} mode
 */
function switchGlobalTab(mode) {
  if (mode === _globalTabMode) return;
  _globalTabMode = mode;

  // Update tab styling
  const alltimeTab = document.getElementById('glb-tab-alltime');
  const weeklyTab = document.getElementById('glb-tab-weekly');
  if (alltimeTab && weeklyTab) {
    const isAlltime = mode === 'alltime';
    alltimeTab.style.background = isAlltime ? 'rgba(255,255,255,0.06)' : 'transparent';
    alltimeTab.style.color = isAlltime ? 'var(--text)' : 'var(--text-3)';
    weeklyTab.style.background = !isAlltime ? 'rgba(255,255,255,0.06)' : 'transparent';
    weeklyTab.style.color = !isAlltime ? 'var(--text)' : 'var(--text-3)';
  }

  // Re-render
  renderGlobalLeaderboard('home-global-leaderboard', mode);
}
