const CoinCollectSound = {
  baseFreq: 720,
  maxFreq: 1800,
  comboWindow: 280,
  duration: 0.08,
  volume: 0.16,

  _currentFreq: 720,
  _lastPlayedAt: 0,
  _comboCount: 0,

  play(ctx, bus) {
    const now = ctx.currentTime;
    const nowMs = performance.now();

    if (nowMs - this._lastPlayedAt > this.comboWindow) {
      this._currentFreq = this.baseFreq;
      this._comboCount = 0;
    }

    this._lastPlayedAt = nowMs;
    this._comboCount++;

    // ratio-based rise feels more musical than +40 Hz each time
    const freq = Math.min(
      this.baseFreq * Math.pow(1.06, this._comboCount - 1),
      this.maxFreq
    );

    const dur = this.duration;

    // main body
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    osc1.frequency.linearRampToValueAtTime(freq * 1.06, now + 0.012);
    osc1.frequency.exponentialRampToValueAtTime(freq * 0.96, now + dur);

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.linearRampToValueAtTime(this.volume, now + 0.004);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + dur);

    // sparkle overtone
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.5, now);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.linearRampToValueAtTime(this.volume * 0.28, now + 0.003);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.45);

    // metallic click layer
    const osc3 = ctx.createOscillator();
    osc3.type = 'square';
    osc3.frequency.setValueAtTime(freq * 4, now);

    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 3200;
    band.Q.value = 5;

    const gain3 = ctx.createGain();
    gain3.gain.setValueAtTime(0.0001, now);
    gain3.gain.linearRampToValueAtTime(this.volume * 0.12, now + 0.002);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    // tiny echo tail
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.045;

    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.12;

    osc1.connect(gain1);
    gain1.connect(bus);
    gain1.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(bus);

    osc2.connect(gain2);
    gain2.connect(bus);

    osc3.connect(band);
    band.connect(gain3);
    gain3.connect(bus);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + dur + 0.03);
    osc2.stop(now + dur * 0.45);
    osc3.stop(now + 0.025);

    this._currentFreq = freq;
  },
};