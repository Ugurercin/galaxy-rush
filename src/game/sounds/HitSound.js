// Enemy hit sound — short mid-frequency thud
// Plays when a bullet hits but doesn't kill the enemy
// Edit freq and duration to taste

const HitSound = {
  // ── Tune these ─────────────────────────────────────────
  freq:      220,   // Hz
  duration:  0.06,  // seconds
  volume:    0.3,
  waveform:  'sine',

  play(ctx, bus) {
    const now = ctx.currentTime;
    const dur = this.duration;

    const osc  = ctx.createOscillator();
    osc.type   = this.waveform;
    osc.frequency.setValueAtTime(this.freq, now);
    osc.frequency.exponentialRampToValueAtTime(this.freq * 0.5, now + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    // Slight distortion for punch
    const distort = ctx.createWaveShaper();
    distort.curve = this._makeDistortionCurve(20);

    osc.connect(distort);
    distort.connect(gain);
    gain.connect(bus);

    osc.start(now);
    osc.stop(now + dur + 0.01);
  },

  _makeDistortionCurve(amount) {
    const samples = 256;
    const curve   = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  },
};