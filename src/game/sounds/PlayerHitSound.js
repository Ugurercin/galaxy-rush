// Player hit sound — deep impact, more alarming than enemy hit
// Should feel like a warning — low frequency + distortion
// Edit to taste

const PlayerHitSound = {
  // ── Tune these ─────────────────────────────────────────
  pitchStart: 120,   // Hz — low rumble
  pitchEnd:   40,    // Hz
  duration:   0.35,  // seconds — longer than enemy hit
  noiseVol:   0.5,
  toneVol:    0.4,

  play(ctx, bus) {
    const now = ctx.currentTime;
    const dur = this.duration;

    // ── Heavy noise burst ──────────────────────────────────
    const bufferSize = ctx.sampleRate * dur;
    const buffer     = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data       = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(300, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(60, now + dur);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(this.noiseVol, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(bus);
    noise.start(now);

    // ── Deep tone ──────────────────────────────────────────
    const osc  = ctx.createOscillator();
    osc.type   = 'sawtooth';
    osc.frequency.setValueAtTime(this.pitchStart, now);
    osc.frequency.exponentialRampToValueAtTime(this.pitchEnd, now + dur * 0.6);

    const toneGain = ctx.createGain();
    toneGain.gain.setValueAtTime(this.toneVol, now);
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.6);

    // Distortion for alarm feel
    const distort = ctx.createWaveShaper();
    distort.curve = this._makeDistortionCurve(40);

    osc.connect(distort);
    distort.connect(toneGain);
    toneGain.connect(bus);
    osc.start(now);
    osc.stop(now + dur);
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