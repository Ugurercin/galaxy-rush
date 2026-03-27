class CrusherBoss extends EnemyBase {
  constructor(scene, wave) {
    const { width } = scene.scale;
    super(scene, width / 2, -120);

    this.type = 'crusherBoss';
    this.waveNumber = wave;
    this.size = 62;

    this.hp = 70 + (wave / 10 - 1) * 28;
    this.maxHp = this.hp;

    this.speed = 0.95;
    this.color = 0xffaa22;
    this.scoreValue = 240 + wave * 6;
    this.coinValue = 170 + wave;

    this.entering = true;
    this.targetY = 120;

    this.moveT = 0;
    this.state = 'idle';
    this.stateTimer = 0;

    this.idleDuration = 1400;
    this.chargeDuration = 650;
    this.dashSpeed = 7.5;
    this.dashVX = 0;
    this.dashVY = 0;
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
    this.stateTimer += delta;

    if (this.state === 'idle') {
      this.moveT += 0.02 * dt;
      this.x = this.scene.scale.width / 2 + Math.sin(this.moveT) * 70;

      if (this.stateTimer >= this.idleDuration) {
        this.state = 'charge';
        this.stateTimer = 0;
      }
    } else if (this.state === 'charge') {
      if (this.stateTimer >= this.chargeDuration) {
        const dx = this.scene.ship.x - this.x;
        const dy = this.scene.ship.y - this.y;
        const len = Math.max(1, Math.hypot(dx, dy));
        this.dashVX = (dx / len) * this.dashSpeed;
        this.dashVY = (dy / len) * this.dashSpeed;
        this.state = 'dash';
        this.stateTimer = 0;
      }
    } else if (this.state === 'dash') {
      this.x += this.dashVX * dt;
      this.y += this.dashVY * dt;

      if (
        this.x < 40 ||
        this.x > this.scene.scale.width - 40 ||
        this.y < 60 ||
        this.y > this.scene.scale.height * 0.55
      ) {
        this.x = Phaser.Math.Clamp(this.x, 40, this.scene.scale.width - 40);
        this.y = Phaser.Math.Clamp(this.y, 70, this.scene.scale.height * 0.55);
        this.state = 'recover';
        this.stateTimer = 0;

        for (let i = -2; i <= 2; i++) {
          this.scene.fireEnemyBullet(
            this.x,
            this.y,
            this.scene.ship.x + i * 30,
            this.scene.ship.y
          );
        }
      }
    } else if (this.state === 'recover') {
      if (this.stateTimer >= 700) {
        this.state = 'idle';
        this.stateTimer = 0;
      }
    }
  }

  draw(g) {
    const x = this.x;
    const y = this.y;
    const s = this.size;

    g.fillStyle(0x6a3d00, 0.95);
    g.fillRect(x - s * 0.95, y - s * 0.5, s * 1.9, s);

    g.fillStyle(0xffaa22, 0.92);
    g.fillTriangle(x, y + s * 0.95, x - s * 0.7, y + s * 0.15, x + s * 0.7, y + s * 0.15);

    g.fillStyle(0xffcc66, 0.9);
    g.fillRect(x - s * 1.2, y - s * 0.15, s * 0.28, s * 0.3);
    g.fillRect(x + s * 0.92, y - s * 0.15, s * 0.28, s * 0.3);

    if (this.state === 'charge') {
      g.fillStyle(0xff5522, 0.35);
      g.fillCircle(x, y, s * 1.2);
    }

    g.fillStyle(0xfff0b0, 0.95);
    g.fillCircle(x, y, s * 0.17);

    g.lineStyle(2, 0xffd088, 0.95);
    g.strokeRect(x - s * 0.95, y - s * 0.5, s * 1.9, s);

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

    g.lineStyle(1, 0xffdd99, 0.9);
    g.strokeRect(bx, by, bw, bh);
  }

  isOffScreen() {
    return false;
  }
}