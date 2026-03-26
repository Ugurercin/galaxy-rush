class ZigZag extends EnemyBase {
  constructor(scene, wave) {
    const { width } = scene.scale;
    const size = Phaser.Math.Between(16, 22);
    const x    = Phaser.Math.Between(size + 20, width - size - 20);
    const y    = -size;
    super(scene, x, y);

    this.type       = 'zigzag';
    this.size       = size;
    this.hp         = 1;
    this.maxHp      = 1;
    this.speed      = Phaser.Math.FloatBetween(1.6, 2.4) + (wave - 1) * 0.2;
    this.color      = 0x66ff88;
    this.scoreValue = 7;
    this.coinValue  = 6;

    this.baseX      = x;
    this.swingAmp   = Phaser.Math.Between(20, 50);
    this.swingSpeed = Phaser.Math.FloatBetween(0.04, 0.07);
    this.t          = Phaser.Math.FloatBetween(0, Math.PI * 2);
  }

  update(delta) {
    this.y += this.speed;
    this.t += this.swingSpeed * (delta / 16.666);
    this.x  = this.baseX + Math.sin(this.t) * this.swingAmp;

    const minX = this.size + 8;
    const maxX = this.scene.scale.width - this.size - 8;
    this.x = Phaser.Math.Clamp(this.x, minX, maxX);
  }

  draw(g) {
    ZigZagRenderer.draw(g, this);
  }
}