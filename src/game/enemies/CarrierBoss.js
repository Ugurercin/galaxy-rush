class CarrierBoss extends EnemyBase {
  constructor(scene, wave) {
    const { width } = scene.scale;
    super(scene, width / 2, -120);

    this.type = 'carrierBoss';
    this.waveNumber = wave;
    this.size = 58;

    this.hp = 48 + (wave / 10 - 1) * 22;
    this.maxHp = this.hp;

    this.speed = 1.0;
    this.color = 0x6ae3ff;
    this.scoreValue = 180 + wave * 5;
    this.coinValue = 140 + wave;

    this.entering = true;
    this.targetY = 130;

    this.moveT = 0;
    this.shootTimer = 0;
    this.shootRate = Math.max(800, 1500 - wave * 6);

    this.spawnTimer = 0;
    this.spawnRate = Math.max(2600, 4200 - wave * 10);
  }

  update(delta) {
    if (this.entering) {
      this.y += this.speed;
      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.entering = false;
      }
      return;
    }

    const dt = delta / 16.666;
    this.moveT += 0.015 * dt;
    this.x = this.scene.scale.width / 2 + Math.sin(this.moveT) * 110;

    this.shootTimer += delta;
    if (this.shootTimer >= this.shootRate) {
      this.shootTimer = 0;

      this.scene.fireEnemyBullet(this.x - 26, this.y + 8, this.scene.ship.x - 20, this.scene.ship.y);
      this.scene.fireEnemyBullet(this.x + 26, this.y + 8, this.scene.ship.x + 20, this.scene.ship.y);
      this.scene.fireEnemyBullet(this.x, this.y + 18, this.scene.ship.x, this.scene.ship.y);
    }

    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnRate) {
      this.spawnTimer = 0;

      if (typeof Drifter !== 'undefined') {
        this.scene.enemies.push(new Drifter(this.scene, this.waveNumber));
      }
      if (typeof Shooter !== 'undefined' && Phaser.Math.Between(0, 100) < 50) {
        this.scene.enemies.push(new Shooter(this.scene, this.waveNumber));
      }
    }
  }

  draw(g) {
    const x = this.x;
    const y = this.y;
    const s = this.size;

    g.fillStyle(0x244a5a, 0.95);
    g.fillRect(x - s * 1.2, y - s * 0.45, s * 2.4, s * 0.9);

    g.fillStyle(0x6ae3ff, 0.9);
    g.fillTriangle(x, y + s * 0.95, x - s * 0.85, y + s * 0.15, x + s * 0.85, y + s * 0.15);

    g.fillStyle(0x8ef0ff, 0.9);
    g.fillRect(x - s * 0.28, y - s * 0.65, s * 0.56, s * 0.45);

    g.fillStyle(0xaef7ff, 0.95);
    g.fillCircle(x - s * 0.45, y, s * 0.12);
    g.fillCircle(x + s * 0.45, y, s * 0.12);
    g.fillCircle(x, y - s * 0.2, s * 0.14);

    g.lineStyle(2, 0xb9fbff, 0.95);
    g.strokeRect(x - s * 1.2, y - s * 0.45, s * 2.4, s * 0.9);

    this.drawBossHPBar(g);
  }

  drawBossHPBar(g) {
    const bw = 220;
    const bh = 10;
    const bx = this.scene.scale.width / 2 - bw / 2;
    const by = 54;

    g.fillStyle(0x1a1a2e, 0.9);
    g.fillRect(bx, by, bw, bh);

    g.fillStyle(this.color, 1);
    g.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);

    g.lineStyle(1, 0xd4feff, 0.9);
    g.strokeRect(bx, by, bw, bh);
  }

  isOffScreen() {
    return false;
  }
}