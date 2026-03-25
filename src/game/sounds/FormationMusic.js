// Formation wave music — tenser and faster than normal
// Triggered when a formation spawns on wave 4+
// Edit tempo, notes, waveform to change feel

const FormationMusic = {
  _timeout:  null,
  _playing:  false,
  _ctx:      null,
  _bus:      null,
  _nodes:    [],

  // ── Tune these ─────────────────────────────────────────
  tempo:    210,         // BPM — noticeably faster than normal (160)
  waveform: 'sawtooth',
  notes: [
    // D minor — more anxious than C minor
    146.83, 174.61, 195.99, 233.08, 261.63,
    233.08, 195.99, 233.08, 174.61, 146.83,
    130.81, 146.83, 174.61, 195.99, 174.61,
    155.56, 130.81, 116.54, 130.81, 155.56,
    // Second phrase — higher register, more urgent
    293.66, 349.23, 293.66, 261.63, 233.08,
    261.63, 233.08, 195.99, 174.61, 195.99,
    233.08, 261.63, 233.08, 195.99, 174.61,
    155.56, 174.61, 155.56, 130.81, 146.83,
  ],
  noteIndex: 0,

  start(ctx, bus) {
    if (this._playing) return;
    this._playing  = true;
    this._ctx      = ctx;
    this._bus      = bus;
    this.noteIndex = 0;
    this._scheduleNote();
  },

  stop() {
    this._playing = false;
    if (this._timeout) clearTimeout(this._timeout);
    this._nodes.forEach(n => { try { n.stop(); } catch(e) {} });
    this._nodes = [];
  },

  _scheduleNote() {
    if (!this._playing) return;

    const ctx     = this._ctx;
    const bus     = this._bus;
    const freq    = this.notes[this.noteIndex % this.notes.length];
    const noteDur = 60 / this.tempo;
    const now     = ctx.currentTime;

    // Main oscillator
    const osc  = ctx.createOscillator();
    osc.type   = this.waveform;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.997, now + noteDur * 0.7);

    // Sharper attack than normal music — more aggressive
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.55, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + noteDur * 0.75);

    // Bandpass filter for a tighter, more tense tone
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.8;

    // Sub-octave doubling for weight
    const subOsc  = ctx.createOscillator();
    subOsc.type   = 'square';
    subOsc.frequency.setValueAtTime(freq / 2, now);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.15, now + 0.008);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + noteDur * 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bus);

    subOsc.connect(subGain);
    subGain.connect(bus);

    osc.start(now);    osc.stop(now + noteDur);
    subOsc.start(now); subOsc.stop(now + noteDur);

    this._nodes.push(osc, subOsc);
    this._nodes = this._nodes.filter(n => {
      try { return n.playbackState !== 3; } catch(e) { return true; }
    });

    this.noteIndex++;

    this._timeout = setTimeout(
      () => this._scheduleNote(),
      noteDur * 940
    );
  },
};