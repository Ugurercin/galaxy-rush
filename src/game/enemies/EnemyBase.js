// EnemyBase — shared base class all enemies extend
// Override stats, update(), and draw() in subclasses
// Do not instantiate directly

class EnemyBase {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x     = x;
    this.y     = y;

    // ── Override these in subclasses ─────────────────────
    this.type      = 'base';
    this.hp        = 1;
    this.maxHp     = 1;
    this.speed     = 1;
    this.size      = 20;
    this.color     = 0xffffff;
    this.scoreValue = 5;
    this.coinValue  = 5;
    this.alive      = true;
  }

  // Called every frame by GameScene — override in subclass for AI
  update(delta) {
    this.y += this.speed;
  }

  // Called every frame by GameScene — override in subclass for visuals
  draw(g) {}

  // Called when this enemy takes a bullet hit
  takeBulletHit(damage = 1) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.alive = false;
      this.onDeath();
    } else {
      soundManager.play('hit');
    }
  }

  // Called on death — override for special death behavior (splitting etc.)
  onDeath() {
    this.scene.spawnExplosion(this.x, this.y, this.color);
    soundManager.play('explosion');
    this.scene.score += this.scoreValue;
    this.scene.scoreTxt.setText('SCORE  ' + this.scene.score);
    this.scene.spawnCoinDrops(this.x, this.y, this.coinValue);
  }

  // Draw HP bar for multi-HP enemies — call from draw() if needed
  drawHPBar(g) {
    if (this.maxHp <= 1) return;
    const bw = this.size * 2;
    const bx = this.x - this.size;
    const by = this.y + this.size + 4;
    g.fillStyle(0x1a1a2e, 0.8);
    g.fillRect(bx, by, bw, 3);
    g.fillStyle(this.color, 1);
    g.fillRect(bx, by, bw * (this.hp / this.maxHp), 3);
  }

  // Check if this enemy is off screen (should be removed)
  isOffScreen() {
    return this.y > this.scene.scale.height + 60;
  }
}