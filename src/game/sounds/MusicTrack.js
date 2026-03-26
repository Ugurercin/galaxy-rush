// Retro space shooter background music
// Dark synthwave / arcade loop with arp + bass + delay

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

    if (this._master) {
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
    const scheduleAheadTime = 0.12; // seconds
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

    // Arp every step
    this._playArp(arpFreq, time);

    // Bass every 4 steps
    if (step % 4 === 0) {
      this._playBass(bassFreq, time);
    }

    // Tiny noise hat on offbeats for arcade energy
    if (step % 2 === 1) {
      this._playHat(time);
    }
  },

  _playArp(freq, time) {
    const ctx = this._ctx;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.995, time + 0.16);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200 + (freq * 1.5), time);
    filter.frequency.exponentialRampToValueAtTime(700, time + 0.14);
    filter.Q.value = 3.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.08, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this._lowpass);

    osc.start(time);
    osc.stop(time + 0.18);
  },

  _playBass(freq, time) {
    const ctx = this._ctx;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(freq / 2, time);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, time);
    filter.frequency.exponentialRampToValueAtTime(180, time + 0.28);
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.12, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.32);

    const subGain = ctx.createGain();
    subGain.gain.value = 0.5;

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

  _playHat(time) {
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
    filter.frequency.value = 5000;
    filter.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.018, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this._lowpass);

    noise.start(time);
    noise.stop(time + 0.03);
  },
};