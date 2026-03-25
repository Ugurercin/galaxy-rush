// Boss fight music — maximum tension
// Heavy driving rhythm + menacing melody
// Two oscillators + pulse bass for that synthwave boss feel
// Edit tempo, melody, bassline to change character

const BossMusic = {
  _timeout:    null,
  _bassTimeout: null,
  _playing:    false,
  _ctx:        null,
  _bus:        null,
  _nodes:      [],
  _melodyIdx:  0,
  _bassIdx:    0,

  // ── Tune these ─────────────────────────────────────────
  tempo:       240,     // BPM — very fast and driving
  waveform:    'sawtooth',

  // Melody — chromatic descending line, very tense
  melody: [
    311.13, 293.66, 277.18, 261.63,
    246.94, 233.08, 220.00, 207.65,
    220.00, 233.08, 246.94, 261.63,
    277.18, 261.63, 246.94, 233.08,
    // Build — goes higher
    369.99, 349.23, 329.63, 311.13,
    293.66, 311.13, 329.63, 349.23,
    369.99, 392.00, 369.99, 349.23,
    329.63, 311.13, 293.66, 277.18,
  ],

  // Bass — pounding pulse rhythm
  bassline: [
    65.41, 0, 65.41, 0,
    65.41, 0, 73.42, 0,
    65.41, 0, 65.41, 0,
    77.78, 0, 69.30, 0,
  ],

  start(ctx, bus) {
    if (this._playing) return;
    this._playing   = true;
    this._ctx       = ctx;
    this._bus       = bus;
    this._melodyIdx = 0;
    this._bassIdx   = 0;
    this._scheduleMelody();
    this._scheduleBass();
  },

  stop() {
    this._playing = false;
    if (this._timeout)     clearTimeout(this._timeout);
    if (this._bassTimeout) clearTimeout(this._bassTimeout);
    this._nodes.forEach(n => { try { n.stop(); } catch(e) {} });
    this._nodes = [];
  },

  _scheduleMelody() {
    if (!this._playing) return;

    const ctx     = this._ctx;
    const bus     = this._bus;
    const freq    = this.melody[this._melodyIdx % this.melody.length];
    const noteDur = 60 / this.tempo;
    const now     = ctx.currentTime;

    const osc  = ctx.createOscillator();
    osc.type   = this.waveform;
    osc.frequency.setValueAtTime(freq, now);

    // Aggressive sharp envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, now + noteDur * 0.65);

    // High-pass filter — cuts muddiness, adds edge
    const filter = ctx.createBiquadFilter();
    filter.type  = 'highpass';
    filter.frequency.value = 200;

    // Slight detune for fatness
    const osc2  = ctx.createOscillator();
    osc2.type   = this.waveform;
    osc2.frequency.setValueAtTime(freq * 1.008, now);  // slightly detuned

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.006);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + noteDur * 0.65);

    osc.connect(filter);  filter.connect(gain);  gain.connect(bus);
    osc2.connect(gain2);  gain2.connect(bus);

    osc.start(now);  osc.stop(now + noteDur);
    osc2.start(now); osc2.stop(now + noteDur);
    this._nodes.push(osc, osc2);

    this._melodyIdx++;
    this._timeout = setTimeout(
      () => this._scheduleMelody(),
      noteDur * 930
    );
  },

  _scheduleBass() {
    if (!this._playing) return;

    const ctx     = this._ctx;
    const bus     = this._bus;
    const freq    = this.bassline[this._bassIdx % this.bassline.length];
    const noteDur = 60 / this.tempo;
    const now     = ctx.currentTime;

    if (freq > 0) {
      const osc  = ctx.createOscillator();
      osc.type   = 'square';
      osc.frequency.setValueAtTime(freq, now);

      // Very punchy bass envelope
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + noteDur * 0.5);

      // Low-pass for warmth
      const filter = ctx.createBiquadFilter();
      filter.type  = 'lowpass';
      filter.frequency.value = 400;

      osc.connect(filter); filter.connect(gain); gain.connect(bus);
      osc.start(now); osc.stop(now + noteDur);
      this._nodes.push(osc);
    }

    this._bassIdx++;
    this._bassTimeout = setTimeout(
      () => this._scheduleBass(),
      noteDur * 930
    );
  },
};