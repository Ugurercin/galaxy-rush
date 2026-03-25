// Enemy explosion sound — noise burst + low pitch drop
// Plays when an enemy is destroyed
// Edit duration, pitchStart, volume to taste

const ExplosionSound = {
  // ── Tune these ─────────────────────────────────────────
  pitchStart: 180,   // Hz
  pitchEnd:   40,    // Hz
  duration:   0.22,  // seconds
  noiseVol:   0.35,
  toneVol:    0.2,

  play(ctx, bus) {
    const now = ctx.currentTime;
    const dur = this.duration;

    // ── White noise burst ──────────────────────────────────
    const bufferSize = ctx.sampleRate * dur;
    const buffer     = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data       = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Low-pass filter on noise for a "boom" feel
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(600, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(80, now + dur);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(this.noiseVol, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(bus);
    noise.start(now);

    // ── Pitch drop tone ────────────────────────────────────
    const osc  = ctx.createOscillator();
    osc.type   = 'sawtooth';
    osc.frequency.setValueAtTime(this.pitchStart, now);
    osc.frequency.exponentialRampToValueAtTime(this.pitchEnd, now + dur * 0.7);

    const toneGain = ctx.createGain();
    toneGain.gain.setValueAtTime(this.toneVol, now);
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.7);

    osc.connect(toneGain);
    toneGain.connect(bus);
    osc.start(now);
    osc.stop(now + dur);
  },
};