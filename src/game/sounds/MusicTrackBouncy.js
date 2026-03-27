const MusicTrackBouncy = {
  _playing: false,
  _ctx: null,
  _bus: null,
  _master: null,
  _delay: null,
  _lookaheadTimer: null,
  _nextNoteTime: 0,
  _step: 0,

  currentWave: 1,
  intensityTier: 0,
  baseTempo: 154,
  maxTier: 8,

  tempo: 154,
  swing: 0.11,
  masterGain: 0.85,

  melodyPattern: [
    293.66, 392.00, 349.23, 392.00,
    440.00, 392.00, 349.23, 329.63,
    293.66, 392.00, 523.25, 392.00,
    440.00, 349.23, 329.63, 293.66,
  ],

  bassPattern: [
    73.42, 73.42, 98.00, 98.00,
    87.31, 87.31, 82.41, 82.41,
    73.42, 73.42, 110.00, 110.00,
    87.31, 87.31, 82.41, 82.41,
  ],

  start(ctx, bus) {
    if (this._playing) return;
    this._playing = true;
    this._ctx = ctx;
    this._bus = bus;

    this._buildFxChain();
    this.setWave(this.currentWave || 1);

    this._step = 0;
    this._nextNoteTime = ctx.currentTime + 0.05;
    this._scheduler();
  },

  stop() {
    this._playing = false;
    if (this._lookaheadTimer) {
      clearTimeout(this._lookaheadTimer);
      this._lookaheadTimer = null;
    }

    if (this._master && this._ctx) {
      try {
        this._master.gain.cancelScheduledValues(this._ctx.currentTime);
        this._master.gain.setTargetAtTime(0.0001, this._ctx.currentTime, 0.05);
      } catch (e) {}
    }

    this._ctx = null;
    this._bus = null;
    this._master = null;
    this._delay = null;
  },

  setWave(wave) {
    this.currentWave = Math.max(1, wave | 0);
    this.intensityTier = Math.min(this.maxTier, Math.floor(this.currentWave / 10));
    this.tempo = this.baseTempo + this.intensityTier * 5;
  },

  _buildFxChain() {
    const ctx = this._ctx;

    this._master = ctx.createGain();
    this._master.gain.value = this.masterGain;

    this._delay = ctx.createDelay();
    this._delay.delayTime.value = 0.14;

    const feedback = ctx.createGain();
    feedback.gain.value = 0.22;

    this._master.connect(this._bus);
    this._master.connect(this._delay);
    this._delay.connect(feedback);
    feedback.connect(this._delay);
    this._delay.connect(this._bus);
  },

  _scheduler() {
    if (!this._playing || !this._ctx) return;

    const ctx = this._ctx;
    const scheduleAheadTime = 0.12;
    const stepDur = 60 / this.tempo / 2;

    while (this._nextNoteTime < ctx.currentTime + scheduleAheadTime) {
      this._scheduleStep(this._step, this._nextNoteTime);

      let swingOffset = 0;
      if (this._step % 2 === 1) swingOffset = stepDur * this.swing;

      this._nextNoteTime += stepDur + swingOffset;
      this._step++;
    }

    this._lookaheadTimer = setTimeout(() => this._scheduler(), 25);
  },

  _scheduleStep(step, time) {
    const melodyFreq = this.melodyPattern[step % this.melodyPattern.length];
    const bassFreq = this.bassPattern[step % this.bassPattern.length];
    const tier = this.intensityTier;

    this._playPluck(melodyFreq, time);

    if (step % 4 === 0) this._playBoingBass(bassFreq, time);
    if (step % 2 === 1) this._playTick(time, 1);
    if (tier >= 2 && step % 8 === 4) this._playBubble(time);
    if (tier >= 4 && step % 4 === 2) this._playTick(time, 0.7);
  },

  _playPluck(freq, time) {
    const ctx = this._ctx;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, time + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.05, time + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.13);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1400;
    filter.Q.value = 2.5;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this._master);

    osc.start(time);
    osc.stop(time + 0.14);
  },

  _playBoingBass(freq, time) {
    const ctx = this._ctx;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 1.3, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.08);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.08, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 1.8;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this._master);

    osc.start(time);
    osc.stop(time + 0.24);
  },

  _playTick(time, amp = 1) {
    const ctx = this._ctx;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1800, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.02 * amp, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.018);

    osc.connect(gain);
    gain.connect(this._master);

    osc.start(time);
    osc.stop(time + 0.02);
  },

  _playBubble(time) {
    const ctx = this._ctx;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, time);
    osc.frequency.exponentialRampToValueAtTime(760, time + 0.05);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.03, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    osc.connect(gain);
    gain.connect(this._master);

    osc.start(time);
    osc.stop(time + 0.07);
  },
};