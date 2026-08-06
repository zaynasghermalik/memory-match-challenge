import Phaser from 'phaser';
import {
  SCENES,
  TEXTURES,
  GAME_WIDTH,
  GAME_HEIGHT,
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_CORNER_RADIUS,
  COLORS
} from '../utils/Constants.js';
import { GEM_ICON_BASE64 } from '../assets/embeddedGemIcon.js';

/**
 * PreloadScene
 *
 * Most visuals need no external binary assets — card backs, card fronts,
 * and particles are drawn procedurally with the Graphics API and baked
 * into reusable textures via generateTexture(). One real asset (a gem
 * icon) is loaded from an embedded base64 string via addBase64() to
 * satisfy the assessment's explicit base64-asset requirement. Both
 * approaches avoid any network/file-loading failure point.
 *
 * A short animated progress bar is still shown for a polished feel, and
 * the transition to the menu waits for the base64 texture to finish
 * decoding (addBase64 is asynchronous) so it's guaranteed ready before
 * any card tries to use it.
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PRELOAD);
  }

  create() {
    this._buildProgressUI();
    this._generateTextures();

    let tweenDone = false;
    let embeddedAssetReady = false;

    const tryProceed = () => {
      if (tweenDone && embeddedAssetReady) {
        this.time.delayedCall(150, () => this.scene.start(SCENES.MENU));
      }
    };

    this.tweens.add({
      targets: this.progressFill,
      scaleX: 1,
      duration: 500,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        tweenDone = true;
        tryProceed();
      }
    });

    this._loadEmbeddedAssets(() => {
      embeddedAssetReady = true;
      tryProceed();
    });
  }

  /**
   * Loads the one genuinely embedded binary asset: a base64-encoded PNG
   * gem icon (see src/assets/embeddedGemIcon.js). addBase64() decodes
   * asynchronously, so callers must wait for the ADD_KEY event before
   * the texture is safe to use.
   */
  _loadEmbeddedAssets(onReady) {
    this.textures.once(Phaser.Textures.Events.ADD_KEY + TEXTURES.gemIcon, onReady);
    this.textures.addBase64(TEXTURES.gemIcon, GEM_ICON_BASE64);
  }

  _buildProgressUI() {
    this.cameras.main.setBackgroundColor(COLORS.bgTop);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'Memory Match Challenge', {
        fontSize: '36px',
        fontStyle: 'bold',
        color: COLORS.textLight
      })
      .setOrigin(0.5);

    const barWidth = 360;
    const barHeight = 14;
    const barX = GAME_WIDTH / 2 - barWidth / 2;
    const barY = GAME_HEIGHT / 2;

    this.add
      .rectangle(barX, barY, barWidth, barHeight, 0x000000, 0.3)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0xffffff, 0.2);

    // Origin (0, 0.5) means scaleX grows the bar from the left edge outward.
    this.progressFill = this.add
      .rectangle(barX, barY, barWidth, barHeight, COLORS.accentGold, 1)
      .setOrigin(0, 0.5);
    this.progressFill.scaleX = 0;
  }

  _generateTextures() {
    this._generateCardBack();
    this._generateCardFront();
    this._generateParticle();
  }

  _generateCardBack() {
    const g = this.add.graphics();
    const w = CARD_WIDTH;
    const h = CARD_HEIGHT;
    const r = CARD_CORNER_RADIUS;

    // Soft drop shadow baked into the texture.
    g.fillStyle(0x000000, 0.25);
    g.fillRoundedRect(4, 6, w, h, r);

    // Gradient body.
    g.fillGradientStyle(COLORS.cardBackTop, COLORS.cardBackTop, COLORS.cardBackBottom, COLORS.cardBackBottom, 1);
    g.fillRoundedRect(0, 0, w, h, r);

    // Accent border.
    g.lineStyle(3, COLORS.cardBackBorder, 0.9);
    g.strokeRoundedRect(1.5, 1.5, w - 3, h - 3, r);

    // Inner diamond motif to suggest a card back pattern.
    g.lineStyle(2, COLORS.cardBackBorder, 0.5);
    g.strokeRoundedRect(16, 16, w - 32, h - 32, r - 6);

    g.generateTexture(TEXTURES.cardBack, w + 8, h + 8);
    g.destroy();
  }

  _generateCardFront() {
    const g = this.add.graphics();
    const w = CARD_WIDTH;
    const h = CARD_HEIGHT;
    const r = CARD_CORNER_RADIUS;

    g.fillStyle(0x000000, 0.25);
    g.fillRoundedRect(4, 6, w, h, r);

    g.fillGradientStyle(COLORS.cardFrontTop, COLORS.cardFrontTop, COLORS.cardFrontBottom, COLORS.cardFrontBottom, 1);
    g.fillRoundedRect(0, 0, w, h, r);

    g.lineStyle(3, COLORS.accentGreen, 0.6);
    g.strokeRoundedRect(1.5, 1.5, w - 3, h - 3, r);

    g.generateTexture(TEXTURES.cardFront, w + 8, h + 8);
    g.destroy();
  }

  _generateParticle() {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(6, 6, 6);
    g.generateTexture(TEXTURES.particle, 12, 12);
    g.destroy();
  }
}
