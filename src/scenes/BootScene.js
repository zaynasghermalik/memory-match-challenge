import Phaser from 'phaser';
import { SCENES } from '../utils/Constants.js';

/**
 * BootScene
 *
 * The very first scene to run. Configures engine-wide settings that must
 * be ready before anything else loads, then hands off to PreloadScene.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  create() {
    this.scale.refresh();
    this.scene.start(SCENES.PRELOAD);
  }
}
