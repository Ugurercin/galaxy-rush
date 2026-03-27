class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicBus = null;
    this.sfxBus = null;

    this.ready = false;
    this.muted = false;
    this.musicMuted = false;

    this.currentMusic = null;
    this.desiredMusic = null;

    this.sounds = {};
    this._switchToken = 0;

    this._initContext();
  }

  _initContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn('[Sound] Web Audio not supported');
        return;
      }

      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);

      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.25;
      this.musicBus.connect(this.masterGain);

      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 1.0;
      this.sfxBus.connect(this.masterGain);

      this.ready = true;
    } catch (e) {
      console.warn('[Sound] Init failed:', e);
    }
  }

  resume() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  register(key, instance) {
    this.sounds[key] = instance;
  }

  play(key) {
    if (!this.ready || this.muted) return;
    const s = this.sounds[key];
    if (!s || typeof s.play !== 'function') return;
    s.play(this.ctx, this.sfxBus);
  }

  setMusic(key, { fadeDuration = 600, force = false } = {}) {
    if (!key) return;

    this.desiredMusic = key;

    if (!this.ready || this.muted || this.musicMuted) return;
    if (!force && this.currentMusic === key) return;

    this._doSwitch(key, fadeDuration);
  }

  startMusic(key) {
    this.setMusic(key || this.desiredMusic || 'music', {
      fadeDuration: 0,
      force: false,
    });
  }

  switchMusic(newKey, fadeDuration = 600) {
    this.setMusic(newKey, { fadeDuration, force: false });
  }

  _doSwitch(newKey, fadeDuration = 600) {
    const switchToken = ++this._switchToken;

    const outKey = this.currentMusic;
    const outSound = outKey ? this.sounds[outKey] : null;
    const newSound = this.sounds[newKey];

    if (!newSound || typeof newSound.start !== 'function') return;

    if (!outSound || fadeDuration <= 0) {
      if (outSound && typeof outSound.stop === 'function') {
        outSound.stop();
      }

      this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicBus.gain.setValueAtTime(0.25, this.ctx.currentTime);

      newSound.start(this.ctx, this.musicBus);
      this.currentMusic = newKey;
      return;
    }

    const now = this.ctx.currentTime;
    const fadeOut = fadeDuration / 1000;

    this.musicBus.gain.cancelScheduledValues(now);
    this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, now);
    this.musicBus.gain.linearRampToValueAtTime(0, now + fadeOut);

    setTimeout(() => {
      if (switchToken !== this._switchToken) return;
      if (!this.ready || this.muted || this.musicMuted) return;

      if (outSound && typeof outSound.stop === 'function') {
        outSound.stop();
      }

      const finalKey = this.desiredMusic || newKey;
      const finalSound = this.sounds[finalKey];
      if (!finalSound || typeof finalSound.start !== 'function') return;

      const t = this.ctx.currentTime;
      this.musicBus.gain.cancelScheduledValues(t);
      this.musicBus.gain.setValueAtTime(0, t);

      finalSound.start(this.ctx, this.musicBus);
      this.currentMusic = finalKey;

      this.musicBus.gain.linearRampToValueAtTime(0.25, t + Math.max(0.05, fadeOut * 0.5));
    }, fadeDuration);
  }

  stopMusic({ keepDesired = true } = {}) {
    if (this.currentMusic) {
      const s = this.sounds[this.currentMusic];
      if (s && typeof s.stop === 'function') s.stop();
    }

    this.currentMusic = null;

    if (!keepDesired) {
      this.desiredMusic = null;
    }

    if (this.musicBus && this.ctx) {
      this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicBus.gain.setValueAtTime(0.25, this.ctx.currentTime);
    }
  }

  setMasterVolume(val) {
    if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, val));
  }

  setMusicVolume(val) {
    if (this.musicBus) this.musicBus.gain.value = Math.max(0, Math.min(1, val));
  }

  setSFXVolume(val) {
    if (this.sfxBus) this.sfxBus.gain.value = Math.max(0, Math.min(1, val));
  }

  toggleMute() {
    this.muted = !this.muted;

    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 0.8;
    }

    if (!this.muted && !this.musicMuted && this.desiredMusic && this.currentMusic !== this.desiredMusic) {
      this.setMusic(this.desiredMusic, { fadeDuration: 0, force: true });
    }

    return this.muted;
  }

  toggleMusic() {
    this.musicMuted = !this.musicMuted;

    if (this.musicMuted) {
      this.stopMusic({ keepDesired: true });
    } else if (!this.muted) {
      this.setMusic(this.desiredMusic || 'music', { fadeDuration: 0, force: true });
    }

    return this.musicMuted;
  }
}

window.soundManager = new SoundManager();