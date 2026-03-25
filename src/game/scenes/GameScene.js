class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    // Carry state from ShopScene or start fresh
    this.startWave   = data.wave      || 1;
    this.score       = data.score     || 0;
    this.coins       = data.coins     || 0;
    this.playerHP    = data.playerHP  || 3;
    this.maxHP       = data.maxHP     || 3;
    this.inventory   = data.inventory || [null, null, null];
  }

  create() {
    const { width, height } = this.scale;

    // ── Powerup flags ──────────────────────────────────────
    this.fireRate       = 500;
    this.spreadShot     = false;
    this.hasShield      = false;
    this.ghostMode      = false;
    this.coinMagnet     = false;
    this.coinMultiplier = 1;
    this.activePowerup  = null;
    this.powerupTimeLeft = 0;

    // ── Wave state ─────────────────────────────────────────
    this.wave            = this.startWave;
    this.maxWaves        = 5;
    this.wavePhase       = 'idle';
    this.enemiesLeft     = 0;
    this.lastSpawned     = 0;
    this.spawnInterval   = 1600;
    this.waveClearLocked = false;
    this.invincible      = false;

    // ── Managers ───────────────────────────────────────────
    this.formation = new FormationManager(this);

    // ── Input / ship ───────────────────────────────────────
    this.isPointerDown = false;
    this.targetX  = width / 2;
    this.targetY  = height * 0.75;
    this.lastFired = 0;
    this.ship = { x: width / 2, y: height * 0.75, w: 28, h: 36 };

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

    // ── Graphics layers ────────────────────────────────────
    this.bgGraphics      = this.add.graphics();
    this.formationGfx    = this.add.graphics();
    this.enemyGraphics   = this.add.graphics();
    this.bulletGraphics  = this.add.graphics();
    this.eBulletGraphics = this.add.graphics();
    this.shipGraphics    = this.add.graphics();
    this.fxGraphics      = this.add.graphics();
    this.hudGraphics     = this.add.graphics();

    // ── Arrays ─────────────────────────────────────────────
    this.bullets      = [];
    this.enemyBullets = [];
    this.enemies      = [];
    this.particles    = [];

    // ── HUD text ───────────────────────────────────────────
    this.scoreTxt = this.add.text(20, 20, 'SCORE  ' + this.score, {
      fontSize: '14px', fontFamily: 'monospace', color: '#c8d8f0',
    });
    this.coinTxt = this.add.text(20, 42, 'COINS  ' + this.coins, {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffeb3b',
    });
    this.hpTxt = this.add.text(width - 20, 20, '♥ '.repeat(this.playerHP).trim(), {
      fontSize: '16px', fontFamily: 'monospace', color: '#ff3355',
    }).setOrigin(1, 0);
    this.waveTxt = this.add.text(width / 2, 20, `WAVE  ${this.wave} / ${this.maxWaves}`, {
      fontSize: '13px', fontFamily: 'monospace', color: '#c8d8f0',
    }).setOrigin(0.5, 0);
    this.centerMsg = this.add.text(width / 2, height * 0.38, '', {
      fontSize: '22px', fontFamily: 'monospace', color: '#00e5ff',
      fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5).setAlpha(0).setDepth(10);
    this.subMsg = this.add.text(width / 2, height * 0.38 + 36, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffeb3b', align: 'center',
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    // ── Powerup timer bar ──────────────────────────────────
    this.powerupBarGfx = this.add.graphics().setDepth(15);
    this.powerupBarTxt = this.add.text(width / 2, height - 86, '', {
      fontSize: '10px', fontFamily: 'monospace', color: '#c8d8f0',
    }).setOrigin(0.5, 1).setDepth(15).setAlpha(0);

    // ── Inventory slots HUD ────────────────────────────────
    this.buildInventoryHUD();

    // ── Input ──────────────────────────────────────────────
    this.input.on('pointerdown', (p) => {
      // Don't move ship if tapping inventory area
      if (p.y > this.scale.height - 72) return;
      this.isPointerDown = true; this.targetX = p.x; this.targetY = p.y;
    });
    this.input.on('pointermove', (p) => {
      if (p.y > this.scale.height - 72) return;
      if (this.isPointerDown) { this.targetX = p.x; this.targetY = p.y; }
    });
    this.input.on('pointerup', () => { this.isPointerDown = false; });

    this.beginWave(this.wave);
  }

  // ══════════════════════════════════════════════════════════
  // INVENTORY HUD — 3 tappable slots at bottom
  // ══════════════════════════════════════════════════════════

  buildInventoryHUD() {
    const { width, height } = this.scale;
    const slotW = 88, slotH = 44, gap = 10;
    const totalW = 3 * slotW + 2 * gap;
    const startX = (width - totalW) / 2;
    const y = height - 58;

    this.slotButtons = [];

    for (let i = 0; i < 3; i++) {
      const sx = startX + i * (slotW + gap);
      const type = this.inventory[i];

      const btn = this.add.rectangle(sx + slotW / 2, y + slotH / 2, slotW, slotH, 0x0a1628)
        .setStrokeStyle(0.8, type ? this.getItemColor(type) : 0x1a2a3a)
        .setDepth(12)
        .setInteractive({ useHandCursor: !!type });

      const label = this.add.text(sx + slotW / 2, y + slotH / 2,
        type ? this.getItemLabel(type) : 'EMPTY', {
          fontSize: '9px', fontFamily: 'monospace',
          color: type ? '#' + this.getItemColor(type).toString(16).padStart(6, '0') : 'rgba(200,216,240,0.2)',
          fontStyle: type ? 'bold' : 'normal',
          align: 'center', wordWrap: { width: slotW - 8 },
        }).setOrigin(0.5).setDepth(13);

      if (type) {
        btn.on('pointerdown', () => this.activateSlot(i));
        btn.on('pointerover', () => btn.setFillStyle(0x0d2040));
        btn.on('pointerout',  () => btn.setFillStyle(0x0a1628));
      }

      this.slotButtons.push({ btn, label, slot: i });
    }
  }

  activateSlot(slotIndex) {
    const type = this.inventory[slotIndex];
    if (!type) return;

    // Apply powerup effect
    this.applyPowerup(type);

    // Clear the slot
    this.inventory[slotIndex] = null;
    this.refreshInventoryHUD();
  }

  applyPowerup(type) {
    // Deactivate previous timed powerup
    if (this.activePowerup) this.removePowerup(this.activePowerup);

    const powerupDefs = {
      rapidfire:  { duration: 8000,  apply: (s) => { s.fireRate = 180; },       remove: (s) => { s.fireRate = 500; } },
      spreadshot: { duration: 10000, apply: (s) => { s.spreadShot = true; },    remove: (s) => { s.spreadShot = false; } },
      shield:     { duration: -1,    apply: (s) => { s.hasShield = true; },      remove: (s) => { s.hasShield = false; } },
      screenbomb: { duration: -1,    apply: (s) => { s.triggerScreenBomb(); },   remove: () => {} },
      coinmagnet: { duration: 12000, apply: (s) => { s.coinMagnet = true; },     remove: (s) => { s.coinMagnet = false; } },
      ghostmode:  { duration: 5000,  apply: (s) => { s.ghostMode = true; s.invincible = true; s.coinMultiplier = 2; },
                                     remove: (s) => { s.ghostMode = false; s.invincible = false; s.coinMultiplier = 1; } },
    };

    const def = powerupDefs[type];
    if (!def) return;

    def.apply(this);
    this.showPickupText(type);

    if (def.duration > 0) {
      this.activePowerup   = type;
      this.powerupTimeLeft = def.duration;
      this.powerupDuration = def.duration;
      this.powerupRemoveFn = def.remove;
      this.powerupBarTxt.setAlpha(1);
    }
  }

  removePowerup(type) {
    if (this.powerupRemoveFn) this.powerupRemoveFn(this);
    this.activePowerup   = null;
    this.powerupTimeLeft = 0;
    this.powerupBarGfx.clear();
    this.powerupBarTxt.setAlpha(0);
    this.powerupRemoveFn = null;
  }

  triggerScreenBomb() {
    this.enemies.forEach(e => {
      this.spawnExplosion(e.x, e.y, e.color);
      const pts = { drifter: 5, shooter: 10, chaser: 12, splitter: 15 };
      const p = pts[e.type] || 5;
      this.score += p; this.coins += p;
    });
    this.enemies = [];
    if (this.formation && this.formation.isActive()) {
      this.formation.ships.forEach(s => {
        if (s.alive) { this.spawnExplosion(s.x, s.y, 0x4488ff); this.score += 10; this.coins += 10; }
        s.alive = false;
      });
    }
    this.scoreTxt.setText('SCORE  ' + this.score);
    this.coinTxt.setText('COINS  ' + this.coins);
    const flash = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xffffff)
      .setOrigin(0).setAlpha(0.5).setDepth(20);
    this.tweens.add({ targets: flash, alpha: 0, duration: 400, onComplete: () => flash.destroy() });
  }

  refreshInventoryHUD() {
    this.slotButtons.forEach(({ btn, label, slot }) => {
      btn.destroy(); label.destroy();
    });
    this.slotButtons = [];
    this.buildInventoryHUD();
  }

  showPickupText(type) {
    const label = this.getItemLabel(type);
    const color = '#' + this.getItemColor(type).toString(16).padStart(6, '0');
    const { width, height } = this.scale;
    const txt = this.add.text(width / 2, height - 90, label + ' ACTIVATED!', {
      fontSize: '13px', fontFamily: 'monospace', color, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({
      targets: txt, y: height - 140, alpha: 0, duration: 1000,
      ease: 'Power2', onComplete: () => txt.destroy(),
    });
  }

  getItemLabel(type) {
    const labels = {
      rapidfire: 'RAPID FIRE', spreadshot: 'SPREAD SHOT', shield: 'SHIELD',
      screenbomb: 'SCREEN BOMB', coinmagnet: 'COIN MAGNET', ghostmode: 'GHOST MODE',
    };
    return labels[type] || type.toUpperCase();
  }

  getItemColor(type) {
    const colors = {
      rapidfire: 0x00e5ff, spreadshot: 0xe040fb, shield: 0x69ff47,
      screenbomb: 0xff6d00, coinmagnet: 0xffeb3b, ghostmode: 0xce93d8,
    };
    return colors[type] || 0xffffff;
  }

  // ══════════════════════════════════════════════════════════
  // WAVE SYSTEM
  // ══════════════════════════════════════════════════════════

  beginWave(waveNum) {
    this.enemies      = [];
    this.enemyBullets = [];
    this.bullets      = [];
    this.enemiesLeft  = 0;
    this.waveClearLocked = false;
    this.formation.reset();

    this.wave = waveNum;
    this.waveTxt.setText(`WAVE  ${waveNum} / ${this.maxWaves}`);
    this.spawnInterval = Math.max(600, 1600 - (waveNum - 1) * 200);

    const waveDefs = {
      1: { enemies: 8,  formation: null },
      2: { enemies: 12, formation: null },
      3: { enemies: 16, formation: null },
      4: { enemies: 6,  formation: 'grid' },
      5: { enemies: 4,  formation: 'vshape' },
    };

    const def = waveDefs[waveNum] || { enemies: 8, formation: null };
    this.enemiesLeft = def.enemies;
    this.wavePhase   = 'spawning';

    if (def.formation === 'grid') {
      this.formation.spawnGrid(6, 3, 'drifter');
      this.showMessage('FORMATION INCOMING', 'Destroy them all!', 0x4488ff, 1800, null);
    }
    if (def.formation === 'vshape') {
      this.formation.spawnVShape('chaser');
      this.showMessage('FINAL WAVE', 'V-Formation attack!', 0xff9900, 1800, null);
    }
  }

  checkWaveClear() {
    if (this.wavePhase !== 'spawning' && this.wavePhase !== 'waiting') return;
    if (this.enemiesLeft > 0) return;
    if (this.wavePhase === 'spawning') this.wavePhase = 'waiting';
    if (this.enemies.length > 0) return;
    if (this.formation.isActive()) return;
    if (this.waveClearLocked) return;
    this.waveClearLocked = true;
    this.wavePhase = 'done';
    this.onWaveCleared();
  }

  onWaveCleared() {
    const coinBonus = 20 + (this.wave - 1) * 10;
    this.coins += coinBonus;
    this.coinTxt.setText('COINS  ' + this.coins);

    if (this.wave >= this.maxWaves) {
      this.showMessage('BOSS INCOMING', 'Prepare yourself...', 0xff3355, 2500, () => {
        this.beginWave(1); // Boss scene next
      });
      return;
    }

    // Go to shop between waves
    this.showMessage(
      `WAVE ${this.wave} CLEARED`, `+${coinBonus} coins  —  Shop opening...`,
      0x00e5ff, 2200,
      () => {
        this.scene.start('ShopScene', {
          wave:      this.wave,
          maxWaves:  this.maxWaves,
          score:     this.score,
          coins:     this.coins,
          playerHP:  this.playerHP,
          maxHP:     this.maxHP,
          inventory: this.inventory,
        });
      }
    );
  }

  showMessage(title, sub, color, duration, onDone) {
    this.centerMsg
      .setText(title)
      .setColor('#' + color.toString(16).padStart(6, '0'))
      .setAlpha(1);
    this.subMsg.setText(sub).setAlpha(1);
    if (duration > 0 && onDone) {
      let fired = false;
      this.time.addEvent({ delay: duration, callback: () => {
        if (fired) return; fired = true;
        this.centerMsg.setAlpha(0); this.subMsg.setAlpha(0);
        onDone();
      }});
    } else if (duration > 0) {
      this.time.addEvent({ delay: duration, callback: () => {
        this.centerMsg.setAlpha(0); this.subMsg.setAlpha(0);
      }});
    }
  }

  // ══════════════════════════════════════════════════════════
  // UPDATE
  // ══════════════════════════════════════════════════════════

  update(time, delta) {
    const { width, height } = this.scale;

    // ── Ship movement ──────────────────────────────────────
    if (this.isPointerDown) {
      this.ship.x += (this.targetX - this.ship.x) * 0.18;
      this.ship.y += (this.targetY - this.ship.y) * 0.18;
    }
    this.ship.x = Phaser.Math.Clamp(this.ship.x, this.ship.w / 2 + 10, width  - this.ship.w / 2 - 10);
    this.ship.y = Phaser.Math.Clamp(this.ship.y, this.ship.h / 2 + 60, height - this.ship.h / 2 - 80);

    // ── Powerup timer tick ─────────────────────────────────
    if (this.activePowerup && this.powerupTimeLeft > 0) {
      this.powerupTimeLeft -= delta;
      if (this.powerupTimeLeft <= 0) {
        this.removePowerup(this.activePowerup);
      } else {
        this.drawPowerupBar();
      }
    }

    // ── Fire bullets ───────────────────────────────────────
    if (time > this.lastFired + this.fireRate) {
      const bx = this.ship.x, by = this.ship.y - this.ship.h / 2;
      this.bullets.push({ x: bx, y: by, speed: 10, vx: 0 });
      if (this.spreadShot) {
        this.bullets.push({ x: bx, y: by, speed: 10, vx: -3 });
        this.bullets.push({ x: bx, y: by, speed: 10, vx:  3 });
      }
      this.lastFired = time;
    }

    // ── Spawn enemies ──────────────────────────────────────
    if (this.wavePhase === 'spawning' && this.enemiesLeft > 0) {
      if (time > this.lastSpawned + this.spawnInterval) {
        this.spawnEnemy();
        this.enemiesLeft--;
        this.lastSpawned = time;
      }
    }

    // ── Managers ───────────────────────────────────────────
    this.formation.update(time, delta);

    // ── Enemy AI ───────────────────────────────────────────
    this.enemies.forEach(e => {
      if (e.type === 'shooter') {
        e.shootTimer += delta;
        if (e.shootTimer > e.shootRate) { e.shootTimer = 0; this.fireEnemyBullet(e.x, e.y, this.ship.x, this.ship.y); }
      }
      if (e.type === 'chaser') {
        const dx = this.ship.x - e.x;
        e.x += Math.sign(dx) * Math.min(Math.abs(dx), e.chaseSpeed);
      }
    });

    // ── Update arrays ──────────────────────────────────────
    this.bullets = this.bullets.filter(b => {
      b.x += b.vx || 0; b.y -= b.speed;
      return b.y > -20 && b.x > -10 && b.x < width + 10;
    });
    this.enemyBullets = this.enemyBullets.filter(b => {
      b.x += b.vx; b.y += b.vy;
      return b.y < height + 20 && b.x > -20 && b.x < width + 20;
    });
    this.enemies = this.enemies.filter(e => { e.y += e.speed; return e.y < height + 60; });
    this.particles = this.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--;
      p.alpha = p.life / p.maxLife;
      return p.life > 0;
    });

    // ── Collisions ─────────────────────────────────────────
    this.checkBulletEnemyCollisions();
    this.bullets = this.formation.checkBulletCollisions(this.bullets);
    if (!this.invincible) this.formation.checkPlayerCollision(this.ship, () => this.takeDamage());
    this.checkPlayerEnemyCollisions();
    this.checkEnemyBulletPlayerCollisions();
    this.checkWaveClear();

    // ── Stars ──────────────────────────────────────────────
    this.stars.forEach(s => {
      s.y += s.speed;
      if (s.y > height) { s.y = 0; s.x = Phaser.Math.Between(0, width); }
    });

    // ── Draw ───────────────────────────────────────────────
    this.drawBackground();
    this.formation.draw(this.formationGfx);
    this.drawEnemies();
    this.drawEnemyBullets();
    this.drawBullets();
    this.drawShip();
    this.drawParticles();
    this.drawInventoryBar();
  }

  drawPowerupBar() {
    const { width, height } = this.scale;
    const g = this.powerupBarGfx;
    g.clear();
    const ratio  = Math.max(0, this.powerupTimeLeft / this.powerupDuration);
    const barW   = 140, bx = width / 2 - barW / 2, by = height - 90;
    const color  = this.getItemColor(this.activePowerup);
    g.fillStyle(0x0a1628, 0.85); g.fillRect(bx - 4, by - 2, barW + 8, 10);
    g.fillStyle(color, 0.25);    g.fillRect(bx, by, barW, 6);
    g.fillStyle(color, 1);       g.fillRect(bx, by, barW * ratio, 6);
    const secs = Math.ceil(this.powerupTimeLeft / 1000);
    this.powerupBarTxt.setText(`${this.getItemLabel(this.activePowerup)}  ${secs}s`);
  }

  drawInventoryBar() {
    const { width, height } = this.scale;
    const g = this.hudGraphics;
    g.clear();

    // Background strip
    g.fillStyle(0x060a12, 0.92);
    g.fillRect(0, height - 72, width, 72);
    g.lineStyle(0.5, 0x00e5ff, 0.15);
    g.lineBetween(0, height - 72, width, height - 72);
  }

  // ══════════════════════════════════════════════════════════
  // SPAWNING
  // ══════════════════════════════════════════════════════════

  spawnEnemy() {
    const pool = ['drifter'];
    if (this.wave >= 2) pool.push('shooter');
    if (this.wave >= 3) pool.push('chaser');
    if (this.wave >= 4) pool.push('splitter');
    const weights = { drifter: 5, shooter: 2, chaser: 2, splitter: 1 };
    const weighted = [];
    pool.forEach(t => { for (let i = 0; i < weights[t]; i++) weighted.push(t); });
    const type = weighted[Phaser.Math.Between(0, weighted.length - 1)];
    switch (type) {
      case 'drifter':  this.spawnDrifter();  break;
      case 'shooter':  this.spawnShooter();  break;
      case 'chaser':   this.spawnChaser();   break;
      case 'splitter': this.spawnSplitter(); break;
    }
  }

  spawnDrifter(x, y, size, speed) {
    const { width } = this.scale;
    const s   = size  || Phaser.Math.Between(18, 26);
    const spd = speed || Phaser.Math.FloatBetween(1.2, 2.2) + (this.wave - 1) * 0.25;
    this.enemies.push({
      type: 'drifter',
      x: x !== undefined ? x : Phaser.Math.Between(s + 10, width - s - 10),
      y: y !== undefined ? y : -s,
      size: s, hp: 1, maxHp: 1, speed: spd, color: 0xff3355,
    });
  }

  spawnShooter() {
    const { width } = this.scale;
    const size = Phaser.Math.Between(20, 28);
    this.enemies.push({
      type: 'shooter', x: Phaser.Math.Between(size + 20, width - size - 20),
      y: size + 20, size, hp: 2, maxHp: 2, speed: 0,
      color: 0xff9900, shootTimer: 0, shootRate: 2000 - (this.wave - 1) * 150,
    });
  }

  spawnChaser() {
    const { width } = this.scale;
    const size = Phaser.Math.Between(16, 22);
    this.enemies.push({
      type: 'chaser', x: Phaser.Math.Between(size + 10, width - size - 10),
      y: -size, size, hp: 2, maxHp: 2,
      speed: Phaser.Math.FloatBetween(2.5, 4.0) + (this.wave - 1) * 0.3,
      chaseSpeed: 3 + (this.wave - 1) * 0.5, color: 0xcc44ff,
    });
  }

  spawnSplitter() {
    const { width } = this.scale;
    const size = Phaser.Math.Between(22, 30);
    this.enemies.push({
      type: 'splitter', x: Phaser.Math.Between(size + 10, width - size - 10),
      y: -size, size, hp: 3, maxHp: 3,
      speed: Phaser.Math.FloatBetween(1.0, 1.8), color: 0x00ccff, hasSplit: false,
    });
  }

  fireEnemyBullet(fromX, fromY, toX, toY) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const spd = 3.5 + (this.wave - 1) * 0.3;
    this.enemyBullets.push({ x: fromX, y: fromY, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd });
  }

  // ══════════════════════════════════════════════════════════
  // COLLISIONS
  // ══════════════════════════════════════════════════════════

  checkBulletEnemyCollisions() {
    const deadBullets = new Set(), deadEnemies = new Set();
    this.bullets.forEach((b, bi) => {
      this.enemies.forEach((e, ei) => {
        if (deadEnemies.has(ei)) return;
        if (Phaser.Math.Distance.Between(b.x, b.y, e.x, e.y) < e.size) {
          deadBullets.add(bi); e.hp--;
          if (e.hp <= 0) { deadEnemies.add(ei); this.onEnemyDeath(e); }
        }
      });
    });
    this.bullets = this.bullets.filter((_, i) => !deadBullets.has(i));
    this.enemies = this.enemies.filter((_, i) => !deadEnemies.has(i));
  }

  checkPlayerEnemyCollisions() {
    if (this.invincible) return;
    const dead = new Set();
    this.enemies.forEach((e, ei) => {
      if (Phaser.Math.Distance.Between(this.ship.x, this.ship.y, e.x, e.y) < e.size * 0.7 + 10) {
        dead.add(ei); this.spawnExplosion(e.x, e.y, e.color); this.takeDamage();
      }
    });
    this.enemies = this.enemies.filter((_, i) => !dead.has(i));
  }

  checkEnemyBulletPlayerCollisions() {
    if (this.invincible) return;
    const dead = new Set();
    this.enemyBullets.forEach((b, bi) => {
      if (Phaser.Math.Distance.Between(b.x, b.y, this.ship.x, this.ship.y) < 14) {
        dead.add(bi); this.takeDamage();
      }
    });
    this.enemyBullets = this.enemyBullets.filter((_, i) => !dead.has(i));
  }

  onEnemyDeath(e) {
    const pts = { drifter: 5, shooter: 10, chaser: 12, splitter: 15 };
    this.spawnExplosion(e.x, e.y, e.color);
    const p = pts[e.type] || 5;
    this.score += p; this.coins += p * this.coinMultiplier;
    this.scoreTxt.setText('SCORE  ' + this.score);
    this.coinTxt.setText('COINS  ' + this.coins);
    if (e.type === 'splitter' && !e.hasSplit) {
      e.hasSplit = true;
      this.spawnDrifter(e.x - 12, e.y, Math.floor(e.size * 0.55), e.speed * 1.8);
      this.spawnDrifter(e.x + 12, e.y, Math.floor(e.size * 0.55), e.speed * 1.8);
    }
  }

  takeDamage() {
    if (this.hasShield) {
      this.hasShield = false;
      if (this.activePowerup === 'shield') this.removePowerup('shield');
      this.spawnExplosion(this.ship.x, this.ship.y, 0x69ff47);
      this.refreshInventoryHUD();
      return;
    }
    if (this.ghostMode) return;

    this.playerHP--;
    const hearts = '♥ '.repeat(Math.max(0, this.playerHP)).trim();
    const empty  = '♡ '.repeat(Math.max(0, this.maxHP - this.playerHP)).trim();
    this.hpTxt.setText(this.playerHP > 0 ? hearts + (empty ? ' ' + empty : '') : '✕');
    if (this.playerHP <= 0) {
      this.scene.start('GameOverScene', { score: this.score, coins: this.coins });
      return;
    }
    this.invincible = true;
    this.time.addEvent({ delay: 1500, callback: () => { this.invincible = false; } });
  }

  // ══════════════════════════════════════════════════════════
  // FX
  // ══════════════════════════════════════════════════════════

  spawnExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.FloatBetween(1, 5);
      this.particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1,
        size: Phaser.Math.FloatBetween(1.5, 3.5),
        color, life: Phaser.Math.Between(20, 45), maxLife: 45, alpha: 1,
      });
    }
  }

  // ══════════════════════════════════════════════════════════
  // DRAW
  // ══════════════════════════════════════════════════════════

  drawBackground() {
    const { width, height } = this.scale;
    const g = this.bgGraphics;
    g.clear();
    g.fillStyle(0x060a12, 1); g.fillRect(0, 0, width, height);
    this.stars.forEach(s => {
      g.fillStyle(0xffffff, s.alpha);
      g.fillRect(s.x, s.y, s.size, s.size);
    });
  }

  drawEnemies() {
    const g = this.enemyGraphics;
    g.clear();
    this.enemies.forEach(e => {
      switch (e.type) {
        case 'drifter':  this.drawDrifter(g, e);  break;
        case 'shooter':  this.drawShooter(g, e);  break;
        case 'chaser':   this.drawChaser(g, e);   break;
        case 'splitter': this.drawSplitter(g, e); break;
      }
      if (e.maxHp > 1) {
        const bw = e.size * 2, bx = e.x - e.size, by = e.y + e.size + 4;
        g.fillStyle(0x1a1a2e, 0.8); g.fillRect(bx, by, bw, 3);
        g.fillStyle(e.color, 1);    g.fillRect(bx, by, bw * (e.hp / e.maxHp), 3);
      }
    });
  }

  drawDrifter(g, e) {
    const s = e.size;
    g.fillStyle(e.color, 0.9);
    g.fillTriangle(e.x, e.y + s, e.x - s, e.y - s * 0.5, e.x + s, e.y - s * 0.5);
    g.fillStyle(e.color, 0.55);
    g.fillTriangle(e.x - s * 0.3, e.y + s * 0.2, e.x - s * 1.1, e.y + s * 0.8, e.x - s * 0.2, e.y + s * 0.9);
    g.fillTriangle(e.x + s * 0.3, e.y + s * 0.2, e.x + s * 1.1, e.y + s * 0.8, e.x + s * 0.2, e.y + s * 0.9);
    g.lineStyle(0.8, 0xff6680, 0.7);
    g.strokeTriangle(e.x, e.y + s, e.x - s, e.y - s * 0.5, e.x + s, e.y - s * 0.5);
    g.fillStyle(0xff8899, 0.8); g.fillCircle(e.x, e.y + s * 0.1, s * 0.22);
  }

  drawShooter(g, e) {
    const s = e.size;
    g.fillStyle(e.color, 0.85); g.fillRect(e.x - s * 0.7, e.y - s * 0.5, s * 1.4, s);
    g.fillStyle(0xffaa00, 1);   g.fillRect(e.x - 3, e.y + s * 0.4, 6, s * 0.7);
    g.lineStyle(1, 0xffcc44, 0.8); g.strokeRect(e.x - s * 0.7, e.y - s * 0.5, s * 1.4, s);
    g.fillStyle(0xffdd88, 0.9); g.fillCircle(e.x, e.y, s * 0.25);
  }

  drawChaser(g, e) {
    const s = e.size;
    g.fillStyle(e.color, 0.9);
    g.fillTriangle(e.x, e.y + s, e.x - s, e.y - s * 0.6, e.x + s, e.y - s * 0.6);
    g.lineStyle(0.8, 0xdd88ff, 0.5);
    g.lineBetween(e.x - s * 0.3, e.y - s * 0.6, e.x - s * 0.3, e.y - s * 1.1);
    g.lineBetween(e.x + s * 0.3, e.y - s * 0.6, e.x + s * 0.3, e.y - s * 1.1);
    g.lineBetween(e.x, e.y - s * 0.6, e.x, e.y - s * 1.2);
    g.lineStyle(1, 0xee88ff, 0.8);
    g.strokeTriangle(e.x, e.y + s, e.x - s, e.y - s * 0.6, e.x + s, e.y - s * 0.6);
    g.fillStyle(0xee88ff, 0.9); g.fillCircle(e.x, e.y, s * 0.2);
  }

  drawSplitter(g, e) {
    const s = e.size;
    g.fillStyle(e.color, 0.85);
    g.fillTriangle(e.x, e.y - s, e.x - s, e.y, e.x + s, e.y);
    g.fillTriangle(e.x, e.y + s, e.x - s, e.y, e.x + s, e.y);
    g.fillStyle(0x88eeff, 0.6);
    g.fillTriangle(e.x, e.y - s * 0.5, e.x - s * 0.5, e.y, e.x + s * 0.5, e.y);
    g.lineStyle(1, 0x44ddff, 0.9);
    g.strokeTriangle(e.x, e.y - s, e.x - s, e.y, e.x + s, e.y);
    g.strokeTriangle(e.x, e.y + s, e.x - s, e.y, e.x + s, e.y);
    g.lineStyle(0.5, 0xffffff, 0.3); g.lineBetween(e.x - s, e.y, e.x + s, e.y);
  }

  drawEnemyBullets() {
    const g = this.eBulletGraphics;
    g.clear();
    this.enemyBullets.forEach(b => {
      g.fillStyle(0xff6600, 0.3); g.fillCircle(b.x, b.y, 6);
      g.fillStyle(0xff9900, 1);   g.fillCircle(b.x, b.y, 3.5);
      g.fillStyle(0xffcc44, 0.9); g.fillCircle(b.x, b.y, 1.5);
    });
  }

  drawBullets() {
    const g = this.bulletGraphics;
    g.clear();
    this.bullets.forEach(b => {
      g.fillStyle(0xffe066, 0.25); g.fillRect(b.x - 3, b.y - 6, 6, 16);
      g.fillStyle(0xffe066, 1);    g.fillRect(b.x - 2, b.y - 5, 4, 14);
      g.fillStyle(0xffffff, 0.9);  g.fillRect(b.x - 1, b.y - 5, 2, 4);
    });
  }

  drawShip() {
    const g = this.shipGraphics;
    g.clear();
    if (this.ghostMode && Math.floor(this.time.now / 80) % 2 === 0) {
      g.fillStyle(0xce93d8, 0.3); g.fillCircle(this.ship.x, this.ship.y, 28);
    }
    if (this.hasShield) {
      g.lineStyle(1.5, 0x69ff47, 0.7 + Math.sin(this.time.now / 200) * 0.3);
      g.strokeCircle(this.ship.x, this.ship.y, 26);
    }
    if (!this.ghostMode && this.invincible && Math.floor(this.time.now / 120) % 2 === 0) return;
    const { x, y, w, h } = this.ship;
    g.fillStyle(0x00e5ff, 0.12);
    g.fillTriangle(x, y + h * 0.5, x - w * 0.3, y + h * 1.1, x + w * 0.3, y + h * 1.1);
    g.fillStyle(0x00e5ff, 0.25);
    g.fillTriangle(x, y + h * 0.5, x - w * 0.18, y + h * 0.95, x + w * 0.18, y + h * 0.95);
    g.fillStyle(0x0d2a4a, 1);
    g.fillTriangle(x, y - h * 0.5, x - w * 0.5, y + h * 0.5, x + w * 0.5, y + h * 0.5);
    g.fillStyle(0x0a2040, 1);
    g.fillTriangle(x - w * 0.2, y + h * 0.1, x - w * 0.7, y + h * 0.55, x - w * 0.1, y + h * 0.5);
    g.fillTriangle(x + w * 0.2, y + h * 0.1, x + w * 0.7, y + h * 0.55, x + w * 0.1, y + h * 0.5);
    g.lineStyle(1, 0x00e5ff, 0.8);
    g.strokeTriangle(x, y - h * 0.5, x - w * 0.5, y + h * 0.5, x + w * 0.5, y + h * 0.5);
    g.fillStyle(0x00e5ff, 0.6);
    g.fillTriangle(x, y - h * 0.25, x - w * 0.15, y + h * 0.1, x + w * 0.15, y + h * 0.1);
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