class HiveBoss extends EnemyBase {
  constructor(scene, wave) {
    const { width } = scene.scale;
    super(scene, width / 2, -120);

    this.type = 'hiveBoss';
    this.waveNumber = wave;
    this.size = 60;

    this.hp = 86 + (wave / 10 - 1) * 32;
    this.maxHp = this.hp;

    this.speed = 1.0;
    this.color = 0xb84dff;
    this.scoreValue = 280 + wave * 6;
    this.coinValue = 190 + wave;

    this.entering = true;
    this.targetY = 120;

    this.moveT = 0;

    this.ringTimer = 0;
    this.ringRate = Math.max(1700, 2800 - wave * 7);

    this.spawnTimer = 0;
    this.spawnRate = Math.max(2600, 4200 - wave * 8);
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

    const dt = delta / 16.666;
    this.moveT += 0.018 * dt;
    this.x = this.scene.scale.width / 2 + Math.sin(this.moveT) * 95;

    this.ringTimer += delta;
    if (this.ringTimer >= this.ringRate) {
      this.ringTimer = 0;

      const shots = 8;
      const r = 70;
      for (let i = 0; i < shots; i++) {
        const a = (Math.PI * 2 * i) / shots;
        const tx = this.x + Math.cos(a) * r;
        const ty = this.y + Math.sin(a) * r;
        this.scene.fireEnemyBullet(this.x, this.y, tx, ty);
      }
    }

    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnRate) {
      this.spawnTimer = 0;

      if (typeof Orbiter !== 'undefined') {
        this.scene.enemies.push(new Orbiter(this.scene, this.waveNumber));
      } else if (typeof ZigZag !== 'undefined') {
        this.scene.enemies.push(new ZigZag(this.scene, this.waveNumber));
      }
    }
  }

  draw(g) {
    const x = this.x;
    const y = this.y;
    const s = this.size;

    g.fillStyle(0x4f1d6f, 0.96);
    g.fillCircle(x, y, s * 0.78);

    g.fillStyle(0xb84dff, 0.24);
    g.fillCircle(x, y, s * 1.1);

    for (let i = 0; i < 6; i++) {
      const a = this.moveT * 2 + i * (Math.PI * 2 / 6);
      const px = x + Math.cos(a) * s * 0.92;
      const py = y + Math.sin(a) * s * 0.92;
      g.fillStyle(0xd9a2ff, 0.92);
      g.fillCircle(px, py, s * 0.14);
    }

    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(x, y, s * 0.2);

    g.lineStyle(2, 0xe6c2ff, 0.95);
    g.strokeCircle(x, y, s * 0.78);

    this.drawBossHPBar(g);
  }

  drawBossHPBar(g) {
    const bw = 220;
    const bh = 10;
    const bx = this.scene.scale.width / 2 - bw / 2;
    const by = 54;

    g.fillStyle(0x1a1a2e, 0.9);
    g.fillRect(bx, by, bw, bh);

    g.fillStyle(this.color, 1);
    g.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);

    g.lineStyle(1, 0xf0d8ff, 0.9);
    g.strokeRect(bx, by, bw, bh);
  }

  isOffScreen() {
    return false;
  }
}