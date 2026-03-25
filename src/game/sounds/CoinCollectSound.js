// Coin collect sound — bright chime with rising pitch combo
// Each consecutive collection within the combo window
// raises the pitch, giving a "filling up" feel
// Perfect for CoinMagnet rapid collection chains
//
// ── Tune these ─────────────────────────────────────────────
// baseFreq    — starting pitch of the chime
// maxFreq     — pitch ceiling (combo won't go higher)
// freqStep    — how much pitch rises per combo hit
// comboWindow — ms gap allowed between hits to keep combo alive
// duration    — length of each chime
// volume      — 0.0 to 1.0

const CoinCollectSound = {
  baseFreq:    660,    // Hz — bright C note
  maxFreq:     1760,   // Hz — two octaves up max
  freqStep:    40,     // Hz rise per consecutive collect
  comboWindow: 280,    // ms — gap before combo resets
  duration:    0.09,   // seconds per chime
  volume:      0.28,

  // ── Internal state ─────────────────────────────────────
  _currentFreq:  660,
  _lastPlayedAt: 0,
  _comboCount:   0,

  play(ctx, bus) {
    const now    = ctx.currentTime;
    const nowMs  = performance.now();

    // Check if combo should reset
    if (nowMs - this._lastPlayedAt > this.comboWindow) {
      this._currentFreq = this.baseFreq;
      this._comboCount  = 0;
    }

    this._lastPlayedAt = nowMs;
    this._comboCount++;

    const freq = Math.min(this._currentFreq, this.maxFreq);
    const dur  = this.duration;

    // ── Main chime oscillator ─────────────────────────────
    const osc  = ctx.createOscillator();
    osc.type   = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    // Slight pitch lift at the end — coin "ting" effect
    osc.frequency.linearRampToValueAtTime(freq * 1.04, now + dur * 0.3);
    osc.frequency.linearRampToValueAtTime(freq * 0.98, now + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volume, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    // ── Harmonic overtone for sparkle ─────────────────────
    const osc2  = ctx.createOscillator();
    osc2.type   = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(this.volume * 0.35, now + 0.005);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.6);

    // ── Short reverb tail via delay ───────────────────────
    const delay       = ctx.createDelay();
    delay.delayTime.value = 0.04;

    const delayGain   = ctx.createGain();
    delayGain.gain.value = 0.18;

    osc.connect(gain);
    gain.connect(bus);
    gain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(bus);

    osc2.connect(gain2);
    gain2.connect(bus);

    osc.start(now);  osc.stop(now + dur + 0.05);
    osc2.start(now); osc2.stop(now + dur * 0.6);

    // Advance pitch for next hit in combo
    this._currentFreq = Math.min(
      this._currentFreq + this.freqStep,
      this.maxFreq
    );
  },
};