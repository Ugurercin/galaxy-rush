const RocketShootSound = {
  duration: 0.22,
  volume: 0.12,

  play(ctx, bus) {
    const now = ctx.currentTime;
    const dur = this.duration;

    // main rocket body
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(58, now + dur);

    // low-end boom layer
    const sub = ctx.createOscillator();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(110, now);
    sub.frequency.exponentialRampToValueAtTime(38, now + dur);

    // noisy "phew" air burst
    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.linearRampToValueAtTime(this.volume, now + 0.01);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(this.volume * 0.7, now + 0.015);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.11, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 520;
    lowpass.Q.value = 1.1;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 900;
    noiseFilter.Q.value = 0.8;

    osc.connect(lowpass);
    sub.connect(lowpass);

    lowpass.connect(oscGain);
    lowpass.connect(subGain);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    oscGain.connect(bus);
    subGain.connect(bus);
    noiseGain.connect(bus);

    osc.start(now);
    sub.start(now);
    noise.start(now);

    osc.stop(now + dur + 0.03);
    sub.stop(now + dur + 0.03);
    noise.stop(now + 0.1);
  },
};