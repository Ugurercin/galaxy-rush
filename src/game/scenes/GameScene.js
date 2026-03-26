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
    this.activePowerups = {}; // map of type → { timeLeft, duration, removeFn }

    // ── Wave state ─────────────────────────────────────────
    this.wave            = this.startWave;
    this.maxWaves        = 5;
    this.currentWave     = null;
    this.waveClearLocked = false;

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
    this.coinGraphics    = this.add.graphics();
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
    this.coinDrops = [];

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

    soundManager.play('uiClick');
    // Apply powerup effect
    this.applyPowerup(type);

    // Clear the slot
    this.inventory[slotIndex] = null;
    this.refreshInventoryHUD();
  }

  applyPowerup(type) {
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

    // If same powerup already active — refresh its timer instead of stacking
    if (this.activePowerups[type]) {
      this.activePowerups[type].timeLeft = def.duration;
      this.showPickupText(type);
      return;
    }

    // Apply effect
    def.apply(this);
    this.showPickupText(type);

    // Instant powerups — no timer needed
    if (def.duration <= 0) return;

    // Add to active powerup map — each runs independently
    this.activePowerups[type] = {
      timeLeft: def.duration,
      duration: def.duration,
      removeFn: def.remove,
    };
  }

  removePowerup(type) {
    const entry = this.activePowerups[type];
    if (!entry) return;
    entry.removeFn(this);
    delete this.activePowerups[type];
  }

  removeAllPowerups() {
    Object.keys(this.activePowerups).forEach(type => this.removePowerup(type));
    this.activePowerups = {};
  }

  triggerScreenBomb() {
    this.enemies.forEach(e => {
      this.spawnExplosion(e.x, e.y, e.color);
      this.score += e.scoreValue || 5;
      this.spawnCoinDrops(e.x, e.y, e.coinValue || 5);
    });
    this.enemies = [];
    if (this.formation && this.formation.isActive()) {
      this.formation.ships.forEach(s => {
        if (s.alive) {
          this.spawnExplosion(s.x, s.y, 0x4488ff);
          this.score += 10;
          this.spawnCoinDrops(s.x, s.y, 10);
        }
        s.alive = false;
      });
    }
    this.scoreTxt.setText('SCORE  ' + this.score);
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
    this.enemies         = [];
    this.enemyBullets    = [];
    this.bullets         = [];
    this.coinDrops       = [];
    this.waveClearLocked = false;
    this.removeAllPowerups();
    this.formation.reset();

    this.wave = waveNum;
    this.waveTxt.setText(`WAVE  ${waveNum} / ${this.maxWaves}`);

    // Instantiate the correct wave class
    const waveClasses = { 1: Wave1, 2: Wave2, 3: Wave3, 4: Wave4, 5: Wave5 };
    const WaveClass   = waveClasses[waveNum] || Wave1;
    this.currentWave  = new WaveClass(this);

    // Switch music and run any wave-specific setup
    soundManager.switchMusic(this.currentWave.musicTrack);
    this.currentWave.onStart();
  }

  checkWaveClear() {
    if (!this.currentWave) return;
    if (this.waveClearLocked) return;
    if (!this.currentWave.done) return;
    this.waveClearLocked = true;
    this.onWaveCleared();
  }

  onWaveCleared() {
    const coinBonus = this.currentWave.coinBonus;
    this.coins += coinBonus;
    this.coinTxt.setText('COINS  ' + this.coins);

    if (this.wave >= this.maxWaves) {
      soundManager.switchMusic('bossMusic');
      this.showMessage('BOSS INCOMING', 'Prepare yourself...', 0xff3355, 2500, () => {
        this.beginWave(1); // Boss scene coming soon
      });
      return;
    }

    soundManager.switchMusic('music');
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

    // ── Powerup timers — all run independently ─────────────
    Object.keys(this.activePowerups).forEach(type => {
      const p = this.activePowerups[type];
      p.timeLeft -= delta;
      if (p.timeLeft <= 0) this.removePowerup(type);
    });
    this.drawPowerupBars();

    // ── Fire bullets ───────────────────────────────────────
    if (time > this.lastFired + this.fireRate) {
      const bx = this.ship.x, by = this.ship.y - this.ship.h / 2;
      this.bullets.push({ x: bx, y: by, speed: 10, vx: 0 });
      if (this.spreadShot) {
        this.bullets.push({ x: bx, y: by, speed: 10, vx: -3 });
        this.bullets.push({ x: bx, y: by, speed: 10, vx:  3 });
      }
      soundManager.play('shoot');
      this.lastFired = time;
    }

    // ── Wave update — handles spawning and clear detection ─
    if (this.currentWave) this.currentWave.update(delta);

    // ── Managers ───────────────────────────────────────────
    this.formation.update(time, delta);

    // ── Enemy AI ───────────────────────────────────────────
    // ── Update enemies via class methods ───────────────────
    this.enemies.forEach(e => e.update(delta));
    this.enemies = this.enemies.filter(e => e.alive && !e.isOffScreen());

    // ── Update arrays ──────────────────────────────────────
    this.bullets = this.bullets.filter(b => {
      b.x += b.vx || 0; b.y -= b.speed;
      return b.y > -20 && b.x > -10 && b.x < width + 10;
    });
    this.enemyBullets = this.enemyBullets.filter(b => {
      b.x += b.vx; b.y += b.vy;
      return b.y < height + 20 && b.x > -20 && b.x < width + 20;
    });
    this.particles = this.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--;
      p.alpha = p.life / p.maxLife;
      return p.life > 0;
    });

    // ── Update coins ───────────────────────────────────────
    let collected = 0;
    let collectX  = this.ship.x;
    let collectY  = this.ship.y;

    this.coinDrops = this.coinDrops.filter(c => {
      // Initial burst velocity dies off, then gravity pulls down
      c.vx *= 0.92;
      c.vy  = c.vy * 0.92 + 0.18;
      c.x  += c.vx;
      c.y  += c.vy;
      c.pulse = (c.pulse || 0) + 0.12;

      // Coin magnet — pull toward ship
      if (this.coinMagnet) {
        const dx   = this.ship.x - c.x;
        const dy   = this.ship.y - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          c.vx += (dx / dist) * 3.5;
          c.vy += (dy / dist) * 3.5;
        }
      }

      // Collection radius
      const cdist = Phaser.Math.Distance.Between(c.x, c.y, this.ship.x, this.ship.y);
      if (cdist < 22) {
        collected++;
        collectX = c.x;
        collectY = c.y;
        return false;
      }

      // Lost if off screen
      return c.y < height + 20 && c.x > -20 && c.x < width + 20;
    });

    // Show collect text if any coins grabbed this frame
    if (collected > 0) {
      this.coins += collected * this.coinMultiplier;
      this.coinTxt.setText('COINS  ' + this.coins);
      this.showCoinCollectText(collectX, collectY - 20, collected * this.coinMultiplier);
      soundManager.play('coinCollect');
    }

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
    this.drawCoins();
    this.drawEnemyBullets();
    this.drawBullets();
    this.drawShip();
    this.drawParticles();
    this.drawInventoryBar();
  }

  drawPowerupBars() {
    const { width, height } = this.scale;
    const g = this.powerupBarGfx;
    g.clear();

    const active = Object.keys(this.activePowerups);
    if (active.length === 0) {
      this.powerupBarTxt.setAlpha(0);
      return;
    }

    const barW  = 150;
    const barH  = 6;
    const gap   = 18;
    const bx    = width / 2 - barW / 2;
    // Stack bars above the inventory bar, one per active powerup
    const startY = height - 90 - (active.length - 1) * gap;

    // Build label text from all active
    const labels = active.map(type => {
      const p    = this.activePowerups[type];
      const secs = Math.ceil(p.timeLeft / 1000);
      return `${this.getItemLabel(type)} ${secs}s`;
    });
    this.powerupBarTxt.setText(labels.join('   ')).setAlpha(1);

    active.forEach((type, i) => {
      const p     = this.activePowerups[type];
      const ratio = Math.max(0, p.timeLeft / p.duration);
      const color = this.getItemColor(type);
      const by    = startY + i * gap;

      // Background
      g.fillStyle(0x0a1628, 0.85);
      g.fillRect(bx - 4, by - 2, barW + 8, barH + 4);

      // Track
      g.fillStyle(color, 0.2);
      g.fillRect(bx, by, barW, barH);

      // Fill
      g.fillStyle(color, 1);
      g.fillRect(bx, by, barW * ratio, barH);
    });
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

  // Used by Splitter onDeath for child enemies
  spawnDrifter(x, y, size, speed) {
    this.enemies.push(Drifter.spawnAt(this, x, y, size, speed));
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
    const deadBullets = new Set();
    this.bullets.forEach((b, bi) => {
      this.enemies.forEach(e => {
        if (!e.alive) return;
        if (Phaser.Math.Distance.Between(b.x, b.y, e.x, e.y) < e.size) {
          deadBullets.add(bi);
          e.takeBulletHit(1);
        }
      });
    });
    this.bullets = this.bullets.filter((_, i) => !deadBullets.has(i));
    this.enemies = this.enemies.filter(e => e.alive);
  }

  checkPlayerEnemyCollisions() {
    if (this.invincible) return;
    this.enemies.forEach(e => {
      if (!e.alive) return;
      if (Phaser.Math.Distance.Between(this.ship.x, this.ship.y, e.x, e.y) < e.size * 0.7 + 10) {
        e.alive = false;
        this.spawnExplosion(e.x, e.y, e.color);
        this.takeDamage();
      }
    });
    this.enemies = this.enemies.filter(e => e.alive);
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

  // Spawn N individual coin drops bursting from position
  spawnCoinDrops(x, y, totalValue) {
    // Split value across 3–5 coin pickups
    const count = Phaser.Math.Between(3, 5);
    const valueEach = Math.max(1, Math.floor(totalValue / count));

    for (let i = 0; i < count; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.FloatBetween(1.5, 4.0);
      this.coinDrops.push({
        x, y,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed - 2, // initial upward bias
        value: valueEach,
        pulse: Phaser.Math.FloatBetween(0, Math.PI * 2),
        size:  5,
      });
    }
  }

  showCoinCollectText(x, y, amount) {
    const txt = this.add.text(x, y, `+${amount}`, {
      fontSize: '13px', fontFamily: 'monospace',
      color: '#ffeb3b', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(18);

    this.tweens.add({
      targets: txt, y: y - 40, alpha: 0, duration: 700,
      ease: 'Power2', onComplete: () => txt.destroy(),
    });
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

    soundManager.play('playerHit');
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
    // Each enemy class owns its own draw logic
    this.enemies.forEach(e => e.draw(g));
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

  drawCoins() {
    const g = this.coinGraphics;
    g.clear();

    this.coinDrops.forEach(c => {
      const pulse = 1 + Math.sin(c.pulse) * 0.15;
      const r     = c.size * pulse;

      // Outer glow ring
      g.fillStyle(0xffeb3b, 0.18);
      g.fillCircle(c.x, c.y, r + 4);

      // Coin body
      g.fillStyle(0xffcc00, 1);
      g.fillCircle(c.x, c.y, r);

      // Inner highlight
      g.fillStyle(0xffee88, 0.9);
      g.fillCircle(c.x - r * 0.25, c.y - r * 0.25, r * 0.4);

      // Thin outline
      g.lineStyle(0.8, 0xff9900, 0.8);
      g.strokeCircle(c.x, c.y, r);
    });
  }
}