/* ===== API CLIENT ===== */

// API Base URL (Live Serverなど別ポートで動かしている場合を考慮)
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000'
  : '';

// Track the last saved game info for leaderboard integration
let _lastSaveInfo = null;

/**
 * Save a score to the server (if logged in).
 * Local localStorage saving should already be done by the game's own code.
 * This function handles the server-side sync only.
 *
 * @param {string} gameId - Game identifier (e.g., 'visual-calc')
 * @param {string} difficulty - Difficulty level (e.g., 'easy', 'normal', 'hard', 'default')
 * @param {number} score - The score to save
 */
async function saveScore(gameId, difficulty, score) {
  // Always store last game info for leaderboard button (even if not logged in)
  _lastSaveInfo = { gameId, difficulty: difficulty || 'default', score };

  // Record play history locally (every play, not just new bests)
  (function recordLocalHistory() {
    if (typeof BS_MAPPING === 'undefined') return;
    const mapping = BS_MAPPING.find(m => m.target === gameId);
    if (!mapping) return;
    const keys = Array.isArray(mapping.key) ? mapping.key : [mapping.key];
    // Pick the key that matches this difficulty, or use the first key
    const diff = difficulty || 'default';
    const targetKey = keys.find(k => k.includes(diff)) || keys[0];
    const histKey = targetKey + '__hist';
    try {
      const existing = localStorage.getItem(histKey);
      const hist = existing ? JSON.parse(existing) : [];
      hist.push([Date.now(), parseFloat(score)]);
      if (hist.length > 500) hist.splice(0, hist.length - 500);
      localStorage.setItem(histKey, JSON.stringify(hist));
    } catch (e) {}
  })();

  const token = localStorage.getItem('jwt');
  if (!token) return; // Not logged in, skip server sync

  try {
    let isCrown = false;
    if (typeof BS_MAPPING !== 'undefined') {
      const mapping = BS_MAPPING.find(m => m.target === gameId);
      if (mapping && mapping.ranksVar && window[mapping.ranksVar]) {
        const ranks = window[mapping.ranksVar];
        if (typeof getScoreRank === 'function') {
          const rank = getScoreRank(score, ranks);
          if (rank === ranks[0]) isCrown = true;
        }
      }
    }

    await fetch(`${API_BASE_URL}/api/scores`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        game_id: gameId,
        difficulty: difficulty || 'default',
        score: score,
        is_crown: isCrown
      }),
    });
    // Invalidate local DB cache so stats refresh
    if (typeof invalidateDbCache === 'function') invalidateDbCache();
  } catch (e) {
    console.warn('Score sync failed (offline?):', e);
  }
}

/**
 * Get the leaderboard for a game+difficulty.
 * @param {string} gameId
 * @param {string} difficulty
 * @param {number} limit - Max entries (default 10)
 * @returns {Promise<Array<{rank, user_name, photo_url, score, user_id}>>}
 */
async function getLeaderboard(gameId, difficulty, limit = 10) {
  try {
    const params = new URLSearchParams({ game_id: gameId, difficulty, limit });
    const res = await fetch(`${API_BASE_URL}/api/scores/leaderboard?${params}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn('Leaderboard fetch failed:', e);
    return [];
  }
}

/**
 * Get my best score and rank for a game+difficulty.
 * @param {string} gameId
 * @param {string} difficulty
 * @returns {Promise<{score: number|null, rank: number|null}>}
 */
async function getMyScore(gameId, difficulty) {
  const token = localStorage.getItem('jwt');
  if (!token) return { score: null, rank: null };

  try {
    const params = new URLSearchParams({ game_id: gameId, difficulty });
    const res = await fetch(`${API_BASE_URL}/api/scores/me?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return { score: null, rank: null };
    return await res.json();
  } catch (e) {
    console.warn('My score fetch failed:', e);
    return { score: null, rank: null };
  }
}

/**
 * Get the global leaderboard (sum of best scores across all games).
 * @returns {Promise<Array<{rank, user_name, photo_url, score, user_id}>>}
 */
async function getGlobalLeaderboard() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/scores/global`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn('Global leaderboard fetch failed:', e);
    return [];
  }
}

/**
 * Get the weekly global leaderboard (crowns earned in the last 7 days).
 * @returns {Promise<Array<{rank, user_name, photo_url, score, user_id}>>}
 */
async function getWeeklyGlobalLeaderboard() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/scores/global/weekly`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn('Weekly global leaderboard fetch failed:', e);
    return [];
  }
}

/**
 * Get all my best scores (aggregated per game+difficulty)
 * @returns {Promise<Array<{game_id, difficulty, max_score, min_score, play_count, has_crown}>>}
 */
async function getMyRecords() {
  const token = localStorage.getItem('jwt');
  if (!token) return [];

  try {
    const res = await fetch(`${API_BASE_URL}/api/scores/my/records`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn('My records fetch failed:', e);
    return [];
  }
}

/**
 * Get all my play history
 * @returns {Promise<Array<{game_id, difficulty, score, played_at}>>}
 */
async function getMyHistory() {
  const token = localStorage.getItem('jwt');
  if (!token) return [];

  try {
    const res = await fetch(`${API_BASE_URL}/api/scores/my/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn('My history fetch failed:', e);
    return [];
  }
}

/**
 * Synchronize DB records down to localStorage to ensure
 * individual games and UI badges show the correct best score.
 */
async function syncDbRecordsToLocal() {
  const token = localStorage.getItem('jwt');
  if (!token) return; // Must check token directly if isLoggedIn is not ready yet

  const records = await getMyRecords();
  if (!records || records.length === 0) return;

  if (typeof BS_MAPPING === 'undefined') return;

  records.forEach(r => {
    const mapping = BS_MAPPING.find(m => m.target === r.game_id);
    if (!mapping) return;

    const keys = Array.isArray(mapping.key) ? mapping.key : [mapping.key];
    const diff = r.difficulty || 'default';
    const targetKey = keys.find(k => k.includes(diff)) || keys[0];

    if (!targetKey) return;

    const existingRaw = localStorage.getItem(targetKey);
    const best = mapping.reverse ? r.min_score : r.max_score;

    if (existingRaw === null) {
      localStorage.setItem(targetKey, best.toString());
    } else {
      const existing = parseFloat(existingRaw);
      if (!isNaN(existing)) {
        if (mapping.reverse) {
          if (best < existing) localStorage.setItem(targetKey, best.toString());
        } else {
          if (best > existing) localStorage.setItem(targetKey, best.toString());
        }
      }
    }
  });

  // After syncing, explicitly refresh the home screen badges
  if (typeof refreshBestScores === 'function') refreshBestScores();
}

// Run sync on app load if logged in
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof isLoggedIn === 'function' && isLoggedIn()) {
      syncDbRecordsToLocal();
    }
  }, 500); // Give auth.js slightly more time to init if needed
});
