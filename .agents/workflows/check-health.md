---
description: Run a health check to find common issues in the brain training project.
---

# Project Health Check (/check-health)

This workflow scans the project for common issues based on `game_evaluation.md`.

1.  **Check `main.js` transitions**: Look for `typeof <game>Stop === 'function'`.
2.  **Verify `BS_MAPPING`**: Ensure there's a mapping for every `js/*.js` file (except `main.js`).
3.  **Check `sw.js` version**: Ensure `CACHE_NAME` versioning is chronological.
4.  **Confirm `GAME_RANKS`**: Check `var GAME_RANKS` in all `js/*.js` files (not `let` or `const`).
5.  **Scan for dead logs**: Check for `console.log` leftovers.
6.  **PWA Assets**: Run a check to see if all JS and CSS files are in the Service Worker's `ASSETS` list.

### // turbo
7.  Check for missing `Stop` calls in `js/main.js`.
```bash
grep -r "Stop" js/*.js | grep "function" | awk -F: '{print $2}' | awk '{print $2}' | uniq
```
8.  Check which are actually called in `js/main.js`.
```bash
grep "Stop" js/main.js
```
