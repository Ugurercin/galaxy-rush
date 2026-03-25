// Background music — dark synthwave arpeggio
// Edit notes[], tempo, and waveform to change the feel

const MusicTrack = {
  _nodes:    [],
  _timeout:  null,
  _playing:  false,
  _ctx:      null,
  _bus:      null,

  // ── Tune these to change the music ─────────────────────
  tempo:     160,   // BPM
  waveform: 'sawtooth',
  notes: [
    // C minor pentatonic arpeggio — two bars
    130.81, 155.56, 174.61, 207.65, 233.08,
    207.65, 174.61, 155.56, 130.81, 103.83,
    116.54, 155.56, 174.61, 233.08, 207.65,
    174.61, 130.81, 116.54, 103.83, 130.81,
  ],
  noteIndex: 0,

  start(ctx, bus) {
    if (this._playing) return;
    this._playing = true;
    this._ctx = ctx;
    this._bus = bus;
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

    const ctx       = this._ctx;
    const bus       = this._bus;
    const freq      = this.notes[this.noteIndex % this.notes.length];
    const noteDur   = (60 / this.tempo);       // seconds per beat
    const now       = ctx.currentTime;

    // Oscillator
    const osc = ctx.createOscillator();
    osc.type = this.waveform;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.998, now + noteDur * 0.8);

    // Per-note gain envelope — short attack, quick decay
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + noteDur * 0.85);

    // Low-pass filter for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 1.2;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bus);

    osc.start(now);
    osc.stop(now + noteDur);
    this._nodes.push(osc);

    // Clean up finished nodes
    this._nodes = this._nodes.filter(n => {
      try { return n.playbackState !== 3; } catch(e) { return true; }
    });

    this.noteIndex++;

    // Schedule next note
    this._timeout = setTimeout(
      () => this._scheduleNote(),
      noteDur * 950  // slightly under 1 beat in ms to stay tight
    );
  },
};