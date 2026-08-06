import { BEST_SCORE_KEY, SCORE_PER_MATCH } from '../utils/Constants.js';

/**
 * ScoreManager
 *
 * Tracks the mutable state of a single play-through: score, moves,
 * and pairs found. Also exposes static helpers for persisting the
 * best score across sessions using Local Storage.
 */
export default class ScoreManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.score = 0;
    this.moves = 0;
    this.pairsFound = 0;
  }

  /** Call when two flipped cards turn out to match. */
  registerMatch() {
    this.score += SCORE_PER_MATCH;
    this.pairsFound += 1;
  }

  /** Call every time the player flips a second card (completes a move). */
  registerMove() {
    this.moves += 1;
  }

  static getBestScore() {
    const stored = Number(localStorage.getItem(BEST_SCORE_KEY));
    return Number.isFinite(stored) ? stored : 0;
  }

  static saveBestScore(score) {
    if (score > ScoreManager.getBestScore()) {
      localStorage.setItem(BEST_SCORE_KEY, String(score));
    }
  }
}
