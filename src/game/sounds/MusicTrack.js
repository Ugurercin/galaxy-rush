// Retro space shooter background music
// Dark synthwave / arcade loop with arp + bass + delay
// Intensity rises every 10 waves: 10 / 20 / 30 / 40 / 50+

const MusicTrack = {
  _playing: false,
  _ctx: null,
  _bus: null,
  _master: null,
  _delay: null,
  _feedback: null,
  _lowpass: null,
  _timers: [],
  _lookaheadTimer: null,
  _nextNoteTime: 0,
  _step: 0,

  currentWave: 1,
  intensityTier: 0,
  baseTempo: 148,
  maxTier: 8,

  tempo: 148,
  swing: 0.08, // 0 to 0.15 feels nice
  masterGain: 3,

  // C minor vibe
  arpPattern: [
    130.81, 155.56, 174.61, 207.65,
    174.61, 233.08, 207.65, 155.56,
    130.81, 155.56, 174.61, 207.65,
    233.08, 207.65, 174.61, 155.56,
  ],

  bassPattern: [
    65.41, 65.41, 65.41, 65.41,
    77.78, 77.78, 77.78, 77.78,
    58.27, 58.27, 58.27, 58.27,
    65.41, 65.41, 65.41, 65.41,
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

    this._timers.forEach(id => clearTimeout(id));
    this._timers = [];

    if (this._master && this._ctx) {
      try {
        this._master.gain.cancelScheduledValues(this._ctx.currentTime);
        this._master.gain.setTargetAtTime(0.0001, this._ctx.currentTime, 0.03);
      } catch (e) {}
    }

    this._ctx = null;
    this._bus = null;
    this._master = null;
    this._delay = null;
    this._feedback = null;
    this._lowpass = null;
  },

  setWave(wave) {
    this.currentWave = Math.max(1, wave | 0);

    // 1-9 => 0, 10-19 => 1, 20-29 => 2, 30-39 => 3...
    this.intensityTier = Math.min(this.maxTier, Math.floor(this.currentWave / 10));
    this.tempo = this.baseTempo + this.intensityTier * 6;

    if (!this._ctx || !this._lowpass || !this._feedback || !this._master) return;

    const now = this._ctx.currentTime;

    this._lowpass.frequency.cancelScheduledValues(now);
    this._lowpass.frequency.setTargetAtTime(
      1800 + this.intensityTier * 220,
      now,
      0.2
    );

    this._feedback.gain.cancelScheduledValues(now);
    this._feedback.gain.setTargetAtTime(
      Math.min(0.5, 0.28 + this.intensityTier * 0.025),
      now,
      0.2
    );

    this._master.gain.cancelScheduledValues(now);
    this._master.gain.setTargetAtTime(
      this.masterGain + this.intensityTier * 0.12,
      now,
      0.2
    );
  },

  _buildFxChain() {
    const ctx = this._ctx;

    this._master = ctx.createGain();
    this._master.gain.value = this.masterGain;

    this._lowpass = ctx.createBiquadFilter();
    this._lowpass.type = 'lowpass';
    this._lowpass.frequency.value = 1800;
    this._lowpass.Q.value = 0.8;

    this._delay = ctx.createDelay();
    this._delay.delayTime.value = 0.22;

    this._feedback = ctx.createGain();
    this._feedback.gain.value = 0.28;

    // dry
    this._lowpass.connect(this._master);
    this._master.connect(this._bus);

    // delay loop
    this._lowpass.connect(this._delay);
    this._delay.connect(this._feedback);
    this._feedback.connect(this._delay);
    this._delay.connect(this._master);
  },

  _scheduler() {
    if (!this._playing || !this._ctx) return;

    const ctx = this._ctx;
    const scheduleAheadTime = 0.12;
    const stepDur = 60 / this.tempo / 2; // eighth-note grid

    while (this._nextNoteTime < ctx.currentTime + scheduleAheadTime) {
      this._scheduleStep(this._step, this._nextNoteTime);

      let swingOffset = 0;
      if (this._step % 2 === 1) {
        swingOffset = stepDur * this.swing;
      }

      this._nextNoteTime += stepDur + swingOffset;
      this._step++;
    }

    this._lookaheadTimer = setTimeout(() => this._scheduler(), 25);
  },

  _scheduleStep(step, time) {
    const arpFreq = this.arpPattern[step % this.arpPattern.length];
    const bassFreq = this.bassPattern[step % this.bassPattern.length];
    const tier = this.intensityTier;

    // Arp every step
    this._playArp(arpFreq, time);

    // Bass every 4 steps
    if (step % 4 === 0) {
      this._playBass(bassFreq, time);
    }

    // Base offbeat hats
    if (step % 2 === 1) {
      this._playHat(time, 1);
    }

    // Extra hats as tension rises
    if (tier >= 2 && step % 4 === 0) {
      this._playHat(time, 0.7);
    }

    if (tier >= 4 && step % 8 === 6) {
      this._playHat(time, 0.55);
    }

    // Tension pulse for 30+
    if (tier >= 3 && step % 8 === 0) {
      this._playPulse(time);
    }
  },

  _playArp(freq, time) {
    const ctx = this._ctx;
    const tier = this.intensityTier;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.995, time + 0.16);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200 + (freq * 1.5) + tier * 90, time);
    filter.frequency.exponentialRampToValueAtTime(700 + tier * 40, time + 0.14);
    filter.Q.value = 3.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.08 + tier * 0.008, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this._lowpass);

    osc.start(time);
    osc.stop(time + 0.18);
  },

  _playBass(freq, time) {
    const ctx = this._ctx;
    const tier = this.intensityTier;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(freq / 2, time);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320 + tier * 16, time);
    filter.frequency.exponentialRampToValueAtTime(180 + tier * 10, time + 0.28);
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.12 + tier * 0.012, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.32);

    const subGain = ctx.createGain();
    subGain.gain.value = 0.5 + tier * 0.03;

    osc.connect(filter);
    sub.connect(subGain);
    subGain.connect(filter);
    filter.connect(gain);
    gain.connect(this._lowpass);

    osc.start(time);
    sub.start(time);
    osc.stop(time + 0.34);
    sub.stop(time + 0.34);
  },

  _playHat(time, amp = 1) {
    const ctx = this._ctx;

    const bufferSize = Math.floor(ctx.sampleRate * 0.025);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000 + this.intensityTier * 250;
    filter.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.018 * amp, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this._lowpass);

    noise.start(time);
    noise.stop(time + 0.03);
  },

  _playPulse(time) {
    const ctx = this._ctx;
    const tier = this.intensityTier;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90 + tier * 8, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.18);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 260;
    filter.Q.value = 1.4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.025 + tier * 0.004, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this._lowpass);

    osc.start(time);
    osc.stop(time + 0.22);
  },
};