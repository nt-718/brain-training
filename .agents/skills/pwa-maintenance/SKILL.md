---
name: pwa-maintenance
description: Manage Service Worker cache versioning and asset lists for the PWA.
---

# PWA Maintenance Skill

This skill ensures the Progressive Web App (PWA) stays updated for users.

---

## 🛠 Key Files

- `sw.js`: Service Worker logic and asset list.
- `manifest.json`: App metadata (icons, colors, start URL).

---

## 🚀 Version Bumping (sw.js)

Whenever any file in the project (JS, CSS, HTML, Assets) is modified, you **must** update the `CACHE_NAME` in `sw.js`.

1.  **Read current version**: `const CACHE_NAME = 'noutore-vXX';`
2.  **Increment version**: `v24` -> `v25`.
3.  **Update `ASSETS`**: Ensure all new files (e.g., `js/new-game.js`) are added to the list.

### `sw.js` Template Snippet

```javascript
const CACHE_NAME = 'noutore-v25'; // BUMP ME!
const ASSETS = [
  './',
  './index.html',
  './css/common.css',
  // ... all game-specific files
];
```

---

## 🛠 Checkpoints

- [ ] **Asset Completion**: Are all `.js`, `.css`, and `.svg` files listed?
- [ ] **Icons**: If `favicon.png` or `icon-192.png` changed, update `manifest.json` if necessary.
- [ ] **Scope**: Ensure new files are within the directory structure covered by the Service Worker.
