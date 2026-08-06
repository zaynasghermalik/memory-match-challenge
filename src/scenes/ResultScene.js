import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXTURES } from '../utils/Constants.js';
import AudioManager from '../managers/AudioManager.js';
import ScoreManager from '../managers/ScoreManager.js';

/**
 * ResultScene
 *
 * Shown after a game ends, either in victory or defeat. Displays the
 * relevant stats, persists the best score, plays a matching animation
 * and sound, and offers Play Again / Main Menu navigation.
 */
export default class ResultScene extends Phaser.Scene {
  constructor() {
    super(SCENES.RESULT);
  }

  init(data) {
    this.resultData = data;
  }

  create() {
    const { win, score } = this.resultData;

    ScoreManager.saveBestScore(score);

    this.audioManager = new AudioManager(this);
    this._drawBackground(win);
    this.cameras.main.fadeIn(300, 0, 0, 0);

    this._showTitle(win);
    this._showStats(win);

    this._createButton(GAME_WIDTH / 2 - 130, 560, 'Play Again', COLORS.buttonPrimary, COLORS.buttonPrimaryHover, () =>
      this._playAgain()
    );
    this._createButton(GAME_WIDTH / 2 + 130, 560, 'Main Menu', COLORS.buttonSecondary, COLORS.buttonSecondaryHover, () =>
      this._mainMenu()
    );

    if (win) {
      this.audioManager.playVictory();
      this._playVictoryParticles();
    } else {
      this.audioManager.playGameOver();
      this._playGameOverShake();
    }
  }

  _drawBackground(win) {
    const g = this.add.graphics();
    const top = win ? 0x123a2e : 0x2a1420;
    const bottom = win ? COLORS.bgBottom : 0x1b1b32;
    g.fillGradientStyle(top, top, bottom, bottom, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  _showTitle(win) {
    const title = this.add
      .text(GAME_WIDTH / 2, 160, win ? 'You Win!' : 'Game Over', {
        fontSize: '56px',
        fontStyle: 'bold',
        color: win ? '#06d6a0' : '#ef476f'
      })
      .setOrigin(0.5)
      .setScale(0.3)
      .setAlpha(0);

    this.tweens.add({
      targets: title,
      scale: 1,
      alpha: 1,
      duration: 450,
      ease: 'Back.easeOut'
    });
  }

  _showStats(win) {
    const { score, moves, pairsFound, totalPairs, timeRemaining } = this.resultData;

    const rows = win
      ? [
          ['Final Score', `${score}`],
          ['Moves', `${moves}`],
          ['Time Remaining', `${timeRemaining}s`]
        ]
      : [
          ['Pairs Found', `${pairsFound} / ${totalPairs}`],
          ['Final Score', `${score}`],
          ['Moves', `${moves}`]
        ];

    const panelWidth = 420;
    const panelHeight = 200;
    const panelX = GAME_WIDTH / 2 - panelWidth / 2;
    const panelY = 250;

    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.06);
    g.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 18);
    g.lineStyle(2, 0xffffff, 0.12);
    g.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 18);

    rows.forEach(([label, value], i) => {
      const rowY = panelY + 40 + i * 48;

      this.add.text(panelX + 40, rowY, label, {
        fontSize: '18px',
        color: COLORS.textMuted
      });

      this.add
        .text(panelX + panelWidth - 40, rowY, value, {
          fontSize: '20px',
          fontStyle: 'bold',
          color: COLORS.textLight
        })
        .setOrigin(1, 0);
    });

    const best = ScoreManager.getBestScore();
    this.add
      .text(GAME_WIDTH / 2, panelY + panelHeight + 26, `Best Score: ${best}`, {
        fontSize: '16px',
        color: COLORS.accentGold,
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
  }

  _playVictoryParticles() {
    const emitter = this.add.particles(GAME_WIDTH / 2, -20, TEXTURES.particle, {
      x: { min: 0, max: GAME_WIDTH },
      y: 0,
      lifespan: 2200,
      speedY: { min: 120, max: 260 },
      speedX: { min: -40, max: 40 },
      scale: { start: 1.2, end: 0.2 },
      tint: [0x06d6a0, 0xffd166, 0x4cc9f0, 0xef476f],
      quantity: 3,
      frequency: 60,
      emitting: true
    });

    this.time.delayedCall(1800, () => emitter.stop());
    this.time.delayedCall(4000, () => emitter.destroy());
  }

  _playGameOverShake() {
    this.cameras.main.shake(300, 0.006);
  }

  _createButton(x, y, label, color, hoverColor, onClick) {
    const width = 200;
    const height = 58;

    const container = this.add.container(x, y);
    const bg = this.add.graphics();

    const drawBg = (c) => {
      bg.clear();
      bg.fillStyle(c, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 16);
    };
    drawBg(color);

    const text = this.add
      .text(0, 0, label, { fontSize: '18px', fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      drawBg(hoverColor);
      this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 120 });
    });

    container.on('pointerout', () => {
      drawBg(color);
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 120 });
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

  _playAgain() {
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENES.GAME);
    });
  }

  _mainMenu() {
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENES.MENU);
    });
  }
}
