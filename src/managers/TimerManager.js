/**
 * TimerManager
 *
 * Wraps a Phaser time event to provide a simple one-second countdown
 * with tick/complete callbacks. Owns its own cleanup so scenes never
 * have to reach into scene.time directly.
 */
export default class TimerManager {
  constructor(scene, duration, { onTick, onComplete } = {}) {
    this.scene = scene;
    this.duration = duration;
    this.remaining = duration;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.timerEvent = null;
  }

  start() {
    this.remaining = this.duration;
    this.timerEvent = this.scene.time.addEvent({
      delay: 1000,
      callback: this._tick,
      callbackScope: this,
      loop: true
    });
  }

  _tick() {
    this.remaining = Math.max(0, this.remaining - 1);

    if (this.onTick) {
      this.onTick(this.remaining);
    }

    if (this.remaining <= 0) {
      this.stop();
      if (this.onComplete) {
        this.onComplete();
      }
    }
  }

  pause() {
    if (this.timerEvent) {
      this.timerEvent.paused = true;
    }
  }

  resume() {
    if (this.timerEvent) {
      this.timerEvent.paused = false;
    }
  }

  stop() {
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }
  }

  getRemaining() {
    return this.remaining;
  }
}
