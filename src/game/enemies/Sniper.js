class SniperEnemy extends EnemyBase {
  constructor(scene, wave) {
    const { width } = scene.scale;
    const size = Phaser.Math.Between(20, 26);
    const x = Phaser.Math.Between(size + 24, width - size - 24);
    const y = -size - Phaser.Math.Between(10, 100);
    super(scene, x, y);

    this.type = 'sniper';
    this.size = size;
    this.hp = 4;
    this.maxHp = 4;
    this.speed = 0.95;
    this.color = 0xff5577;
    this.scoreValue = 22;
    this.coinValue = 22;

    this.targetY = Phaser.Math.Between(90, 150);
    this.locked = false;

    this.shootTimer = 0;
    this.shootRate = Math.max(1500, 2600 - wave * 18);
    this.aimTime = 650;
    this.aiming = false;
    this.aimTimer = 0;
    this.flash = 0;
  }

  update(delta) {
    const dt = delta / 16.666;

    if (!this.locked) {
      this.y += this.speed * dt;
      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.locked = true;
      }
      return;
    }

    this.flash = Math.max(0, this.flash - delta);

    this.shootTimer += delta;

    if (!this.aiming && this.shootTimer >= this.shootRate) {
      this.aiming = true;
      this.aimTimer = 0;
      this.flash = this.aimTime;
    }

    if (this.aiming) {
      this.aimTimer += delta;
      if (this.aimTimer >= this.aimTime) {
        this.aiming = false;
        this.shootTimer = 0;
        this.flash = 0;

        this.scene.fireEnemyBullet(
          this.x,
          this.y + this.size * 0.6,
          this.scene.ship.x,
          this.scene.ship.y
        );

        this.x += Phaser.Math.Between(-30, 30);
        this.x = Phaser.Math.Clamp(
          this.x,
          this.size + 20,
          this.scene.scale.width - this.size - 20
        );
      }
    }
  }

  draw(g) {
    SniperRenderer.draw(g, this);
  }
}