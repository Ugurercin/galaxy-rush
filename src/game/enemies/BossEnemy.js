// BossEnemy.js

class BossEnemy extends EnemyBase {
  constructor(scene, wave) {
    const { width } = scene.scale;
    super(scene, width / 2, -80);

    this.type = 'boss';
    this.waveNumber = wave;
    this.size = 46;

    this.hp = 30 + (wave / 10 - 1) * 18;
    this.maxHp = this.hp;

    this.speed = 1.2;
    this.color = 0xff3355;
    this.scoreValue = 120 + wave * 4;
    this.coinValue = 35 + wave;

    this.entering = true;
    this.targetY = 140;

    this.moveT = 0;
    this.shootTimer = 0;
    this.shootRate = Math.max(550, 1150 - wave * 8);
  }

  update(delta) {
    if (this.entering) {
      this.y += this.speed;
      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.entering = false;
      }
      return;
    }

    this.moveT += 0.02 * (delta / 16.666);
    this.x = this.scene.scale.width / 2 + Math.sin(this.moveT) * 90;

    this.shootTimer += delta;
    if (this.shootTimer >= this.shootRate) {
      this.shootTimer = 0;

      this.scene.fireEnemyBullet(this.x - 18, this.y + 10, this.scene.ship.x, this.scene.ship.y);
      this.scene.fireEnemyBullet(this.x,      this.y + 18, this.scene.ship.x, this.scene.ship.y);
      this.scene.fireEnemyBullet(this.x + 18, this.y + 10, this.scene.ship.x, this.scene.ship.y);
    }
  }

  draw(g) {
    const x = this.x;
    const y = this.y;
    const s = this.size;

    g.fillStyle(0xaa2233, 0.95);
    g.fillRect(x - s, y - s * 0.5, s * 2, s);

    g.fillStyle(0xff5566, 0.9);
    g.fillTriangle(x, y + s * 0.9, x - s * 0.8, y, x + s * 0.8, y);
    g.fillTriangle(x, y - s * 0.9, x - s * 0.65, y - s * 0.2, x + s * 0.65, y - s * 0.2);

    g.fillStyle(0xffcc88, 0.95);
    g.fillCircle(x, y, s * 0.18);

    g.lineStyle(2, 0xff8899, 0.9);
    g.strokeRect(x - s, y - s * 0.5, s * 2, s);

    this.drawBossHPBar(g);
  }

  drawBossHPBar(g) {
    const bw = 200;
    const bh = 10;
    const bx = this.scene.scale.width / 2 - bw / 2;
    const by = 54;

    g.fillStyle(0x1a1a2e, 0.9);
    g.fillRect(bx, by, bw, bh);

    g.fillStyle(0xff3355, 1);
    g.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);

    g.lineStyle(1, 0xff99aa, 0.9);
    g.strokeRect(bx, by, bw, bh);
  }

  isOffScreen() {
    return false;
  }
}