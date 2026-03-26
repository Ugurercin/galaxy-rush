// Drifter — wave 1+
// Floats straight down, most common enemy
// Low HP, high drop rate, predictable
//
// ── Tune these ───────────────────────────────────────────
// sizeMin/Max  — random size range
// baseSpeed    — base fall speed
// speedWaveInc — extra speed added per wave
// scoreValue   — points on kill
// coinValue    — coins dropped on kill

class Drifter extends EnemyBase {
  constructor(scene, wave) {
    const { width } = scene.scale;
    const size = Phaser.Math.Between(18, 26);
    const x    = Phaser.Math.Between(size + 10, width - size - 10);
    const y    = -size;
    super(scene, x, y);

    // ── Stats ─────────────────────────────────────────────
    this.type       = 'drifter';
    this.size       = size;
    this.hp         = 1;
    this.maxHp      = 1;
    this.speed      = Phaser.Math.FloatBetween(1.2, 2.2) + (wave - 1) * 0.25;
    this.color      = 0xff3355;
    this.scoreValue = 5;
    this.coinValue  = 5;
  }

  // Can also be spawned at a specific position (used by Splitter children)
  static spawnAt(scene, x, y, size, speed) {
    const d = new Drifter(scene, 1);
    d.x     = x;
    d.y     = y;
    d.size  = size;
    d.speed = speed;
    return d;
  }

  update(delta) {
    this.y += this.speed;
  }

  draw(g) {
    DrifterRenderer.draw(g, this);
  }
}