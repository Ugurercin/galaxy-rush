// Tank — wave 4+
// Heavy armored enemy with large HP pool
// Slow, but forces player to spend time clearing it

class Tank extends EnemyBase {
  constructor(scene, wave) {
    const { width } = scene.scale;
    const size = Phaser.Math.Between(24, 32);
    const x    = Phaser.Math.Between(size + 14, width - size - 14);
    const y    = -size;
    super(scene, x, y);

    this.type       = 'tank';
    this.size       = size;
    this.hp         = 6 + Math.floor((wave - 4) * 0.5);
    this.maxHp      = this.hp;
    this.speed      = Phaser.Math.FloatBetween(0.7, 1.2) + (wave - 1) * 0.08;
    this.color      = 0x8899ff;
    this.scoreValue = 20;
    this.coinValue  = 30;
  }

  update(delta) {
    this.y += this.speed;
  }

  draw(g) {
    TankRenderer.draw(g, this);
  }
}