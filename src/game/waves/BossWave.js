// BossWave.js

class BossWave extends WaveBase {
  constructor(scene, waveNumber, createBossFn) {
    super(scene);

    this.waveNumber = waveNumber;
    this.createBossFn = createBossFn;

    this.enemyCount = 0;
    this.spawnInterval = 999999;
    this.boss = null;

    this._coinBonus = 80 + waveNumber * 2;
    this._musicTrack = 'bossMusic';

    this.message = {
      title: `WAVE ${waveNumber}`,
      subtitle: 'WARNING: BOSS INCOMING',
      color: 0xff3355,
      duration: 1600,
    };
  }

  get coinBonus() {
    return this._coinBonus;
  }

  get musicTrack() {
    return this._musicTrack;
  }

  onStart() {
    if (this.message) {
      this.scene.showMessage(
        this.message.title,
        this.message.subtitle,
        this.message.color,
        this.message.duration || 1500,
        null
      );
    }

    this.boss = this.createBossFn();
    this.scene.enemies.push(this.boss);
  }

  update(delta) {
    if (this.done) return;

    if (this.boss && !this.boss.alive) {
      this.done = true;
    }
  }
}