import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';
import BootScene from '../scenes/BootScene.js';
import PreloadScene from '../scenes/PreloadScene.js';
import MenuScene from '../scenes/MenuScene.js';
import GameScene from '../scenes/GameScene.js';
import UIScene from '../scenes/UIScene.js';
import ResultScene from '../scenes/ResultScene.js';

/**
 * Central Phaser game configuration. Scale.FIT keeps the aspect ratio
 * intact while scaling to fill the available space, and autoCenter
 * keeps the canvas centered on any screen size (desktop, tablet, mobile).
 */
const gameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#1b1b32',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, UIScene, ResultScene]
};

export default gameConfig;
