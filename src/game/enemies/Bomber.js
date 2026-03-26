// Bomber — wave 3+
// Drifts downward and periodically fires at the player
// More mobile than Shooter, less tanky than Tank

class Bomber extends EnemyBase {
  constructor(scene, wave) {
    const { width } = scene.scale;
    const size = Phaser.Math.Between(20, 26);
    const x    = Phaser.Math.Between(size + 20, width - size - 20);
    const y    = -size;
    super(scene, x, y);

    this.type       = 'bomber';
    this.size       = size;
    this.hp         = 2;
    this.maxHp      = 2;
    this.speed      = Phaser.Math.FloatBetween(1.1, 1.8) + (wave - 1) * 0.15;
    this.color      = 0xff6644;
    this.scoreValue = 13;
    this.coinValue  = 12;

    this.shootTimer = Phaser.Math.Between(0, 800);
    this.shootRate  = Math.max(850, 1800 - (wave - 1) * 120);
  }

  update(delta) {
    this.y += this.speed;

    this.shootTimer += delta;
    if (this.shootTimer >= this.shootRate) {
      this.shootTimer = 0;

      this.scene.fireEnemyBullet(
        this.x,
        this.y + this.size * 0.5,
        this.scene.ship.x,
        this.scene.ship.y
      );
    }
  }

  draw(g) {
    BomberRenderer.draw(g, this);
  }
}