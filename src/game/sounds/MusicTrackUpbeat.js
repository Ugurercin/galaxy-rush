const MusicTrackUpbeat = {
  _playing: false,
  _ctx: null,
  _bus: null,
  _master: null,
  _compressor: null,
  _lookaheadTimer: null,
  _nextNoteTime: 0,
  _step: 0,

  currentWave: 1,
  intensityTier: 0,
  baseTempo: 162,
  maxTier: 8,

  tempo: 162,
  swing: 0.03,
  masterGain: 0.9,

  leadPattern: [
    261.63, 329.63, 392.00, 523.25,
    392.00, 329.63, 293.66, 329.63,
    261.63, 329.63, 392.00, 493.88,
    392.00, 329.63, 293.66, 261.63,
  ],

  bassPattern: [
    130.81, 130.81, 146.83, 146.83,
    164.81, 164.81, 146.83, 146.83,
    130.81, 130.81, 174.61, 174.61,
    164.81, 164.81, 146.83, 146.83,
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
        this._master.gain.setTargetAtTime(0.0001, this._ctx.currentTime, 0.04);
      } catch (e) {}
    }

    this._ctx = null;
    this._bus = null;
    this._master = null;
    this._compressor = null;
  },

  setWave(wave) {
    this.currentWave = Math.max(1, wave | 0);
    this.intensityTier = Math.min(this.maxTier, Math.floor(this.currentWave / 10));
    this.tempo = this.baseTempo + this.intensityTier * 4;

    if (!this._ctx || !this._master) return;
    const now = this._ctx.currentTime;

    this._master.gain.cancelScheduledValues(now);
    this._master.gain.setTargetAtTime(
      this.masterGain + this.intensityTier * 0.06,
      now,
      0.2
    );
  },

  _buildFxChain() {
    const ctx = this._ctx;

    this._master = ctx.createGain();
    this._master.gain.value = this.masterGain;

    this._compressor = ctx.createDynamicsCompressor();
    this._compressor.threshold.value = -18;
    this._compressor.knee.value = 18;
    this._compressor.ratio.value = 3;
    this._compressor.attack.value = 0.01;
    this._compressor.release.value = 0.15;

    this._master.connect(this._compressor);
    this._compressor.connect(this._bus);
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
    const leadFreq = this.leadPattern[step % this.leadPattern.length];
    const bassFreq = this.bassPattern[step % this.bassPattern.length];
    const tier = this.intensityTier;

    this._playLead(leadFreq, time);

    if (step % 4 === 0) this._playBass(bassFreq, time);
    if (step % 2 === 1) this._playHat(time, 1);
    if (step % 4 === 2) this._playClap(time, 0.8);
    if (tier >= 2 && step % 8 === 4) this._playLeadSparkle(leadFreq * 2, time);
    if (tier >= 4 && step % 4 === 0) this._playKick(time, 0.9);
  },

  _playLead(freq, time) {
    const ctx = this._ctx;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.06, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2200;
    filter.Q.value = 2.2;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this._master);

    osc.start(time);
    osc.stop(time + 0.15);
  },

  _playLeadSparkle(freq, time) {
    const ctx = this._ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.025, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(gain);
    gain.connect(this._master);
    osc.start(time);
    osc.stop(time + 0.09);
  },

  _playBass(freq, time) {
    const ctx = this._ctx;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.09, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;
    filter.Q.value = 1.1;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this._master);

    osc.start(time);
    osc.stop(time + 0.24);
  },

  _playKick(time, amp = 1) {
    const ctx = this._ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(48, time + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.11 * amp, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(gain);
    gain.connect(this._master);
    osc.start(time);
    osc.stop(time + 0.15);
  },

  _playClap(time, amp = 1) {
    const ctx = this._ctx;
    const bufferSize = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.9;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04 * amp, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this._master);

    noise.start(time);
    noise.stop(time + 0.05);
  },

  _playHat(time, amp = 1) {
    const ctx = this._ctx;
    const bufferSize = Math.floor(ctx.sampleRate * 0.018);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.014 * amp, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this._master);

    noise.start(time);
    noise.stop(time + 0.02);
  },
};