// Splitter — wave 4+
// Diamond shape, tough HP pool
// Splits into 2 smaller fast Drifters on death
// Creates sudden extra pressure when killed
//
// ── Tune these ───────────────────────────────────────────
// hp           — health pool (higher = more bullets to kill)
// speed        — fall speed
// childSizeMult — size of child Drifters relative to parent (0–1)
// childSpeedMult — speed of child Drifters relative to parent

class Splitter extends EnemyBase {
  constructor(scene, wave) {
    const { width } = scene.scale;
    const size = Phaser.Math.Between(22, 30);
    const x    = Phaser.Math.Between(size + 10, width - size - 10);
    const y    = -size;
    super(scene, x, y);

    // ── Stats ─────────────────────────────────────────────
    this.type       = 'splitter';
    this.size       = size;
    this.hp         = 3;
    this.maxHp      = 3;
    this.speed      = Phaser.Math.FloatBetween(1.0, 1.8);
    this.color      = 0x00ccff;
    this.scoreValue = 15;
    this.coinValue  = 15;

    // ── Split config ──────────────────────────────────────
    this.hasSplit       = false;
    this.childSizeMult  = 0.55;
    this.childSpeedMult = 1.8;
  }

  update(delta) {
    this.y += this.speed;
  }

  onDeath() {
    super.onDeath();

    // Spawn two smaller Drifters on death
    if (!this.hasSplit) {
      this.hasSplit = true;
      const childSize  = Math.floor(this.size * this.childSizeMult);
      const childSpeed = this.speed * this.childSpeedMult;
      const left  = Drifter.spawnAt(this.scene, this.x - 12, this.y, childSize, childSpeed);
      const right = Drifter.spawnAt(this.scene, this.x + 12, this.y, childSize, childSpeed);
      this.scene.enemies.push(left, right);
    }
  }

  draw(g) {
    SplitterRenderer.draw(g, this);
  }
}