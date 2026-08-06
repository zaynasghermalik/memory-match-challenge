# Assets

This project ships with almost no binary asset files — nearly everything
is generated or synthesized in code — plus **one deliberately embedded
base64 asset** to demonstrate that technique.

- **Card backs, card fronts, and particles** are drawn at runtime with the
  Phaser `Graphics` API and baked into reusable textures via
  `generateTexture()` in [`PreloadScene.js`](../scenes/PreloadScene.js).
- **7 of the 8 card icons** are rendered as emoji text
  (`🍎 🚀 🎲 ⭐ ⚽ 🎵 🎁`), which display crisply at any resolution with
  zero download cost.
- **The 8th card icon** (💎) is a real 64x64 PNG, base64-encoded in
  [`embeddedGemIcon.js`](./embeddedGemIcon.js), loaded via
  `TextureManager.addBase64()` in `PreloadScene.js`, and rendered as a
  Phaser `Image` in [`Card.js`](../objects/Card.js). It was hand-built
  locally with a short Node script using only the built-in `zlib` module —
  no downloaded or third-party image was used.
- **All sound effects** (flip, match, victory, game over) are synthesized
  in real time with the Web Audio API in
  [`AudioManager.js`](../managers/AudioManager.js) — no `.mp3`/`.wav`
  files required.

This keeps the game almost entirely self-contained and fast to load,
while still satisfying an explicit base64-embedding requirement with one
clearly-integrated, license-free asset. See the root
[`README.md`](../../README.md#assumptions-trade-offs--future-improvements)
for the full rationale.
