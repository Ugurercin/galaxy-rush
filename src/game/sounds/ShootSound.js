// Player shoot sound — fast high-pitch laser blip
// Edit freq, duration, waveform to taste

const ShootSound = {
  // ── Tune these ─────────────────────────────────────────
  startFreq:  880,    // Hz — starting pitch
  endFreq:    440,    // Hz — ending pitch (pitch drop)
  duration:   0.08,   // seconds
  volume:     0.25,
  waveform:   'square',

  play(ctx, bus) {
    const now  = ctx.currentTime;
    const dur  = this.duration;

    const osc  = ctx.createOscillator();
    osc.type   = this.waveform;
    osc.frequency.setValueAtTime(this.startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(this.endFreq, now + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(bus);

    osc.start(now);
    osc.stop(now + dur + 0.01);
  },
};