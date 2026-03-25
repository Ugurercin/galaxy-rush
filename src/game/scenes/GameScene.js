class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.scale;

    // ── State ──────────────────────────────────────────────
    this.score       = 0;
    this.playerHP    = 3;
    this.isPointerDown = false;
    this.targetX     = width / 2;
    this.targetY     = height * 0.8;
    this.lastFired   = 0;
    this.fireRate    = 500;
    this.lastSpawned = 0;
    this.spawnRate   = 1800; // ms between enemy spawns
    this.invincible  = false; // brief invincibility after hit

    // ── Starfield ──────────────────────────────────────────
    this.stars = [];
    const starCounts = [80, 50, 25];
    const starSpeeds = [0.3, 0.7, 1.2];
    const starSizes  = [0.8, 1.2, 1.8];
    const starAlphas = [0.4, 0.6, 1.0];
    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < starCounts[layer]; i++) {
        this.stars.push({
          x: Phaser.Math.Between(0, width),
          y: Phaser.Math.Between(0, height),
          speed: starSpeeds[layer],
          size:  starSizes[layer],
          alpha: starAlphas[layer],
        });
      }
    }

    // ── Graphics layers (order matters for depth) ──────────
    this.bgGraphics     = this.add.graphics();
    this.enemyGraphics  = this.add.graphics();
    this.bulletGraphics = this.add.graphics();
    this.shipGraphics   = this.add.graphics();
    this.fxGraphics     = this.add.graphics(); // particles/flash

    // ── Game object arrays ─────────────────────────────────
    this.bullets = [];
    this.enemies = [];
    this.particles = [];

    // ── Player ─────────────────────────────────────────────
    this.ship = {
      x: width / 2,
      y: height * 0.8,
      w: 28,
      h: 36,
    };

    // ── HUD ────────────────────────────────────────────────
    this.scoreTxt = this.add.text(20, 20, 'SCORE  0', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#c8d8f0',
    });

    this.hpTxt = this.add.text(width - 20, 20, '♥ ♥ ♥', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ff3355',
    }).setOrigin(1, 0);

    // ── Input ──────────────────────────────────────────────
    this.input.on('pointerdown', (p) => {
      this.isPointerDown = true;
      this.targetX = p.x;
      this.targetY = p.y;
    });
    this.input.on('pointermove', (p) => {
      if (!this.isPointerDown) return;
      this.targetX = p.x;
      this.targetY = p.y;
    });
    this.input.on('pointerup', () => {
      this.isPointerDown = false;
    });
  }

  update(time, delta) {
    const { width, height } = this.scale;

    // ── Move ship ──────────────────────────────────────────
    if (this.isPointerDown) {
      this.ship.x += (this.targetX - this.ship.x) * 0.18;
      this.ship.y += (this.targetY - this.ship.y) * 0.18;
    }
    const hw = this.ship.w / 2;
    const hh = this.ship.h / 2;
    this.ship.x = Phaser.Math.Clamp(this.ship.x, hw + 10, width  - hw - 10);
    this.ship.y = Phaser.Math.Clamp(this.ship.y, hh + 60, height - hh - 20);

    // ── Auto fire ──────────────────────────────────────────
    if (time > this.lastFired + this.fireRate) {
      this.bullets.push({
        x: this.ship.x,
        y: this.ship.y - this.ship.h / 2,
        speed: 10,
      });
      this.lastFired = time;
    }

    // ── Spawn enemies ──────────────────────────────────────
    if (time > this.lastSpawned + this.spawnRate) {
      this.spawnDrifter();
      this.lastSpawned = time;
    }

    // ── Update bullets ─────────────────────────────────────
    this.bullets = this.bullets.filter(b => {
      b.y -= b.speed;
      return b.y > -20;
    });

    // ── Update enemies ─────────────────────────────────────
    this.enemies = this.enemies.filter(e => {
      e.y += e.speed;
      // Enemy reached bottom — just remove it
      return e.y < height + 40;
    });

    // ── Update particles ───────────────────────────────────
    this.particles = this.particles.filter(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.08; // gravity
      p.life--;
      p.alpha = p.life / p.maxLife;
      return p.life > 0;
    });

    // ── Collisions ─────────────────────────────────────────
    this.checkBulletEnemyCollisions();
    this.checkPlayerEnemyCollisions();

    // ── Stars ──────────────────────────────────────────────
    this.stars.forEach(s => {
      s.y += s.speed;
      if (s.y > height) {
        s.y = 0;
        s.x = Phaser.Math.Between(0, width);
      }
    });

    // ── Draw ───────────────────────────────────────────────
    this.drawBackground();
    this.drawEnemies();
    this.drawBullets();
    this.drawShip();
    this.drawParticles();
  }

  // ── Spawn ─────────────────────────────────────────────────
  spawnDrifter() {
    const { width } = this.scale;
    const size = Phaser.Math.Between(18, 26);
    this.enemies.push({
      type:  'drifter',
      x:     Phaser.Math.Between(size + 10, width - size - 10),
      y:     -size,
      size,
      hp:    1,
      maxHp: 1,
      speed: Phaser.Math.FloatBetween(1.2, 2.2),
      color: 0xff3355,
    });
  }

  // ── Collisions ────────────────────────────────────────────
  checkBulletEnemyCollisions() {
    const toRemoveBullets  = new Set();
    const toRemoveEnemies  = new Set();

    this.bullets.forEach((b, bi) => {
      this.enemies.forEach((e, ei) => {
        const dist = Phaser.Math.Distance.Between(b.x, b.y, e.x, e.y);
        if (dist < e.size) {
          toRemoveBullets.add(bi);
          e.hp--;
          if (e.hp <= 0) {
            toRemoveEnemies.add(ei);
            this.spawnExplosion(e.x, e.y, e.color);
            this.score += 5;
            this.scoreTxt.setText('SCORE  ' + this.score);
          }
        }
      });
    });

    this.bullets = this.bullets.filter((_, i) => !toRemoveBullets.has(i));
    this.enemies = this.enemies.filter((_, i) => !toRemoveEnemies.has(i));
  }

  checkPlayerEnemyCollisions() {
    if (this.invincible) return;

    const toRemoveEnemies = new Set();

    this.enemies.forEach((e, ei) => {
      const dist = Phaser.Math.Distance.Between(
        this.ship.x, this.ship.y, e.x, e.y
      );
      // Hitbox is smaller than visual — forgiving collision
      if (dist < e.size * 0.7 + 10) {
        toRemoveEnemies.add(ei);
        this.spawnExplosion(e.x, e.y, 0xff3355);
        this.takeDamage();
      }
    });

    this.enemies = this.enemies.filter((_, i) => !toRemoveEnemies.has(i));
  }

  takeDamage() {
    this.playerHP--;
    this.updateHPDisplay();

    if (this.playerHP <= 0) {
      this.scene.start('GameOverScene', {
        score: this.score,
        coins: Math.floor(this.score / 5),
      });
      return;
    }

    // Brief invincibility flash
    this.invincible = true;
    this.time.delayedCall(1500, () => {
      this.invincible = false;
    });
  }

  updateHPDisplay() {
    const hearts = '♥ '.repeat(this.playerHP).trim() || '✕';
    this.hpTxt.setText(hearts);
  }

  // ── Explosion particles ───────────────────────────────────
  spawnExplosion(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.FloatBetween(1, 4);
      this.particles.push({
        x, y,
        vx:      Math.cos(angle) * speed,
        vy:      Math.sin(angle) * speed - 1,
        size:    Phaser.Math.FloatBetween(1.5, 3.5),
        color,
        life:    Phaser.Math.Between(20, 40),
        maxLife: 40,
        alpha:   1,
      });
    }
  }

  // ── Draw ──────────────────────────────────────────────────
  drawBackground() {
    const { width, height } = this.scale;
    const g = this.bgGraphics;
    g.clear();
    g.fillStyle(0x060a12, 1);
    g.fillRect(0, 0, width, height);
    this.stars.forEach(s => {
      g.fillStyle(0xffffff, s.alpha);
      g.fillRect(s.x, s.y, s.size, s.size);
    });
  }

  drawEnemies() {
    const g = this.enemyGraphics;
    g.clear();

    this.enemies.forEach(e => {
      const s = e.size;

      // Body
      g.fillStyle(e.color, 0.9);
      g.fillTriangle(
        e.x,         e.y + s,    // bottom
        e.x - s,     e.y - s * 0.5, // top-left
        e.x + s,     e.y - s * 0.5  // top-right
      );

      // Wing left
      g.fillStyle(e.color, 0.6);
      g.fillTriangle(
        e.x - s * 0.3, e.y + s * 0.2,
        e.x - s * 1.1, e.y + s * 0.8,
        e.x - s * 0.2, e.y + s * 0.9
      );

      // Wing right
      g.fillStyle(e.color, 0.6);
      g.fillTriangle(
        e.x + s * 0.3, e.y + s * 0.2,
        e.x + s * 1.1, e.y + s * 0.8,
        e.x + s * 0.2, e.y + s * 0.9
      );

      // Outline
      g.lineStyle(0.8, 0xff6680, 0.7);
      g.strokeTriangle(
        e.x,     e.y + s,
        e.x - s, e.y - s * 0.5,
        e.x + s, e.y - s * 0.5
      );

      // Core glow
      g.fillStyle(0xff8899, 0.8);
      g.fillCircle(e.x, e.y + s * 0.1, s * 0.22);
    });
  }

  drawBullets() {
    const g = this.bulletGraphics;
    g.clear();
    this.bullets.forEach(b => {
      g.fillStyle(0xffe066, 0.25);
      g.fillRect(b.x - 3, b.y - 6, 6, 16);
      g.fillStyle(0xffe066, 1);
      g.fillRect(b.x - 2, b.y - 5, 4, 14);
      g.fillStyle(0xffffff, 0.9);
      g.fillRect(b.x - 1, b.y - 5, 2, 4);
    });
  }

  drawShip() {
    const g = this.shipGraphics;
    g.clear();

    // Flash on damage — skip drawing every other frame
    if (this.invincible && Math.floor(this.time.now / 120) % 2 === 0) return;

    const { x, y, w, h } = this.ship;

    // Engine trail
    g.fillStyle(0x00e5ff, 0.12);
    g.fillTriangle(x, y + h * 0.5, x - w * 0.3, y + h * 1.1, x + w * 0.3, y + h * 1.1);
    g.fillStyle(0x00e5ff, 0.25);
    g.fillTriangle(x, y + h * 0.5, x - w * 0.18, y + h * 0.95, x + w * 0.18, y + h * 0.95);

    // Hull
    g.fillStyle(0x0d2a4a, 1);
    g.fillTriangle(x, y - h * 0.5, x - w * 0.5, y + h * 0.5, x + w * 0.5, y + h * 0.5);

    // Wings
    g.fillStyle(0x0a2040, 1);
    g.fillTriangle(x - w * 0.2, y + h * 0.1, x - w * 0.7, y + h * 0.55, x - w * 0.1, y + h * 0.5);
    g.fillStyle(0x0a2040, 1);
    g.fillTriangle(x + w * 0.2, y + h * 0.1, x + w * 0.7, y + h * 0.55, x + w * 0.1, y + h * 0.5);

    // Outline
    g.lineStyle(1, 0x00e5ff, 0.8);
    g.strokeTriangle(x, y - h * 0.5, x - w * 0.5, y + h * 0.5, x + w * 0.5, y + h * 0.5);

    // Cockpit
    g.fillStyle(0x00e5ff, 0.6);
    g.fillTriangle(x, y - h * 0.25, x - w * 0.15, y + h * 0.1, x + w * 0.15, y + h * 0.1);

    // Engine dots
    g.fillStyle(0x00e5ff, 0.9);
    g.fillCircle(x - w * 0.18, y + h * 0.45, 2.5);
    g.fillCircle(x + w * 0.18, y + h * 0.45, 2.5);
  }

  drawParticles() {
    const g = this.fxGraphics;
    g.clear();
    this.particles.forEach(p => {
      g.fillStyle(p.color, p.alpha);
      g.fillCircle(p.x, p.y, p.size);
    });
  }
}