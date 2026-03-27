// Shooter — wave 2+
// Sits near top of screen, fires aimed bullets at the player
// Must be prioritized — stationary but dangerous
//
// ── Tune these ───────────────────────────────────────────
// baseShootRate  — ms between shots (decreases per wave = faster firing)
// bulletSpeed    — speed of fired bullets

class Shooter extends EnemyBase {
  constructor(scene, wave) {
    const { width } = scene.scale;
    const size = Phaser.Math.Between(20, 28);
    const x    = Phaser.Math.Between(size + 20, width - size - 20);
    const y    = size + 20;
    super(scene, x, y);

    // ── Stats ─────────────────────────────────────────────
    this.type       = 'shooter';
    this.size       = size;
    this.hp         = 2;
    this.maxHp      = 2;
    this.speed      = 0;  // stationary
    this.color      = 0xff9900;
    this.scoreValue = 10;
    this.coinValue  = 15;

    // ── Shoot behavior ────────────────────────────────────
    this.shootTimer = 0;
    this.shootRate  = Math.max(800, 2000 - (wave - 1) * 150);
  }

  update(delta) {
    // Stationary — only fires
    this.shootTimer += delta;
    if (this.shootTimer >= this.shootRate) {
      this.shootTimer = 0;
      this.scene.fireEnemyBullet(
        this.x, this.y,
        this.scene.ship.x, this.scene.ship.y
      );
    }
  }

  draw(g) {
    ShooterRenderer.draw(g, this);
  }
}