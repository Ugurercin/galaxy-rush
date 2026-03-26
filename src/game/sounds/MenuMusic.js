// MenuMusic.js
// Soft ambient menu background track with safe cleanup

const MenuMusic = {
  start(ctx, bus) {
    const now = ctx.currentTime;

    this._ctx = ctx;
    this._bus = bus;
    this._nodes = [];
    this._timers = [];
    this._running = true;

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(bus);
    this.master = master;

    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.16, now + 1.8);

    const makePad = (freq, type, gainValue) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.Q.value = 0.6;

      gain.gain.setValueAtTime(gainValue, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      osc.start(now);

      this._nodes.push(osc, gain, filter);
    };

    makePad(110, 'sine', 0.05);
    makePad(165, 'triangle', 0.035);
    makePad(220, 'sine', 0.025);

    const pulse = () => {
      if (!this._running) return;

      const t = ctx.currentTime;
      const notes = [220, 277.18, 329.63, 392.0];
      const freq = notes[Math.floor(Math.random() * notes.length)];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.018, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      osc.start(t);
      osc.stop(t + 1.8);

      this._nodes.push(osc, gain, filter);

      const delay = 900 + Math.random() * 800;
      const id = setTimeout(pulse, delay);
      this._timers.push(id);
    };

    const sparkle = () => {
      if (!this._running) return;

      const t = ctx.currentTime;
      const base = [440, 554.37, 659.25][Math.floor(Math.random() * 3)];

      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(base * (1 + i * 0.12), t + i * 0.08);

        gain.gain.setValueAtTime(0.0001, t + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(master);

        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 0.5);

        this._nodes.push(osc, gain);
      }

      const delay = 2600 + Math.random() * 1800;
      const id = setTimeout(sparkle, delay);
      this._timers.push(id);
    };

    pulse();
    sparkle();
  },

  stop(ctx) {
    if (!this._running && !this.master && (!this._nodes || this._nodes.length === 0)) {
      return;
    }

    this._running = false;

    const audioCtx = ctx || this._ctx;

    if (this._timers) {
      this._timers.forEach(id => clearTimeout(id));
      this._timers = [];
    }

    if (!audioCtx) {
      if (this._nodes) {
        this._nodes.forEach(node => {
          try {
            if (typeof node.stop === 'function') node.stop();
          } catch (e) {}
          try {
            node.disconnect();
          } catch (e) {}
        });
      }

      this._nodes = [];
      this.master = null;
      this._ctx = null;
      this._bus = null;
      return;
    }

    const now = audioCtx.currentTime;

    if (this.master && this.master.gain) {
      try {
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setValueAtTime(
          Math.max(this.master.gain.value || 0.0001, 0.0001),
          now
        );
        this.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      } catch (e) {}
    }

    setTimeout(() => {
      if (this._nodes) {
        this._nodes.forEach(node => {
          try {
            if (typeof node.stop === 'function') node.stop();
          } catch (e) {}
          try {
            node.disconnect();
          } catch (e) {}
        });
      }

      if (this.master) {
        try {
          this.master.disconnect();
        } catch (e) {}
      }

      this._nodes = [];
      this.master = null;
      this._ctx = null;
      this._bus = null;
    }, 650);
  },
};