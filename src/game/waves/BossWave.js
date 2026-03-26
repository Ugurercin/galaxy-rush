// BossWave.js

class BossWave extends WaveBase {
  constructor(scene, waveNumber) {
    super(scene);

    this.waveNumber = waveNumber;
    this.enemyCount = 0;
    this.spawnInterval = 999999;
    this.weights = {};

    this.boss = null;
    this.elapsed = 0;
    this.addTimer = 0;
    this.addSpawnInterval = Math.max(2400, 4200 - waveNumber * 20);

    this._coinBonus = 28 + waveNumber;
  }

  onStart() {
    this.scene.showMessage(
      `BOSS WAVE ${this.waveNumber}`,
      'Heavy hostile incoming!',
      0xff3355,
      1800,
      null
    );

    soundManager.switchMusic('bossMusic');

    this.boss = new BossEnemy(this.scene, this.waveNumber);
    this.scene.enemies.push(this.boss);
  }

  update(delta) {
    if (this.done) return;

    this.elapsed += delta;
    this.addTimer += delta;

    if (this.addTimer >= this.addSpawnInterval) {
      this.addTimer = 0;
      this.spawnEscortPack();
    }

    const bossAlive = this.scene.enemies.some(e => e.type === 'boss' && e.alive);
    const othersAlive = this.scene.enemies.length > 0 || this.scene.formation.isActive();

    if (!bossAlive && !othersAlive) {
      this.done = true;
    }
  }

  spawnEscortPack() {
    const wave = this.waveNumber;

    const pack = [];

    if (wave < 20) {
      pack.push(new Drifter(this.scene, wave));
      pack.push(new ZigZag(this.scene, wave));
    } else if (wave < 30) {
      pack.push(new Chaser(this.scene, wave));
      pack.push(new Shooter(this.scene, wave));
    } else if (wave < 40) {
      pack.push(new Bomber(this.scene, wave));
      pack.push(new Dasher(this.scene, wave));
    } else {
      pack.push(new Splitter(this.scene, wave));
      pack.push(new Tank(this.scene, wave));
    }

    for (let i = 0; i < pack.length; i++) {
      const e = pack[i];
      e.y = -20 - i * 24;
      e.x = Phaser.Math.Between(e.size + 20, this.scene.scale.width - e.size - 20);
      this.scene.enemies.push(e);
    }
  }

  get coinBonus() {
    return this._coinBonus;
  }

  get musicTrack() {
    return 'bossMusic';
  }
}