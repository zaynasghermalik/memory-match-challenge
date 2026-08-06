# Memory Match Challenge

A polished, production-quality memory-matching game built with **Phaser 3**,
**Vite**, and vanilla ES6 JavaScript — no frameworks, no TypeScript, and no
external UI libraries. Builds to a single self-contained HTML file suitable
for playable-ad platforms such as AppLovin.

## Description

Flip cards, find every matching pair, and beat the 60-second clock. Match
all 8 pairs before time runs out to win; run out of time first and it's
game over. Built with a clean, modular scene/manager architecture so the
codebase stays easy to read, extend, and maintain.

## Features

- 4x4 grid (8 unique pairs) with Fisher-Yates shuffle for a new layout every game
- 60-second countdown timer, live move counter, score, and pairs-found tracker
- Smooth Phaser Tween animations: card flip, hover scale, matched pulse,
  victory particles, game-over camera shake, and fading scene transitions
- Procedurally generated card art (rounded cards, soft shadows, gradient
  fills) and emoji icons for 7 of the 8 card pairs — no image files to load
- One card pair uses a real base64-embedded PNG icon, loaded via
  `TextureManager.addBase64()`, demonstrating genuine binary-asset embedding
- Procedurally synthesized sound effects (flip, match, victory, game over)
  via the Web Audio API — no audio files to load
- Best score persisted with `localStorage` and shown on the main menu
- Fully responsive: `Phaser.Scale.FIT` keeps the aspect ratio and centers
  the game on desktop, laptop, tablet, and mobile
- Clean separation of concerns: scenes, reusable game objects, managers,
  and utilities
- Production build is a single self-contained `dist/index.html` (via
  `vite-plugin-singlefile`) with zero external file references — runs
  directly from `file://`, no server required

## Folder Structure

```
memory-match-challenge/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.js                  # Entry point — boots the Phaser.Game instance
    ├── config/
    │   └── gameConfig.js        # Phaser game configuration (scale, scenes)
    ├── scenes/
    │   ├── BootScene.js         # Engine bootstrap
    │   ├── PreloadScene.js      # Generates all textures, shows a progress bar
    │   ├── MenuScene.js         # Title, instructions, best score, Play button
    │   ├── GameScene.js         # Core gameplay: grid, matching, timer, score
    │   ├── UIScene.js           # HUD overlay running in parallel with GameScene
    │   └── ResultScene.js       # Win / lose screen with stats and navigation
    ├── objects/
    │   └── Card.js              # Card game object: flip/hover/match animations
    ├── managers/
    │   ├── AudioManager.js      # Synthesizes sound effects via Web Audio API
    │   ├── ScoreManager.js      # Score, moves, pairs, best-score persistence
    │   └── TimerManager.js      # Countdown timer wrapper around scene.time
    ├── utils/
    │   ├── Shuffle.js           # Fisher-Yates array shuffle
    │   └── Constants.js         # Grid, color, timing, and event-name constants
    └── assets/
        ├── README.md            # Explains the procedural/synthesized asset approach
        └── embeddedGemIcon.js   # The one base64-embedded PNG asset (see Task 2 notes below)
```

## Installation

Requires [Node.js](https://nodejs.org/) 18+ and npm.

```bash
npm install
```

## Development

Starts a local dev server with hot module reload at `http://localhost:5173`.

```bash
npm run dev
```

## Build

Produces a single self-contained production file at `dist/index.html` —
all JavaScript and CSS are inlined by `vite-plugin-singlefile`, so there
are no separate `dist/assets/*.js` files and no external references. This
is the file to hand off as the AppLovin playable build; it runs correctly
opened directly via `file://`, with no local server required.

```bash
npm run build
```

To preview the production build through a local server instead:

```bash
npm run preview
```

## Game Controls

- **Click / tap a card** to flip it face-up.
- Flip two cards per turn — matching pairs stay revealed, mismatched pairs
  flip back after ~800ms.
- **Restart** — resets the board and starts a fresh game.
- **Menu** — returns to the main menu.
- **Play Again / Main Menu** — shown on the result screen after each game.

## Architecture

The project follows a scene-driven architecture typical of Phaser 3 games,
with responsibilities kept intentionally narrow:

- **Scenes** (`src/scenes/`) own presentation and flow: `Boot → Preload →
  Menu → Game → Result`. `UIScene` runs in parallel with `GameScene`
  (launched via `this.scene.launch`) so the HUD can update independently
  of gameplay logic.
- **Cross-scene communication** happens through the game-wide event bus
  (`this.game.events`), defined by names in `Constants.js` (`EVENTS`).
  `GameScene` emits score/move/pair/timer updates; `UIScene` subscribes to
  them and cleans up its listeners on shutdown to avoid leaks.
- **`Card`** (`src/objects/Card.js`) is a self-contained
  `Phaser.GameObjects.Container` that owns its own visuals and tween-based
  animations (flip, hover, matched pulse), exposing simple state flags
  (`isFlipped`, `isMatched`, `isAnimating`) that `GameScene` checks before
  allowing interaction.
- **Managers** (`src/managers/`) encapsulate a single concern each:
  `AudioManager` (procedural sound synthesis), `ScoreManager` (score/move/
  pair state plus best-score persistence), and `TimerManager` (countdown
  timer lifecycle).
- **Utils** (`src/utils/Shuffle.js`, `src/utils/Constants.js`) hold pure,
  reusable helpers and every shared constant, so there are no magic
  numbers duplicated across files.
- **Mostly procedural assets, one embedded exception**: card textures are
  generated with Phaser's `Graphics.generateTexture()` in `PreloadScene`,
  most card icons are emoji text, and sound effects are synthesized in
  real time with the Web Audio API. One card icon is a genuine base64-
  embedded PNG (`src/assets/embeddedGemIcon.js`), loaded via
  `textures.addBase64()` in `PreloadScene` and rendered by `Card.js`. See
  [`src/assets/README.md`](src/assets/README.md) and the Assumptions
  section below for the reasoning.
- **Single-file production build**: `vite.config.js` uses
  `vite-plugin-singlefile` so `npm run build` inlines all JS/CSS into one
  `dist/index.html`, meeting playable-ad platform requirements (e.g.
  AppLovin) for a single self-contained file with no external requests.

## Assumptions, Trade-offs & Future Improvements

**Why most assets are procedural/synthesized rather than binary files.**
Card backs, card fronts, and particles are drawn at runtime with Phaser's
`Graphics.generateTexture()`, and every sound effect is synthesized live
via the Web Audio API. This was a deliberate trade-off, not an oversight:
it keeps load time near-instant (nothing to decode or wait on), removes
any possibility of a missing/broken-asset error, and keeps the shipped
build's footprint small — all of which matter for a playable ad where
first-frame time and file size are directly scored. The cost is that the
visuals are simpler than hand-authored art would allow.

**Why one asset is embedded as base64.** A single card icon
(`src/assets/embeddedGemIcon.js`) is a genuine base64-encoded PNG, loaded
via `TextureManager.addBase64()` and rendered as a real `Image` game
object in `Card.js`. This exists specifically to demonstrate the base64
binary-asset-embedding technique the assessment explicitly requires,
alongside — not instead of — the procedural approach used everywhere
else. It adds roughly 1.2 KB to the final build, which is immaterial
against the 5 MB limit.

**What I'd improve with more time:**
- Touch/gesture polish for mobile — larger hit targets and haptic-style
  feedback on tap, tuned specifically for small screens
- Selectable difficulty levels (grid size and/or timer length)
- Accessibility: full keyboard navigation between cards and screen-reader
  labeling, beyond the current mouse/touch-only input
- A mute/pause toggle in the HUD (audio currently can only be silenced at
  the OS/browser level)
- Automated unit tests around the matching logic (`GameScene`) and
  managers (`ScoreManager`, `TimerManager`), which are currently only
  verified manually/through build smoke tests

**Licensing.** All assets in this project are free of third-party
licensing concerns: the procedural graphics are drawn in code, the card
icons are standard Unicode emoji characters (rendered by the OS/browser
font, not a bundled image), the audio is synthesized from raw
oscillators, and the one embedded base64 PNG was hand-built locally with
a short script using only Node's built-in `zlib` module — no downloaded,
purchased, or third-party stock asset was used anywhere in the project.

## Tech Stack

- [Phaser 3](https://phaser.io/) — game engine
- [Vite](https://vitejs.dev/) — dev server and bundler
- [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) — inlines the production build into one HTML file
- Vanilla JavaScript (ES6 modules) — no Re# Memory Match Challenge

🎮 [Play the live demo](https://zaynasghermalik.github.io/memory-match-challenge/)

A polished, production-quality memory-matching game built with **Phaser 3**,
**Vite**, and vanilla ES6 JavaScript — no frameworks, no TypeScript, and no
external UI libraries. Builds to a single self-contained HTML file suitable
for playable-ad platforms such as AppLovin.

## Description

Flip cards, find every matching pair, and beat the 60-second clock. Match
all 8 pairs before time runs out to win; run out of time first and it's
game over. Built with a clean, modular scene/manager architecture so the
codebase stays easy to read, extend, and maintain.

## Features

- 4x4 grid (8 unique pairs) with Fisher-Yates shuffle for a new layout every game
- 60-second countdown timer, live move counter, score, and pairs-found tracker
- Smooth Phaser Tween animations: card flip, hover scale, matched pulse,
  victory particles, game-over camera shake, and fading scene transitions
- Procedurally generated card art (rounded cards, soft shadows, gradient
  fills) and emoji icons for 7 of the 8 card pairs — no image files to load
- One card pair uses a real base64-embedded PNG icon, loaded via
  `TextureManager.addBase64()`, demonstrating genuine binary-asset embedding
- Procedurally synthesized sound effects (flip, match, victory, game over)
  via the Web Audio API — no audio files to load
- Best score persisted with `localStorage` and shown on the main menu
- Fully responsive: `Phaser.Scale.FIT` keeps the aspect ratio and centers
  the game on desktop, laptop, tablet, and mobile
- Clean separation of concerns: scenes, reusable game objects, managers,
  and utilities
- Production build is a single self-contained `dist/index.html` (via
  `vite-plugin-singlefile`) with zero external file references — runs
  directly from `file://`, no server required

## Folder Structure

memory-match-challenge/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
├── main.js # Entry point — boots the Phaser.Game instance
├── config/
│ └── gameConfig.js # Phaser game configuration (scale, scenes)
├── scenes/
│ ├── BootScene.js # Engine bootstrap
│ ├── PreloadScene.js # Generates all textures, shows a progress bar
│ ├── MenuScene.js # Title, instructions, best score, Play button
│ ├── GameScene.js # Core gameplay: grid, matching, timer, score
│ ├── UIScene.js # HUD overlay running in parallel with GameScene
│ └── ResultScene.js # Win / lose screen with stats and navigation
├── objects/
│ └── Card.js # Card game object: flip/hover/match animations
├── managers/
│ ├── AudioManager.js # Synthesizes sound effects via Web Audio API
│ ├── ScoreManager.js # Score, moves, pairs, best-score persistence
│ └── TimerManager.js # Countdown timer wrapper around scene.time
├── utils/
│ ├── Shuffle.js # Fisher-Yates array shuffle
│ └── Constants.js # Grid, color, timing, and event-name constants
└── assets/
├── README.md # Explains the procedural/synthesized asset approach
└── embeddedGemIcon.js # The one base64-embedded PNG asset (see Task 2 notes below)


## Installation

Requires [Node.js](https://nodejs.org/) 18+ and npm.

```bash
npm install
```

## Development

Starts a local dev server with hot module reload at `http://localhost:5173`.

```bash
npm run dev
```

## Build

Produces a single self-contained production file at `dist/index.html` —
all JavaScript and CSS are inlined by `vite-plugin-singlefile`, so there
are no separate `dist/assets/*.js` files and no external references. This
is the file to hand off as the AppLovin playable build; it runs correctly
opened directly via `file://`, with no local server required.

```bash
npm run build
```

To preview the production build through a local server instead:

```bash
npm run preview
```

## Game Controls

- **Click / tap a card** to flip it face-up.
- Flip two cards per turn — matching pairs stay revealed, mismatched pairs
  flip back after ~800ms.
- **Restart** — resets the board and starts a fresh game.
- **Menu** — returns to the main menu.
- **Play Again / Main Menu** — shown on the result screen after each game.

## Architecture

The project follows a scene-driven architecture typical of Phaser 3 games,
with responsibilities kept intentionally narrow:

- **Scenes** (`src/scenes/`) own presentation and flow: `Boot → Preload →
  Menu → Game → Result`. `UIScene` runs in parallel with `GameScene`
  (launched via `this.scene.launch`) so the HUD can update independently
  of gameplay logic.
- **Cross-scene communication** happens through the game-wide event bus
  (`this.game.events`), defined by names in `Constants.js` (`EVENTS`).
  `GameScene` emits score/move/pair/timer updates; `UIScene` subscribes to
  them and cleans up its listeners on shutdown to avoid leaks.
- **`Card`** (`src/objects/Card.js`) is a self-contained
  `Phaser.GameObjects.Container` that owns its own visuals and tween-based
  animations (flip, hover, matched pulse), exposing simple state flags
  (`isFlipped`, `isMatched`, `isAnimating`) that `GameScene` checks before
  allowing interaction.
- **Managers** (`src/managers/`) encapsulate a single concern each:
  `AudioManager` (procedural sound synthesis), `ScoreManager` (score/move/
  pair state plus best-score persistence), and `TimerManager` (countdown
  timer lifecycle).
- **Utils** (`src/utils/Shuffle.js`, `src/utils/Constants.js`) hold pure,
  reusable helpers and every shared constant, so there are no magic
  numbers duplicated across files.
- **Mostly procedural assets, one embedded exception**: card textures are
  generated with Phaser's `Graphics.generateTexture()` in `PreloadScene`,
  most card icons are emoji text, and sound effects are synthesized in
  real time with the Web Audio API. One card icon is a genuine base64-
  embedded PNG (`src/assets/embeddedGemIcon.js`), loaded via
  `textures.addBase64()` in `PreloadScene` and rendered by `Card.js`. See
  [`src/assets/README.md`](src/assets/README.md) and the Assumptions
  section below for the reasoning.
- **Single-file production build**: `vite.config.js` uses
  `vite-plugin-singlefile` so `npm run build` inlines all JS/CSS into one
  `dist/index.html`, meeting playable-ad platform requirements (e.g.
  AppLovin) for a single self-contained file with no external requests.

## Assumptions, Trade-offs & Future Improvements

**Why most assets are procedural/synthesized rather than binary files.**
Card backs, card fronts, and particles are drawn at runtime with Phaser's
`Graphics.generateTexture()`, and every sound effect is synthesized live
via the Web Audio API. This was a deliberate trade-off, not an oversight:
it keeps load time near-instant (nothing to decode or wait on), removes
any possibility of a missing/broken-asset error, and keeps the shipped
build's footprint small — all of which matter for a playable ad where
first-frame time and file size are directly scored. The cost is that the
visuals are simpler than hand-authored art would allow.

**Why one asset is embedded as base64.** A single card icon
(`src/assets/embeddedGemIcon.js`) is a genuine base64-encoded PNG, loaded
via `TextureManager.addBase64()` and rendered as a real `Image` game
object in `Card.js`. This exists specifically to demonstrate the base64
binary-asset-embedding technique the assessment explicitly requires,
alongside — not instead of — the procedural approach used everywhere
else. It adds roughly 1.2 KB to the final build, which is immaterial
against the 5 MB limit.

**What I'd improve with more time:**
- Touch/gesture polish for mobile — larger hit targets and haptic-style
  feedback on tap, tuned specifically for small screens
- Selectable difficulty levels (grid size and/or timer length)
- Accessibility: full keyboard navigation between cards and screen-reader
  labeling, beyond the current mouse/touch-only input
- A mute/pause toggle in the HUD (audio currently can only be silenced at
  the OS/browser level)
- Automated unit tests around the matching logic (`GameScene`) and
  managers (`ScoreManager`, `TimerManager`), which are currently only
  verified manually/through build smoke tests

**Licensing.** All assets in this project are free of third-party
licensing concerns: the procedural graphics are drawn in code, the card
icons are standard Unicode emoji characters (rendered by the OS/browser
font, not a bundled image), the audio is synthesized from raw
oscillators, and the one embedded base64 PNG was hand-built locally with
a short script using only Node's built-in `zlib` module — no downloaded,
purchased, or third-party stock asset was used anywhere in the project.

## Tech Stack

- [Phaser 3](https://phaser.io/) — game engine
- [Vite](https://vitejs.dev/) — dev server and bundler
- [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) — inlines the production build into one HTML file
- Vanilla JavaScript (ES6 modules) — no React, no TypeScriptact, no TypeScript
