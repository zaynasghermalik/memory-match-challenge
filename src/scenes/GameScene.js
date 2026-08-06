import Phaser from 'phaser';
import {
  SCENES,
  EVENTS,
  GAME_WIDTH,
  GRID_ROWS,
  GRID_COLS,
  TOTAL_PAIRS,
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_GAP,
  BOARD_TOP_OFFSET,
  BOARD_BOTTOM_MARGIN,
  GAME_HEIGHT,
  TIMER_DURATION,
  MISMATCH_DELAY,
  CARD_SYMBOLS,
  COLORS
} from '../utils/Constants.js';
import { shuffleArray } from '../utils/Shuffle.js';
import Card from '../objects/Card.js';
import AudioManager from '../managers/AudioManager.js';
import ScoreManager from '../managers/ScoreManager.js';
import TimerManager from '../managers/TimerManager.js';

/**
 * GameScene
 *
 * Owns the board of cards and all match/timer/score logic. Runs
 * alongside UIScene (launched in parallel) and communicates stats
 * to it through the game-wide event bus (this.game.events).
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super(SCENES.GAME);
  }

  create() {
    this.audioManager = new AudioManager(this);
    this.scoreManager = new ScoreManager();
    this.cards = [];
    this.firstCard = null;
    this.secondCard = null;
    this.canFlip = true;
    this.gameEnded = false;

    this._drawBackground();
    this._buildGrid();

    this.timerManager = new TimerManager(this, TIMER_DURATION, {
      onTick: (remaining) => this.game.events.emit(EVENTS.UPDATE_TIMER, remaining),
      onComplete: () => this._endGame(false)
    });
    this.timerManager.start();

    this.scene.launch(SCENES.UI);
    this._emitStats();

    this.cameras.main.fadeIn(300, 0, 0, 0);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this._cleanup, this);
  }

  _drawBackground() {
    const g = this.add.graphics();
    g.fillGradientStyle(COLORS.bgTop, COLORS.bgTop, COLORS.bgBottom, COLORS.bgBottom, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  _buildGrid() {
    const symbols = shuffleArray([...CARD_SYMBOLS, ...CARD_SYMBOLS]);

    const gridWidth = GRID_COLS * CARD_WIDTH + (GRID_COLS - 1) * CARD_GAP;
    const gridHeight = GRID_ROWS * CARD_HEIGHT + (GRID_ROWS - 1) * CARD_GAP;

    const startX = (GAME_WIDTH - gridWidth) / 2 + CARD_WIDTH / 2;
    const availableHeight = GAME_HEIGHT - BOARD_TOP_OFFSET - BOARD_BOTTOM_MARGIN;
    const startY = BOARD_TOP_OFFSET + (availableHeight - gridHeight) / 2 + CARD_HEIGHT / 2;

    let index = 0;
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = startX + col * (CARD_WIDTH + CARD_GAP);
        const y = startY + row * (CARD_HEIGHT + CARD_GAP);
        const symbol = symbols[index];

        const card = new Card(this, x, y, symbol, index);
        card.on('pointerdown', () => this._handleCardClick(card));
        this.cards.push(card);
        index++;
      }
    }
  }

  _handleCardClick(card) {
    if (this.gameEnded || !this.canFlip) return;
    if (card.isFlipped || card.isMatched || card.isAnimating) return;

    this.audioManager.playFlip();

    if (!this.firstCard) {
      this.firstCard = card;
      card.flipUp();
      return;
    }

    // Lock input synchronously, the instant the second card is chosen, so a
    // third rapid click can never sneak in while the flip animation plays.
    this.secondCard = card;
    this.canFlip = false;

    card.flipUp(() => {
      this.scoreManager.registerMove();
      this.game.events.emit(EVENTS.UPDATE_MOVES, this.scoreManager.moves);
      this._resolveTurn();
    });
  }

  _resolveTurn() {
    const isMatch = this.firstCard.symbol === this.secondCard.symbol;

    if (isMatch) {
      this._handleMatch();
    } else {
      this.time.delayedCall(MISMATCH_DELAY, () => this._handleMismatch());
    }
  }

  _handleMatch() {
    this.firstCard.showMatched();
    this.secondCard.showMatched();
    this.audioManager.playMatch();

    this.scoreManager.registerMatch();
    this.game.events.emit(EVENTS.UPDATE_SCORE, this.scoreManager.score);
    this.game.events.emit(EVENTS.UPDATE_PAIRS, this.scoreManager.pairsFound);

    this.firstCard = null;
    this.secondCard = null;
    this.canFlip = true;

    if (this.scoreManager.pairsFound >= TOTAL_PAIRS) {
      this._endGame(true);
    }
  }

  _handleMismatch() {
    const first = this.firstCard;
    const second = this.secondCard;
    let flippedBack = 0;

    const onDone = () => {
      flippedBack++;
      if (flippedBack === 2) {
        this.canFlip = true;
      }
    };

    if (first) first.flipDown(onDone);
    if (second) second.flipDown(onDone);

    this.firstCard = null;
    this.secondCard = null;
  }

  _emitStats() {
    this.game.events.emit(EVENTS.UPDATE_SCORE, this.scoreManager.score);
    this.game.events.emit(EVENTS.UPDATE_MOVES, this.scoreManager.moves);
    this.game.events.emit(EVENTS.UPDATE_PAIRS, this.scoreManager.pairsFound);
    this.game.events.emit(EVENTS.UPDATE_TIMER, this.timerManager.getRemaining());
  }

  _endGame(win) {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.canFlip = false;

    this.timerManager.stop();

    if (!win) {
      this.audioManager.playGameOver();
    }

    const resultData = {
      win,
      score: this.scoreManager.score,
      moves: this.scoreManager.moves,
      pairsFound: this.scoreManager.pairsFound,
      totalPairs: TOTAL_PAIRS,
      timeRemaining: this.timerManager.getRemaining()
    };

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.stop(SCENES.UI);
      this.scene.start(SCENES.RESULT, resultData);
    });
  }

  _cleanup() {
    this.timerManager?.stop();
    this.tweens.killAll();
    this.cards.forEach((card) => card.removeAllListeners());
  }
}
