// Chaser — wave 3+
// Locks onto player X position and dives fast
// Punishes staying still — forces constant movement
//
// ── Tune these ───────────────────────────────────────────
// baseSpeed      — fall speed
// chaseSpeed     — how fast it tracks player X per frame
// speedWaveInc   — extra speed per wave

class Chaser extends EnemyBase {
  constructor(scene, wave) {
    const { width } = scene.scale;
    const size = Phaser.Math.Between(16, 22);
    const x    = Phaser.Math.Between(size + 10, width - size - 10);
    const y    = -size;
    super(scene, x, y);

    // ── Stats ─────────────────────────────────────────────
    this.type       = 'chaser';
    this.size       = size;
    this.hp         = 2;
    this.maxHp      = 2;
    this.speed      = Phaser.Math.FloatBetween(2.5, 4.0) + (wave - 1) * 0.3;
    this.chaseSpeed = 3 + (wave - 1) * 0.5;
    this.color      = 0xcc44ff;
    this.scoreValue = 12;
    this.coinValue  = 20;
  }

  update(delta) {
    // Fall downward
    this.y += this.speed;

    // Track player X position
    const dx = this.scene.ship.x - this.x;
    this.x  += Math.sign(dx) * Math.min(Math.abs(dx), this.chaseSpeed);
  }

  draw(g) {
    ChaserRenderer.draw(g, this);
  }
}