/**
 * Central place for every "magic number" and shared key used across the game.
 * Keeping these in one file avoids duplicated literals scattered through scenes.
 */

// --- Canvas / layout ---
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 720;

// --- Grid settings ---
export const GRID_ROWS = 4;
export const GRID_COLS = 4;
export const TOTAL_CARDS = GRID_ROWS * GRID_COLS;
export const TOTAL_PAIRS = TOTAL_CARDS / 2;

// --- Card dimensions ---
export const CARD_WIDTH = 130;
export const CARD_HEIGHT = 130;
export const CARD_GAP = 20;
export const CARD_CORNER_RADIUS = 16;

// --- Board top offset (space reserved for the UI bar) ---
export const BOARD_TOP_OFFSET = 120;
export const BOARD_BOTTOM_MARGIN = 20;

// --- Gameplay ---
export const TIMER_DURATION = 60; // seconds
export const SCORE_PER_MATCH = 100;
export const MISMATCH_DELAY = 800; // ms, time two non-matching cards stay revealed

// --- Card icons (8 unique symbols => 8 pairs) ---
export const CARD_SYMBOLS = ['🍎', '🚀', '🎲', '⭐', '⚽', '🎵', '🎁', '💎'];

// --- Local storage ---
export const BEST_SCORE_KEY = 'memoryMatchChallenge.bestScore';

// --- Color palette ---
export const COLORS = {
  bgTop: 0x1b1b32,
  bgBottom: 0x2d2b52,
  cardBackTop: 0x4a4e8f,
  cardBackBottom: 0x2f3268,
  cardBackBorder: 0xffd166,
  cardFrontTop: 0xfdfdfd,
  cardFrontBottom: 0xeceaf5,
  cardMatchedGlow: 0x06d6a0,
  accentGold: 0xffd166,
  accentGreen: 0x06d6a0,
  accentRed: 0xef476f,
  accentBlue: 0x4cc9f0,
  textLight: '#ffffff',
  textMuted: '#c9c9e0',
  buttonPrimary: 0x06d6a0,
  buttonPrimaryHover: 0x08f0b4,
  buttonSecondary: 0x4a4e8f,
  buttonSecondaryHover: 0x5c60ab
};

// --- Texture keys (generated procedurally at Preload time, no binary files needed) ---
export const TEXTURES = {
  cardBack: 'tex-card-back',
  cardFront: 'tex-card-front',
  particle: 'tex-particle',
  gemIcon: 'tex-gem-icon-base64'
};

// The one card symbol whose face is rendered from the embedded base64 PNG
// (src/assets/embeddedGemIcon.js) instead of emoji text.
export const EMBEDDED_ICON_SYMBOL = '💎';

// --- Scene keys ---
export const SCENES = {
  BOOT: 'Boot',
  PRELOAD: 'Preload',
  MENU: 'Menu',
  GAME: 'Game',
  UI: 'UI',
  RESULT: 'Result'
};

// --- Global event names (emitted on the game-wide event bus: game.events) ---
export const EVENTS = {
  UPDATE_SCORE: 'update-score',
  UPDATE_MOVES: 'update-moves',
  UPDATE_PAIRS: 'update-pairs',
  UPDATE_TIMER: 'update-timer'
};
