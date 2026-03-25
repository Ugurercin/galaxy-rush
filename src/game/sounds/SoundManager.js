class SoundManager {
  constructor() {
    this.ctx           = null;
    this.masterGain    = null;
    this.musicBus      = null;
    this.sfxBus        = null;
    this.ready         = false;
    this.muted         = false;
    this.musicMuted    = false;
    this.currentMusic  = null;
    this.sounds        = {};
    this._initContext();
  }

  _initContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) { console.warn('[Sound] Web Audio not supported'); return; }
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

  // ── Must call on first user tap — iOS/Android requirement ─
  resume() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  register(key, instance) { this.sounds[key] = instance; }

  play(key) {
    if (!this.ready || this.muted) return;
    const s = this.sounds[key];
    if (!s) return;
    s.play(this.ctx, this.sfxBus);
  }

  // ── Start a named music track ──────────────────────────
  startMusic(key) {
    if (!this.ready || this.musicMuted) return;
    const track = key || 'music';
    if (this.currentMusic === track) return;
    const s = this.sounds[track];
    if (!s) return;
    s.start(this.ctx, this.musicBus);
    this.currentMusic = track;
  }

  // ── Crossfade to a different track ────────────────────
  switchMusic(newKey, fadeDuration = 600) {
    if (!this.ready || this.musicMuted) return;
    if (this.currentMusic === newKey) return;

    const outKey   = this.currentMusic;
    const outSound = outKey ? this.sounds[outKey] : null;

    if (outSound) {
      const now     = this.ctx.currentTime;
      const fadeOut = fadeDuration / 1000;
      this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, now);
      this.musicBus.gain.linearRampToValueAtTime(0, now + fadeOut);

      setTimeout(() => {
        outSound.stop();
        if (!this.ready) return;
        this.musicBus.gain.setValueAtTime(0, this.ctx.currentTime);
        this.musicBus.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + fadeOut * 0.5);
        const newSound = this.sounds[newKey];
        if (newSound) {
          newSound.start(this.ctx, this.musicBus);
          this.currentMusic = newKey;
        }
      }, fadeDuration);
    } else {
      this.startMusic(newKey);
    }
  }

  stopMusic() {
    if (!this.currentMusic) return;
    const s = this.sounds[this.currentMusic];
    if (s) s.stop();
    this.currentMusic = null;
    if (this.musicBus) {
      this.musicBus.gain.setValueAtTime(0.25, this.ctx.currentTime);
    }
  }

  setMasterVolume(val) { if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, val)); }
  setMusicVolume(val)  { if (this.musicBus)   this.musicBus.gain.value   = Math.max(0, Math.min(1, val)); }
  setSFXVolume(val)    { if (this.sfxBus)      this.sfxBus.gain.value     = Math.max(0, Math.min(1, val)); }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : 0.8;
    return this.muted;
  }

  toggleMusic() {
    this.musicMuted = !this.musicMuted;
    if (this.musicMuted) { this.stopMusic(); }
    else { this.startMusic(this.currentMusic || 'music'); }
    return this.musicMuted;
  }
}

const soundManager = new SoundManager();