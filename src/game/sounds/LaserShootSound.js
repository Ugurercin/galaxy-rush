const LaserShootSound = {
  duration: 0.12,
  volume: 0.075,

  play(ctx, bus) {
    const now = ctx.currentTime;
    const dur = this.duration;

    // bright top layer
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(1850, now);
    osc1.frequency.exponentialRampToValueAtTime(620, now + dur);

    // soft humming body
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(420, now);
    osc2.frequency.exponentialRampToValueAtTime(260, now + dur);

    // slight moving tone for that energized feel
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 28;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 18;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(this.volume, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1700, now);
    filter.Q.value = 2.8;

    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(bus);

    lfo.start(now);
    osc1.start(now);
    osc2.start(now);

    lfo.stop(now + dur + 0.02);
    osc1.stop(now + dur + 0.02);
    osc2.stop(now + dur + 0.02);
  },
};