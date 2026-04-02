---
description: Create a new brain training game from scratch.
---

# New Game Implementation Workflow (/new-game)

Follow these steps to implement and integrate a new brain training game.

1.  **Define Game ID and Prefix**: E.g., `game-id: match-ten`, `prefix: mt`.
2.  **Create JS**: Create `js/<game-id>.js` using the template from `new-game` skill.
3.  **Create CSS**: Create `css/<game-id>.css` with custom styles and animations.
4.  **Update HTML**: 
    - Add CSS link to `<head>`.
    - Add Game Card to `index.html`.
    - Add Game Screen `<div>` to `index.html` (Use `🏠` nav template).
    - Add `<script>` tag.
5.  **Integrate with Main**:
    - Add `Stop` function call to `showScreen` in `js/main.js`.
    - Add score mapping to `BS_MAPPING` in `js/main.js`.
    - Add `ANNOUNCEMENTS` entry in `js/main.js`.
6.  **PWA Update**: 
    - Bump `CACHE_NAME` in `sw.js`.
    - Add JS and CSS files to `ASSETS` in `sw.js`.
7.  **Final Verification**: Run the app locally (mock) to ensure the card appears, launches the screen, and correctly saves the best score.
