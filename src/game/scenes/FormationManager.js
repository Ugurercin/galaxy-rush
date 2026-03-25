class FormationManager {
  constructor(scene) {
    this.scene  = scene;
    this.ships  = [];
    this.active = false;
    this.dirX   = 1;
    this.baseSpeed = 0.6;
    this.hasSplit  = false;
    this.spawnCount = 0; // debug guard
  }

  reset() {
    this.ships  = [];
    this.active = false;
    this.dirX   = 1;
    this.hasSplit = false;
    this.spawnCount = 0;
  }

  isActive() { return this.active; }

  spawnGrid(cols, rows, enemyType) {
    // Absolute hard guard — never spawn if already active
    if (this.active) return;

    // Safety cap — never create more than 30 ships
    const maxShips = 30;
    const total = cols * rows;
    if (total > maxShips) return;

    const { width } = this.scene.scale;
    const sw = 32, sh = 20, gx = 12, gy = 10;
    const totalW = cols * (sw + gx) - gx;
    const startX = (width - totalW) / 2;

    this.ships = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isElite = (r === 0);
        this.ships.push({
          x:      startX + c * (sw + gx) + sw / 2,
          y:      55 + r * (sh + gy),
          w: sw, h: sh,
          hp:     isElite ? 2 : 1,
          maxHp:  isElite ? 2 : 1,
          alive:  true,
          elite:  isElite,
          type:   enemyType || 'drifter',
          scattered: false,
          vx: 0, vy: 0,
          shootTimer: 0,
        });
      }
    }

    this.active    = true;
    this.hasSplit  = false;
    this.spawnCount++;
  }

  spawnVShape(enemyType) {
    if (this.active) return;

    const { width } = this.scene.scale;
    const cx = width / 2;
    this.ships = [];

    const arms = 4;
    for (let i = 0; i < arms; i++) {
      [-1, 1].forEach(side => {
        this.ships.push({
          x: cx + side * (i * 36 + 18),
          y: 50 + i * 22,
          w: 28, h: 20,
          hp: 1, maxHp: 1,
          alive: true, elite: false,
          type: enemyType || 'chaser',
          scattered: false, vx: 0, vy: 0,
          shootTimer: 0,
        });
      });
    }
    // Tip
    this.ships.push({
      x: cx, y: 50,
      w: 28, h: 20,
      hp: 2, maxHp: 2,
      alive: true, elite: true,
      type: 'shooter',
      scattered: false, vx: 0, vy: 0,
      shootTimer: 0,
    });

    this.active   = true;
    this.hasSplit = false;
    this.spawnCount++;
  }

  update(time, delta) {
    if (!this.active) return;

    const alive = this.ships.filter(s => s.alive);

    if (alive.length === 0) {
      this.active = false;
      return;
    }

    const total      = this.ships.length;
    const ratio      = alive.length / total;
    const speedMult  = 1 + (1 - ratio) * 3.5;
    const speed      = this.baseSpeed * speedMult;

    const inFormation = alive.filter(s => !s.scattered);
    const scattered   = alive.filter(s => s.scattered);

    // ── Formation block movement ───────────────────────────
    if (inFormation.length > 0) {
      const { width } = this.scene.scale;
      let minX = Infinity, maxX = -Infinity;
      inFormation.forEach(s => {
        minX = Math.min(minX, s.x - s.w / 2);
        maxX = Math.max(maxX, s.x + s.w / 2);
      });

      if (maxX >= width - 8)  this.dirX = -1;
      if (minX <= 8)           this.dirX =  1;

      inFormation.forEach(s => {
        s.x += this.dirX * speed;
        s.y += 0.1;
      });

      // ── Split at 50% ──────────────────────────────────────
      if (!this.hasSplit && ratio <= 0.5 && inFormation.length > 1) {
        this.hasSplit = true;
        const half = Math.floor(inFormation.length / 2);
        inFormation.forEach((s, i) => {
          s.scattered = true;
          s.vx = i < half ? -(1.2 + Math.random()) : (1.2 + Math.random());
          s.vy = 0.8 + Math.random() * 0.5;
        });
        this.scene.showMessage('FORMATION SPLIT!', 'Finish them off!', 0xff9900, 1400, null);
      }
    }

    // ── Scattered movement ─────────────────────────────────
    scattered.forEach(s => {
      s.x += s.vx;
      s.y += s.vy;
      const { width } = this.scene.scale;
      if (s.x < s.w / 2)          s.vx =  Math.abs(s.vx);
      if (s.x > width - s.w / 2)  s.vx = -Math.abs(s.vx);
    });

    // Remove ships that fell off bottom
    this.ships.forEach(s => {
      if (s.alive && s.y > this.scene.scale.height + 50) s.alive = false;
    });

    // ── Formation shooters fire at player ──────────────────
    alive.forEach(s => {
      if (s.type !== 'shooter') return;
      s.shootTimer += delta;
      if (s.shootTimer > 2500) {
        s.shootTimer = 0;
        this.scene.fireEnemyBullet(s.x, s.y + s.h / 2, this.scene.ship.x, this.scene.ship.y);
      }
    });
  }

  checkBulletCollisions(bullets) {
    if (!this.active) return bullets;

    const deadBullets = new Set();

    bullets.forEach((b, bi) => {
      this.ships.forEach(s => {
        if (!s.alive) return;
        const dist = Phaser.Math.Distance.Between(b.x, b.y, s.x, s.y);
        if (dist < s.w / 2 + 4) {
          deadBullets.add(bi);
          s.hp--;
          if (s.hp <= 0) {
            s.alive = false;
            this.scene.spawnExplosion(s.x, s.y, s.elite ? 0xff9900 : 0x4488ff);
            const pts = s.elite ? 20 : 10;
            this.scene.score += pts;
            this.scene.coins += pts;
            this.scene.scoreTxt.setText('SCORE  ' + this.scene.score);
            this.scene.coinTxt.setText('COINS  ' + this.scene.coins);
          }
        }
      });
    });

    return bullets.filter((_, i) => !deadBullets.has(i));
  }

  checkPlayerCollision(ship, onHit) {
    if (!this.active) return;
    this.ships.forEach(s => {
      if (!s.alive) return;
      const dist = Phaser.Math.Distance.Between(s.x, s.y, ship.x, ship.y);
      if (dist < s.w / 2 + 12) {
        s.alive = false;
        this.scene.spawnExplosion(s.x, s.y, 0xff3355);
        onHit();
      }
    });
  }

  draw(g) {
    g.clear();
    if (!this.active) return;

    this.ships.forEach(s => {
      if (!s.alive) return;
      const { x, y, w, h } = s;
      const color   = s.elite ? 0xff9900 : 0x4488ff;
      const outline = s.elite ? 0xffcc44 : 0x88aaff;

      g.fillStyle(color, 0.88);
      g.fillRect(x - w / 2, y - h / 2, w, h);

      if (s.elite) {
        g.fillStyle(0xffdd88, 0.4);
        g.fillRect(x - w / 2, y - h / 2, w, 4);
      }

      g.lineStyle(0.8, outline, 0.9);
      g.strokeRect(x - w / 2, y - h / 2, w, h);

      g.fillStyle(s.elite ? 0xffeeaa : 0xaaccff, 1);
      g.fillCircle(x, y, 3);

      if (s.maxHp > 1) {
        g.fillStyle(0x111122, 0.8);
        g.fillRect(x - w / 2, y + h / 2 + 2, w, 3);
        g.fillStyle(0xff9900, 1);
        g.fillRect(x - w / 2, y + h / 2 + 2, w * (s.hp / s.maxHp), 3);
      }
    });
  }
}