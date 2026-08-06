import Phaser from 'phaser';
import { SCENES, EVENTS, GAME_WIDTH, TOTAL_PAIRS, TIMER_DURATION, COLORS } from '../utils/Constants.js';

/**
 * UIScene
 *
 * Runs in parallel with GameScene and renders the HUD: timer, moves,
 * score, pairs found, and the Restart / Back to Menu controls. Stats
 * arrive via the game-wide event bus so this scene never has to reach
 * into GameScene's internals directly.
 */
export default class UIScene extends Phaser.Scene {
  constructor() {
    super(SCENES.UI);
  }

  create() {
    this._drawBar();

    this.timerText = this._createStat(120, 'TIME', `${TIMER_DURATION}`);
    this.scoreText = this._createStat(320, 'SCORE', '0');
    this.movesText = this._createStat(520, 'MOVES', '0');
    this.pairsText = this._createStat(720, 'PAIRS', `0 / ${TOTAL_PAIRS}`);

    this._createIconButton(GAME_WIDTH - 130, 60, 'Restart', () => this._restartGame());
    this._createIconButton(GAME_WIDTH - 40, 60, 'Menu', () => this._backToMenu());

    this._onScore = (score) => this.scoreText.setText(`${score}`);
    this._onMoves = (moves) => this.movesText.setText(`${moves}`);
    this._onPairs = (pairs) => this.pairsText.setText(`${pairs} / ${TOTAL_PAIRS}`);
    this._onTimer = (remaining) => {
      this.timerText.setText(`${remaining}`);
      this.timerText.setColor(remaining <= 10 ? '#ef476f' : COLORS.textLight);
    };

    this.game.events.on(EVENTS.UPDATE_SCORE, this._onScore);
    this.game.events.on(EVENTS.UPDATE_MOVES, this._onMoves);
    this.game.events.on(EVENTS.UPDATE_PAIRS, this._onPairs);
    this.game.events.on(EVENTS.UPDATE_TIMER, this._onTimer);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this._cleanup, this);
  }

  _drawBar() {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.25);
    g.fillRect(0, 0, GAME_WIDTH, 100);
    g.lineStyle(2, 0xffffff, 0.08);
    g.lineBetween(0, 100, GAME_WIDTH, 100);
  }

  _createStat(x, label, value) {
    this.add
      .text(x, 32, label, { fontSize: '13px', color: COLORS.textMuted, fontStyle: 'bold' })
      .setOrigin(0.5);

    return this.add
      .text(x, 58, value, { fontSize: '26px', color: COLORS.textLight, fontStyle: 'bold' })
      .setOrigin(0.5);
  }

  _createIconButton(x, y, label, onClick) {
    const width = 92;
    const height = 40;

    const container = this.add.container(x, y);
    const bg = this.add.graphics();

    const drawBg = (color) => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    };
    drawBg(COLORS.buttonSecondary);

    const text = this.add
      .text(0, 0, label, { fontSize: '14px', fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      drawBg(COLORS.buttonSecondaryHover);
      this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 120 });
    });

    container.on('pointerout', () => {
      drawBg(COLORS.buttonSecondary);
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 120 });
    });

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.94,
        scaleY: 0.94,
        duration: 80,
        yoyo: true,
        onComplete: onClick
      });
    });

    return container;
  }

  _restartGame() {
    this.scene.stop(SCENES.UI);
    this.scene.stop(SCENES.GAME);
    this.scene.start(SCENES.GAME);
  }

  _backToMenu() {
    this.scene.stop(SCENES.UI);
    this.scene.stop(SCENES.GAME);
    this.scene.start(SCENES.MENU);
  }

  _cleanup() {
    this.game.events.off(EVENTS.UPDATE_SCORE, this._onScore);
    this.game.events.off(EVENTS.UPDATE_MOVES, this._onMoves);
    this.game.events.off(EVENTS.UPDATE_PAIRS, this._onPairs);
    this.game.events.off(EVENTS.UPDATE_TIMER, this._onTimer);
  }
}
