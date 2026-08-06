/**
 * AudioManager
 *
 * Generates every sound effect procedurally using the Web Audio API
 * (via the AudioContext that Phaser's sound manager already owns).
 * This keeps the game 100% self-contained with zero binary audio
 * files to download, while still satisfying "lightweight assets".
 */
export default class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.context = scene.sound && scene.sound.context ? scene.sound.context : null;
  }

  /**
   * Plays a single tone with an exponential decay envelope.
   * @private
   */
  _playTone({ frequency, duration = 0.15, type = 'sine', volume = 0.25, delay = 0, frequencyEnd = null }) {
    if (!this.context) return;

    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    const startTime = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    if (frequencyEnd) {
      oscillator.frequency.exponentialRampToValueAtTime(frequencyEnd, startTime + duration);
    }

    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  /** Short, soft click for flipping a card. */
  playFlip() {
    this._playTone({ frequency: 420, duration: 0.1, type: 'triangle', volume: 0.18 });
  }

  /** Bright two-note chime for a successful match. */
  playMatch() {
    this._playTone({ frequency: 660, duration: 0.14, type: 'sine', volume: 0.22 });
    this._playTone({ frequency: 880, duration: 0.18, type: 'sine', volume: 0.22, delay: 0.1 });
  }

  /** Ascending fanfare for winning the game. */
  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((frequency, index) => {
      this._playTone({ frequency, duration: 0.22, type: 'triangle', volume: 0.25, delay: index * 0.12 });
    });
  }

  /** Descending tone for a game-over / time-out. */
  playGameOver() {
    const notes = [392, 329.63, 261.63, 196];
    notes.forEach((frequency, index) => {
      this._playTone({ frequency, duration: 0.28, type: 'sawtooth', volume: 0.18, delay: index * 0.14 });
    });
  }
}
