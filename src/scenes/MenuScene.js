import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/Constants.js';
import ScoreManager from '../managers/ScoreManager.js';

/**
 * MenuScene
 *
 * The main menu: title, instructions, best score and the Play button
 * that kicks off a new game.
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MENU);
  }

  create() {
    this._drawBackground();
    this.cameras.main.fadeIn(300, 0, 0, 0);

    this.add
      .text(GAME_WIDTH / 2, 130, 'Memory Match Challenge', {
        fontSize: '44px',
        fontStyle: 'bold',
        color: COLORS.textLight
      })
      .setOrigin(0.5)
      .setShadow(0, 4, 'rgba(0,0,0,0.4)', 6);

    const title2 = this.add
      .text(GAME_WIDTH / 2, 178, 'Flip. Match. Beat the clock.', {
        fontSize: '18px',
        color: COLORS.textMuted
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: title2,
      alpha: { from: 0.4, to: 1 },
      duration: 1400,
      yoyo: true,
      repeat: -1
    });

    this._drawInstructions();
    this._drawBestScore();
    this._createButton(GAME_WIDTH / 2, 560, 'Play', () => this._startGame());
  }

  _drawBackground() {
    const g = this.add.graphics();
    g.fillGradientStyle(COLORS.bgTop, COLORS.bgTop, COLORS.bgBottom, COLORS.bgBottom, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  _drawInstructions() {
    const panelWidth = 560;
    const panelHeight = 190;
    const panelX = GAME_WIDTH / 2 - panelWidth / 2;
    const panelY = 240;

    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.06);
    g.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);
    g.lineStyle(2, 0xffffff, 0.12);
    g.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);

    this.add
      .text(GAME_WIDTH / 2, panelY + 26, 'How to Play', {
        fontSize: '20px',
        fontStyle: 'bold',
        color: COLORS.accentGold
      })
      .setOrigin(0.5);

    const lines = [
      'Match every pair of cards before time runs out.',
      'Click two cards to reveal them.',
      'Matching cards stay open.',
      'Non-matching cards flip back.'
    ];

    this.add.text(panelX + 40, panelY + 62, lines.join('\n'), {
      fontSize: '16px',
      color: COLORS.textMuted,
      lineSpacing: 12
    });
  }

  _drawBestScore() {
    const best = ScoreManager.getBestScore();

    this.add
      .text(GAME_WIDTH / 2, 470, `Best Score: ${best}`, {
        fontSize: '20px',
        fontStyle: 'bold',
        color: COLORS.textLight
      })
      .setOrigin(0.5);
  }

  /**
   * Creates a reusable rounded rectangle button with hover/click feedback.
   */
  _createButton(x, y, label, onClick) {
    const width = 220;
    const height = 64;

    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    const drawBg = (color) => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 18);
    };
    drawBg(COLORS.buttonPrimary);

    const text = this.add
      .text(0, 0, label, { fontSize: '24px', fontStyle: 'bold', color: '#0e2b22' })
      .setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      drawBg(COLORS.buttonPrimaryHover);
      this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 120, ease: 'Sine.easeOut' });
    });

    container.on('pointerout', () => {
      drawBg(COLORS.buttonPrimary);
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 120, ease: 'Sine.easeOut' });
    });

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 80,
        yoyo: true,
        onComplete: onClick
      });
    });

    return container;
  }

  _startGame() {
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENES.GAME);
    });
  }
}
