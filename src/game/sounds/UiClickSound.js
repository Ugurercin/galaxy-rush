// UI click sound — short mechanical tick
// Used for shop purchases, button taps, inventory actions
// Edit freq and duration to taste

const UIClickSound = {
  // ── Tune these ─────────────────────────────────────────
  freq:      1200,  // Hz — crisp high click
  duration:  0.04,  // seconds — very short
  volume:    0.2,
  waveform:  'square',

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

    osc.connect(gain);
    gain.connect(bus);

    osc.start(now);
    osc.stop(now + dur + 0.01);
  },
};