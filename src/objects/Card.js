import Phaser from 'phaser';
import { CARD_WIDTH, CARD_HEIGHT, TEXTURES, EMBEDDED_ICON_SYMBOL } from '../utils/Constants.js';

/**
 * Card
 *
 * A single memory-match card. Encapsulates its own visuals (back image,
 * front image, icon) and animations (flip, hover, matched pulse),
 * exposing a small state machine (`isFlipped`, `isMatched`, `isAnimating`)
 * that GameScene reads before allowing interaction. Every icon is emoji
 * text except EMBEDDED_ICON_SYMBOL, which renders the one base64-embedded
 * PNG asset (see src/assets/embeddedGemIcon.js) as a real Image instead.
 */
export default class Card extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} symbol - the emoji this card represents
   * @param {number} cardIndex - this card's unique position index on the board
   */
  constructor(scene, x, y, symbol, cardIndex) {
    super(scene, x, y);

    this.symbol = symbol;
    this.cardIndex = cardIndex;
    this.isFlipped = false;
    this.isMatched = false;
    this.isAnimating = false;

    this.back = scene.add.image(0, 0, TEXTURES.cardBack).setDisplaySize(CARD_WIDTH, CARD_HEIGHT);

    this.front = scene.add
      .image(0, 0, TEXTURES.cardFront)
      .setDisplaySize(CARD_WIDTH, CARD_HEIGHT)
      .setVisible(false);

    this.icon =
      symbol === EMBEDDED_ICON_SYMBOL && scene.textures.exists(TEXTURES.gemIcon)
        ? scene.add.image(0, 0, TEXTURES.gemIcon).setDisplaySize(64, 64).setVisible(false)
        : scene.add.text(0, 0, symbol, { fontSize: '58px' }).setOrigin(0.5).setVisible(false);

    this.add([this.back, this.front, this.icon]);

    this.setSize(CARD_WIDTH, CARD_HEIGHT);
    this.setInteractive({ useHandCursor: true });

    this.on('pointerover', this._onHoverIn, this);
    this.on('pointerout', this._onHoverOut, this);

    scene.add.existing(this);
  }

  _onHoverIn() {
    if (this.isFlipped || this.isMatched || this.isAnimating) return;

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 150,
      ease: 'Sine.easeOut'
    });
  }

  _onHoverOut() {
    if (this.isFlipped || this.isMatched || this.isAnimating) return;

    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 150,
      ease: 'Sine.easeOut'
    });
  }

  /**
   * Flips the card face-up, revealing its symbol.
   * @param {Function} [onComplete]
   */
  flipUp(onComplete) {
    if (this.isFlipped || this.isAnimating) return;

    this.isAnimating = true;
    this.isFlipped = true;

    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: 130,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.back.setVisible(false);
        this.front.setVisible(true);
        this.icon.setVisible(true);

        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          duration: 130,
          ease: 'Sine.easeOut',
          onComplete: () => {
            this.isAnimating = false;
            if (onComplete) onComplete();
          }
        });
      }
    });
  }

  /**
   * Flips the card back face-down.
   * @param {Function} [onComplete]
   */
  flipDown(onComplete) {
    if (!this.isFlipped || this.isAnimating) return;

    this.isAnimating = true;

    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: 130,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.front.setVisible(false);
        this.icon.setVisible(false);
        this.back.setVisible(true);
        this.isFlipped = false;

        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          duration: 130,
          ease: 'Sine.easeOut',
          onComplete: () => {
            this.isAnimating = false;
            if (onComplete) onComplete();
          }
        });
      }
    });
  }

  /** Plays a celebratory pulse once a pair has been matched, then locks the card. */
  showMatched() {
    this.isMatched = true;
    this.disableInteractive();

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.18,
      scaleY: 1.18,
      duration: 180,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.setScale(1, 1);
      }
    });

    this.scene.tweens.add({
      targets: this.front,
      alpha: { from: 1, to: 0.75 },
      duration: 180,
      yoyo: true,
      repeat: 1
    });
  }

  /** Resets the card to its initial face-down, unmatched state. */
  reset() {
    this.isFlipped = false;
    this.isMatched = false;
    this.isAnimating = false;
    this.setScale(1, 1);
    this.back.setVisible(true);
    this.front.setVisible(false).setAlpha(1);
    this.icon.setVisible(false);
    this.setInteractive({ useHandCursor: true });
  }
}
