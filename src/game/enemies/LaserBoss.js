class LaserBoss extends EnemyBase {
  constructor(scene, wave) {
    const { width } = scene.scale;
    super(scene, width / 2, -110);

    this.type = 'laserBoss';
    this.waveNumber = wave;
    this.size = 54;

    this.hp = 58 + (wave / 10 - 1) * 24;
    this.maxHp = this.hp;

    this.speed = 1.05;
    this.color = 0xff3355;
    this.scoreValue = 210 + wave * 5;
    this.coinValue = 150 + wave;

    this.entering = true;
    this.targetY = 125;

    this.moveT = 0;
    this.shootTimer = 0;
    this.shootRate = Math.max(1100, 1900 - wave * 6);

    this.laserTimer = 0;
    this.laserRate = Math.max(2800, 4300 - wave * 10);
    this.charging = false;
    this.chargeTime = 850;
    this.chargeTimer = 0;
    this.beamTime = 700;
    this.beamTimer = 0;
    this.beamActive = false;
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
    this.moveT += 0.017 * dt;
    this.x = this.scene.scale.width / 2 + Math.sin(this.moveT) * 80;

    this.shootTimer += delta;
    if (!this.beamActive && !this.charging && this.shootTimer >= this.shootRate) {
      this.shootTimer = 0;
      this.scene.fireEnemyBullet(this.x - 16, this.y + 12, this.scene.ship.x, this.scene.ship.y);
      this.scene.fireEnemyBullet(this.x + 16, this.y + 12, this.scene.ship.x, this.scene.ship.y);
    }

    this.laserTimer += delta;
    if (!this.charging && !this.beamActive && this.laserTimer >= this.laserRate) {
      this.laserTimer = 0;
      this.charging = true;
      this.chargeTimer = 0;
    }

    if (this.charging) {
      this.chargeTimer += delta;
      if (this.chargeTimer >= this.chargeTime) {
        this.charging = false;
        this.beamActive = true;
        this.beamTimer = 0;
      }
    }

    if (this.beamActive) {
      this.beamTimer += delta;
      if (this.beamTimer >= this.beamTime) {
        this.beamActive = false;
      }
    }
  }

  draw(g) {
    const x = this.x;
    const y = this.y;
    const s = this.size;

    g.fillStyle(0x541826, 0.96);
    g.fillRect(x - s, y - s * 0.45, s * 2, s * 0.9);

    g.fillStyle(0xff4466, 0.92);
    g.fillTriangle(x, y + s * 0.95, x - s * 0.8, y + s * 0.05, x + s * 0.8, y + s * 0.05);

    g.fillStyle(0xff9aaa, 0.95);
    g.fillRect(x - 6, y - s * 0.65, 12, s * 0.35);

    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(x, y - s * 0.1, s * 0.18);

    if (this.charging) {
      g.lineStyle(3, 0xff3355, 0.85);
      g.strokeCircle(x, y - s * 0.1, s * 0.42);
      g.lineStyle(2, 0xff99aa, 0.7);
      g.strokeCircle(x, y - s * 0.1, s * 0.62);
    }

    if (this.beamActive) {
      g.fillStyle(0xff3355, 0.22);
      g.fillRect(x - 10, y + s * 0.15, 20, this.scene.scale.height - y);
      g.fillStyle(0xffffff, 0.75);
      g.fillRect(x - 3, y + s * 0.15, 6, this.scene.scale.height - y);
    }

    g.lineStyle(2, 0xff99aa, 0.95);
    g.strokeRect(x - s, y - s * 0.45, s * 2, s * 0.9);

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

    g.lineStyle(1, 0xffb3bf, 0.9);
    g.strokeRect(bx, by, bw, bh);
  }

  isOffScreen() {
    return false;
  }
}