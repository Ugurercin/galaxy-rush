class Orbiter extends EnemyBase {
  constructor(scene, wave) {
    const { width } = scene.scale;
    const size = Phaser.Math.Between(18, 24);
    const x = Phaser.Math.Between(size + 30, width - size - 30);
    const y = -size - Phaser.Math.Between(20, 120);
    super(scene, x, y);

    this.type = 'orbiter';
    this.size = size;
    this.hp = 3;
    this.maxHp = 3;
    this.speed = 1.15 + Math.min(1.2, wave * 0.015);
    this.color = 0x8a7dff;
    this.scoreValue = 16;
    this.coinValue = 25;

    this.baseX = x;
    this.orbitT = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.orbitRadius = Phaser.Math.Between(18, 34);
    this.orbitSpeed = 0.035 + Math.min(0.03, wave * 0.0006);

    this.shootTimer = Phaser.Math.Between(0, 900);
    this.shootRate = Math.max(1200, 2200 - wave * 20);
  }

  update(delta) {
    const dt = delta / 16.666;

    this.orbitT += this.orbitSpeed * dt;
    this.y += this.speed * dt;
    this.x = this.baseX + Math.cos(this.orbitT) * this.orbitRadius;

    this.shootTimer += delta;
    if (this.shootTimer >= this.shootRate) {
      this.shootTimer = 0;

      const a1 = this.orbitT;
      const a2 = this.orbitT + 0.35;
      const a3 = this.orbitT - 0.35;

      const tx1 = this.x + Math.cos(a1) * 60;
      const ty1 = this.y + Math.sin(a1) * 60 + 40;
      const tx2 = this.x + Math.cos(a2) * 60;
      const ty2 = this.y + Math.sin(a2) * 60 + 40;
      const tx3 = this.x + Math.cos(a3) * 60;
      const ty3 = this.y + Math.sin(a3) * 60 + 40;

      this.scene.fireEnemyBullet(this.x, this.y, tx1, ty1);
      this.scene.fireEnemyBullet(this.x, this.y, tx2, ty2);
      this.scene.fireEnemyBullet(this.x, this.y, tx3, ty3);
    }
  }

  draw(g) {
    OrbiterRenderer.draw(g, this);
  }
}