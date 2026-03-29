---
name: new-game
description: このプロジェクト（mental-training）に新しいゲームを実装する。ゲームの名前・ゲームIDとルールを与えると、JS・CSS・HTMLの追加、main.jsのBS_MAPPING更新、sw.jsのキャッシュバージョン更新まで行う。
tools: Read, Write, Edit, Glob, Grep, Bash
---

# 新しいゲームの実装スキル

このプロジェクトのゲームを新規追加する手順とルールを定義する。

---

## 前提：プロジェクト構成

| ファイル | 役割 |
|---|---|
| `index.html` | ゲームカード（ホーム）＋ゲーム画面＋scriptタグ |
| `js/<game-id>.js` | ゲームロジック（RANKS・状態変数・関数） |
| `css/<game-id>.css` | ゲーム固有スタイル |
| `js/main.js` | `BS_MAPPING`（ゲーム一覧のベストスコアバッジ） |
| `sw.js` | PWAキャッシュ（CACHE_NAME・ASSETS） |

---

## Step 1: `js/<game-id>.js` を作成

### 必須要素（順番通りに配置）

```javascript
/* ===== ゲーム名 (game-id) ===== */

// 1. RANKS定義（必ずvarで、7段階推奨）
var GAME_RANKS = [
  { min: X, label: '伝説',        emoji: '👑', color: '#f59e0b' },
  { min: X, label: '達人',        emoji: '🏆', color: '#8b5cf6' },
  { min: X, label: 'エキスパート', emoji: '💫', color: '#3b82f6' },
  { min: X, label: '上級者',      emoji: '⭐', color: '#10b981' },
  { min: X, label: '中級者',      emoji: '🌟', color: '#6ee7b7' },
  { min: X, label: '見習い',      emoji: '🔰', color: '#94a3b8' },
  { min: 0, label: 'まだまだ',    emoji: '🌱', color: '#64748b' },
];

// 2. LocalStorageキー
//    単一スコア: const GAME_BEST_KEY = 'game_best';
//    難易度別:   キーは 'game_best_easy' / 'game_best_normal' / 'game_best_hard' パターン

// 3. 状態変数（let）
let gameRunning = false;
let gameScore = 0;
let gameTimer = null;

// 4. ベスト表示更新
function gameLoadBest() { ... }

// 5. 停止・クリーンアップ
function gameStop() { ... }

// 6. 開始
function gameStart() { ... }

// 7. ゲームロジック関数群

// 8. 終了処理（必ずこのパターンで）
function gameEnd() {
  const prev = parseInt(localStorage.getItem(GAME_BEST_KEY)) || 0;
  const record = gameScore > prev;
  if (record) {
    localStorage.setItem(GAME_BEST_KEY, gameScore);
    document.getElementById('game-best').textContent = gameScore;
  }
  const rank = getScoreRank(gameScore, GAME_RANKS);  // window.不要
  showResult(
    record ? '🏆' : '適切な絵文字',
    'ゲーム終了！',
    `スコア: ${gameScore}\n${record ? '🏆 新記録!' : 'ベスト: ' + prev}`,
    gameStart,
    rank
  );
  refreshBestScores();
}
```

### 重要ルール

- `var GAME_RANKS` — `const` や `let` は**絶対に使わない**（`window.GAME_RANKS` として参照されるため）
- `getScoreRank(score, GAME_RANKS)` — `window.` プレフィックスは**不要**
- `showResult()` の第5引数 `rank` は**必ず渡す**（`null` にしない）
- `refreshBestScores()` をゲーム終了時に**必ず呼ぶ**
- min値は**降順**（高スコア→低スコア）、最後は必ず `min: 0`

---

## Step 2: `css/<game-id>.css` を作成

```css
/* ===== ゲーム名 ===== */

/* プレフィックスはゲームIDの短縮形（例: race-pos → .rp-）*/
.gm-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  gap: 12px;
  margin: 8px 0;
}

/* 主要コンポーネント・カード・ボタン・アニメーション */
/* CSS変数: var(--card), var(--text-color), var(--success), var(--danger) 等を使う */

@keyframes gmPop {
  0%   { opacity: 0; transform: scale(0.75); }
  60%  { transform: scale(1.06); }
  100% { opacity: 1; transform: scale(1); }
}
```

---

## Step 3: `index.html` を3箇所更新

### 3a. CSSリンク（`</head>` の直前、既存CSSの末尾）

```html
  <link rel="stylesheet" href="css/<game-id>.css" />
</head>
```

### 3b. ゲームカード（ホーム画面の適切なカテゴリ内）

```html
<div class="game-card" onclick="showScreen('<game-id>')">
  <div class="game-icon">絵文字</div>
  <div class="game-info">
    <h2>ゲーム名</h2>
    <p>説明文（20文字以内推奨）</p>
  </div>
  <div class="badge">カテゴリ</div>
</div>
```

カテゴリバッジの選択肢（既存のものに合わせる）:
`記憶` / `暗算` / `反応` / `判断` / `空間` / `論理` / `語彙` / `集中`

### 3c. ゲーム画面（最後のゲーム画面 `</div>` の直後、`<!-- RESULT OVERLAY -->` の前）

```html
<!-- ========== ゲーム名 ========== -->
<div id="<game-id>" class="screen">
  <nav class="nav">
    <button class="btn-back" onclick="showScreen('home')">← ホーム</button>
    <h1>ゲーム名</h1>
  </nav>
  <div class="game-content">

    <!-- 難易度選択（必要な場合のみ）-->
    <div class="diff-row" id="gm-diff-row">
      <button class="diff-btn selected" onclick="gmSetDiff(this,'easy')">かんたん</button>
      <button class="diff-btn" onclick="gmSetDiff(this,'normal')">ふつう</button>
      <button class="diff-btn" onclick="gmSetDiff(this,'hard')">むずかしい</button>
    </div>

    <!-- スコアバー -->
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

    <!-- ゲームステージ -->
    <div id="gm-stage" style="display:none;">
      <!-- ゲーム固有コンテンツ -->
    </div>

    <!-- スタートボタン -->
    <div class="answer-area">
      <button class="btn-primary" id="gm-start-btn" onclick="gmStart()">スタート</button>
    </div>

  </div>
</div><!-- /#<game-id> -->
```

### 3d. scriptタグ（既存の最後の `<script src>` の直後）

```html
<script src="js/<game-id>.js"></script>
```

---

## Step 4: `js/main.js` を2箇所更新

### 4a. `showScreen()` 関数に停止処理を追加

`if (typeof omStop === 'function') omStop();` の直後（`if (id === 'home')` の前）に追加:

```javascript
if (typeof gmStop === 'function') gmStop();
```

### 4b. `BS_MAPPING` を更新

`BS_MAPPING` 配列の**最後のエントリの後**（`]` の前）に追加:

```javascript
// 単一スコア
{ target: '<game-id>', key: 'game_best',                                          ranksVar: 'GAME_RANKS' },

// 難易度別スコア
{ target: '<game-id>', key: ['game_best_easy','game_best_normal','game_best_hard'], ranksVar: 'GAME_RANKS' },

// スコアが低い方が優秀な場合（タイム系など）
{ target: '<game-id>', key: 'game_best', reverse: true, suffix: '秒',             ranksVar: 'GAME_RANKS' },
```

---

---

## Step 5: `js/main.js` の `ANNOUNCEMENTS` にお知らせを追加

`ANNOUNCEMENTS` 配列（`js/main.js` 内）の**最後のエントリの後**（`];` の前）に追加:

```javascript
{
  id: 'ann_YYYYMMDD',       // 日付ベースのユニークID（同日に複数追加する場合は ann_YYYYMMDDb など）
  icon: '絵文字',
  title: '新しいゲームを追加しました！',
  items: [
    '絵文字 <strong>ゲーム名</strong> — キャッチコピー',
  ]
},
```

- `id` は既存と重複しないこと（重複するとお知らせが表示されない）
- `items` は HTML を含められる（`<strong>` など）
- 複数ゲームを同時追加する場合は1エントリにまとめても、分けてもよい

---

## Step 6: `sw.js` を更新

### 6a. CACHE_NAME のバージョンを +1

```javascript
// 変更前
const CACHE_NAME = 'noutore-vXX';
// 変更後
const CACHE_NAME = 'noutore-vXX+1';
```

現在のバージョンは `sw.js` の1行目を読んで確認すること。

### 6b. ASSETS 配列に追加（既存の最後のゲームのCSS・JSの直後）

```javascript
  './css/<game-id>.css',
  './js/<game-id>.js',
```

---

## Step 7: 動作確認チェックリスト

- [ ] JSファイルで `var GAME_RANKS` が定義されている
- [ ] `getScoreRank(score, GAME_RANKS)` を `window.` なしで呼んでいる
- [ ] `showResult()` の第5引数に `rank` を渡している
- [ ] `refreshBestScores()` をゲーム終了時に呼んでいる
- [ ] localStorage のキーが `BS_MAPPING` の `key` と一致している
- [ ] `showScreen()` に `gmStop` の呼び出しが追加されている
- [ ] `ANNOUNCEMENTS` にお知らせエントリが追加されている
- [ ] `sw.js` の CACHE_NAME がバージョンアップされている
- [ ] `index.html` にCSSリンク・カード・画面・scriptの4つが追加されている

---

## 変数名プレフィックス命名例

| ゲームID | プレフィックス | RANKS変数 | ベストキー例 |
|---|---|---|---|
| `num-tap` | `nt` | `NT_RANKS` | `nt_best_random` |
| `race-pos` | `rp` | `RP_RANKS` | `rp_best_easy` |
| `make-ten` | `mten` | `MTEN_RANKS` | `mten_best` |
| `hi-lo` | `hl` | `HL_RANKS` | `hlBest` |
| `otp-memory` | `om` | `OM_RANKS` | `om_best_easy` |

新しいゲームIDから2〜4文字のプレフィックスを決め、全関数・ID・CSS・変数に統一して使う。
