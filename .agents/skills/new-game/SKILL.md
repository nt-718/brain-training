---
name: new-game
description: Implement a new brain training game in the mental-training project. This skill handles everything from JS/CSS creation to Service Worker updates.
---

# New Game Implementation Skill (Antigravity Version)

This skill defines the standardized process for adding a new cognitive training game to the "Mental Training" PWA.

---

## 🏗 project Structure

| File | Role |
|---|---|
| `index.html` | UI (Game Card, Screen, Scripts) |
| `js/<game-id>.js` | Game Logic (State, Ranks, Functions) |
| `css/<game-id>.css` | Game Styles (Animations, Layout) |
| `js/main.js` | Routing (`showScreen`), Best Scores (`BS_MAPPING`), Announcements |
| `sw.js` | PWA Cache (Version bump, Asset list) |

---

## 🚀 Implementation Steps

### Step 1: Create `js/<game-id>.js`

Follow this template strictly. Use `var` for `GAME_RANKS` to ensure it's accessible via `window[ranksVar]`.

```javascript
/* ===== GAME NAME (game-id) ===== */

// 1. Define RANKS (Must use var, 7 tiers recommended, sorted by score)
var GAME_RANKS = [
  { min: 90, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: 75, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: 60, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: 45, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: 30, label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: 15, label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0,  label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

// 2. LocalStorage Key
const GAME_BEST_KEY = 'game_id_best'; 

// 3. State Variables
let gameRunning = false;
let gameScore = 0;
let gameTimer = null;

// 4. Initialization
function gameLoadBest() {
  const best = localStorage.getItem(GAME_BEST_KEY) || 0;
  document.getElementById('gm-best').textContent = best;
}

// 5. STOP FUNCTION (CRITICAL: Must clear timers and state)
function gameStop() {
  gameRunning = false;
  if (gameTimer) clearInterval(gameTimer);
  // Reset UI elements if needed
}

// 6. START FUNCTION
function gameStart() {
  gameStop(); // Always clean up before starting
  gameRunning = true;
  gameScore = 0;
  document.getElementById('gm-score').textContent = 0;
  gameLoadBest();
  // Start game logic...
}

// 7. END FUNCTION
function gameEnd() {
  gameRunning = false;
  const prev = parseInt(localStorage.getItem(GAME_BEST_KEY)) || 0;
  const isNewRecord = gameScore > prev;
  
  if (isNewRecord) {
    localStorage.setItem(GAME_BEST_KEY, gameScore);
  }
  
  const rank = getScoreRank(gameScore, GAME_RANKS);
  showResult(
    isNewRecord ? '🏆' : '🎮',
    'Game Over!',
    `Score: ${gameScore}\n${isNewRecord ? 'New Record!' : 'Best: ' + prev}`,
    gameStart,
    rank
  );
  
  if (typeof refreshBestScores === 'function') refreshBestScores();
}
```

### Step 2: Create `css/<game-id>.css`

Use the project's design system (Glassmorphism, Dark Mode).

```css
/* Use a prefix to avoid collision (e.g., .gm-) */
.gm-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  animation: gmFadeIn 0.3s ease-out;
}

@keyframes gmFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Step 3: Update `index.html`

1.  **CSS Link**: Before `</head>`.
2.  **Game Card**: In the appropriate category section.
3.  **Game Screen**: Before `<!-- RESULT OVERLAY -->`.

**Game Screen Template (Standard Navigation):**
Note: Back button uses `🏠` icon. Rule (ℹ️) and Grade (🏆) buttons are **automatically injected** by `main.js`. Don't add them manually.

```html
<!-- ========== GAME NAME (game-id) ========== -->
<div id="game-id" class="screen">
  <nav class="nav">
    <button class="btn-back" onclick="showScreen('home')">🏠</button>
    <h1>ゲーム名</h1>
  </nav>
  <div class="game-content" id="gm-content">
    <div class="score-bar">
      <div class="score-item">
        <div class="label">スコア</div>
        <div class="value" id="gm-score">0</div>
      </div>
      <div class="score-item">
        <div class="label">ベスト</div>
        <div class="value" id="gm-best">0</div>
      </div>
    </div>

    <!-- Stage Area -->
    <div id="gm-stage" class="gm-stage">
      <!-- Game specific content -->
    </div>

    <div class="answer-area">
      <button class="btn-primary" id="gm-start-btn" onclick="gmStart()">スタート</button>
    </div>
  </div>
</div>
```

4.  **Script Tag**: Before `</body>`.

### Step 4: Update `js/main.js`

1.  **Stop Function**: Add `if (typeof gameStop === 'function') gameStop();` to `showScreen()`.
2.  **BS_MAPPING**: Add entry for score tracking.
3.  **ANNOUNCEMENTS**: Add entry for the new game.

### Step 5: Update `sw.js` (PWA)

1.  **Bump `CACHE_NAME` version** (e.g., `v24` -> `v25`).
2.  **Add assets** to the `ASSETS` array.

---

## ⚠️ Best Practices & Checkpoints

- [ ] **Timer Cleanup**: Does your `Stop` function clear all active intervals/timeouts?
- [ ] **Rank Sorting**: Are `GAME_RANKS` sorted in descending order of `min`?
- [ ] **PWA Version**: Did you increment the version in `sw.js`?
- [ ] **Accessibility**: Is the game playable via keyboard?
- [ ] **Mobile**: Are touch targets large enough (min 44px)?
