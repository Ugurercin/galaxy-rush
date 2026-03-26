const ShootSound = {
  startFreq: 1400,
  endFreq: 380,
  duration: 0.06,
  volume: 0.09,
  waveform: 'square',

  play(ctx, bus) {
    const now = ctx.currentTime;
    const dur = this.duration;

    const osc = ctx.createOscillator();
    osc.type = this.waveform;
    osc.frequency.setValueAtTime(this.startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(this.endFreq, now + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(this.volume, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 2.5;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bus);

    osc.start(now);
    osc.stop(now + dur + 0.01);
  },
};