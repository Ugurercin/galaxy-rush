// ConfigWave.js
// Generic wave driven by config object
// Requires WaveBase and WAVE_CONFIGS to already exist globally

class ConfigWave extends WaveBase {
  constructor(scene, config) {
    super(scene);

    this.id            = config.id || 0;
    this.name          = config.name || ('Wave ' + this.id);
    this.enemyCount    = config.enemyCount != null ? config.enemyCount : 8;
    this.spawnInterval = config.spawnInterval != null ? config.spawnInterval : 1600;
    this.weights       = config.weights || { drifter: 1 };
    this.formation     = config.formation || null;

    this._coinBonus  = config.coinBonus != null ? config.coinBonus : 20;
    this._musicTrack = config.musicTrack || 'music';
    this._message    = config.message || null;
    this.sequence    = config.sequence || null;
  }

  onStart() {
    if (this._message) {
      this.scene.showMessage(
        this._message.title || ('WAVE ' + this.id),
        this._message.subtitle || '',
        this._message.color != null ? this._message.color : 0x44ddee,
        this._message.duration != null ? this._message.duration : 1400,
        null
      );
    }

    if (this.formation) {
      this.spawnFormation(this.formation);
    }
  }

  _spawnNext() {
    // Deterministic sequence support
    if (this.sequence && this.sequence.length > 0) {
      const type = this.sequence[this._spawned];
      if (type) {
        this._spawnType(type);
        return;
      }
    }

    // Weighted random support
    const entries = Object.entries(this.weights).filter((entry) => entry[1] > 0);
    if (entries.length === 0) return;

    let totalWeight = 0;
    for (let i = 0; i < entries.length; i++) {
      totalWeight += entries[i][1];
    }

    let roll = Phaser.Math.FloatBetween(0, totalWeight);

    for (let i = 0; i < entries.length; i++) {
      const type = entries[i][0];
      const weight = entries[i][1];
      roll -= weight;
      if (roll <= 0) {
        this._spawnType(type);
        return;
      }
    }

    this._spawnType(entries[0][0]);
  }

  get coinBonus() {
    return this._coinBonus;
  }

  get musicTrack() {
    return this._musicTrack;
  }
}