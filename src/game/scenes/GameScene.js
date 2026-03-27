class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.startWaveNumber    = data.wave            || 1;
    this.score              = data.score           || 0;
    this.coins              = data.coins           || 0;
    this.playerHP           = data.playerHP       || 3;
    this.maxHP              = data.maxHP         || 3;
    this.inventory          = data.inventory       || [null, null, null];
    this.fireRateLevel      = data.fireRateLevel   || 0;
    this.unlockedModes      = data.unlockedModes   || ['single'];
    this.activeModeKey      = data.activeModeKey   || 'single';
    this.hasPhoenixModule   = data.hasPhoenixModule   || false;
    this.phoenixBoughtCount = data.phoenixBoughtCount || 0;
  }

 create() {
  const { width, height } = this.scale;

  // Resume Web Audio on scene start (important for mobile / browser autoplay rules)
  soundManager.resume();

  // ── Powerup flags ──────────────────────────────────────
  this.baseFireRate   = Math.round(500 * (1 - this.fireRateLevel * 0.1));
  this.fireRate       = this.baseFireRate;
  this.spreadShot     = false;
  this.hasShield      = false;
  this.ghostMode      = false;
  this.coinMagnet     = false;
  this.hasPhoenixModule = this.hasPhoenixModule || false;
  this.coinMultiplier = 1;
  this.activePowerups = {};
  this.invincible     = false;

  // ── Firing modes ───────────────────────────────────────
  this.firingModes = {
    single: new SingleShot(this),
    double: new DoubleShot(this),
    triple: new TripleShot(this),
    quad:   new QuadrupleShot(this),
    laser:  new LaserBeam(this),
    rocket: new Rocket(this),
  };
  this.firingMode = this.firingModes[this.activeModeKey] || this.firingModes['single'];

  // ── Wave state ─────────────────────────────────────────
  this.wave                = this.startWaveNumber;
  this.maxWaves            = WAVE_CONFIGS.length;
  this.currentWave         = null;
  this.waveClearLocked     = false;
  this.isWaveTransitioning = false;

  // ── Managers ───────────────────────────────────────────
  this.formation = new FormationManager(this);

  // ── Input / ship ───────────────────────────────────────
  this.isPointerDown = false;
  this.targetX = width / 2;
  this.targetY = height * 0.75;
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
  this.laserGraphics   = this.add.graphics();
  this.shipGraphics    = this.add.graphics();
  this.fxGraphics      = this.add.graphics();
  this.hudGraphics     = this.add.graphics();

  // ── Arrays ─────────────────────────────────────────────
  this.enemyBullets = [];
  this.enemies      = [];
  this.particles    = [];
  this.coinDrops    = [];
  this.bullets      = [];

  // ── HUD text ───────────────────────────────────────────
  this.scoreTxt = this.add.text(20, 16, 'SCORE  ' + this.score, {
    fontSize: '14px',
    fontFamily: 'monospace',
    color: '#c8d8f0',
  });

  this.coinTxt = this.add.text(20, 38, 'COINS  ' + this.coins, {
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#ffeb3b',
  });

  this.waveTxt = this.add.text(width / 2, 16, `WAVE  ${this.wave} / ${this.maxWaves}`, {
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#c8d8f0',
  }).setOrigin(0.5, 0);

  this.hpTxt = this.add.text(width - 20, 16, '', {
    fontSize: '16px',
    fontFamily: 'monospace',
    color: '#ff3355',
  }).setOrigin(1, 0);

  this.refreshHPText();

  this.centerMsg = this.add.text(width / 2, height * 0.38, '', {
    fontSize: '22px',
    fontFamily: 'monospace',
    color: '#00e5ff',
    fontStyle: 'bold',
    align: 'center',
  }).setOrigin(0.5).setAlpha(0).setDepth(10);

  this.subMsg = this.add.text(width / 2, height * 0.38 + 36, '', {
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#ffeb3b',
    align: 'center',
  }).setOrigin(0.5).setAlpha(0).setDepth(10);

  // ── Powerup timer bar ──────────────────────────────────
  this.powerupBarGfx = this.add.graphics().setDepth(15);
  this.powerupBarTxt = this.add.text(width / 2, height - 86, '', {
    fontSize: '10px',
    fontFamily: 'monospace',
    color: '#c8d8f0',
  }).setOrigin(0.5, 1).setDepth(15).setAlpha(0);

  // ── Inventory slots HUD ────────────────────────────────
  this.buildInventoryHUD();

  // ── Mode switcher button — top right ───────────────────
  this.buildModeSwitcher();

  // ── Input ──────────────────────────────────────────────
  this.input.on('pointerdown', (p) => {
    if (p.y > this.scale.height - 72) return;

    const inModeBtn =
      p.x > this.scale.width - 132 &&
      p.x < this.scale.width - 20 &&
      p.y > 41 &&
      p.y < 75;

    if (inModeBtn) return;

    this.isPointerDown = true;
    this.targetX = p.x;
    this.targetY = p.y;
  });

  this.input.on('pointermove', (p) => {
    if (p.y > this.scale.height - 72) return;

    if (this.isPointerDown) {
      this.targetX = p.x;
      this.targetY = p.y;
    }
  });

  this.input.on('pointerup', () => {
    this.isPointerDown = false;
  });

  this.startWave();
}

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

      const label = this.add.text(
        sx + slotW / 2,
        y + slotH / 2,
        type ? this.getItemLabel(type) : 'EMPTY',
        {
          fontSize: '9px',
          fontFamily: 'monospace',
          color: type
            ? '#' + this.getItemColor(type).toString(16).padStart(6, '0')
            : 'rgba(200,216,240,0.2)',
          fontStyle: type ? 'bold' : 'normal',
          align: 'center',
          wordWrap: { width: slotW - 8 },
        }
      ).setOrigin(0.5).setDepth(13);

      if (type) {
        btn.on('pointerdown', () => this.activateSlot(i));
        btn.on('pointerover', () => btn.setFillStyle(0x0d2040));
        btn.on('pointerout',  () => btn.setFillStyle(0x0a1628));
      }

      this.slotButtons.push({ btn, label, slot: i });
    }
  }

  buildModeSwitcher() {
    const { width } = this.scale;

    const btnW = 112;
    const btnH = 34;
    const x = width - 20 - btnW / 2;
    const y = 58;

    this.modeBtnBg = this.add.rectangle(x, y, btnW, btnH, 0x0a1628)
      .setStrokeStyle(1, 0x00e5ff, 0.6)
      .setDepth(16)
      .setInteractive({ useHandCursor: true });

    this.modeIcon = this.add.text(x - 38, y, this.firingMode.icon, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: this.firingMode.color,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(17);

    this.modeLabel = this.add.text(x + 8, y, this.firingMode.label.toUpperCase(), {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#c8d8f0',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(17);

    this.modeBtnBg.on('pointerover', () => this.modeBtnBg.setFillStyle(0x0d2040));
    this.modeBtnBg.on('pointerout',  () => this.modeBtnBg.setFillStyle(0x0a1628));
    this.modeBtnBg.on('pointerdown', () => this.cycleMode());
  }

  cycleMode() {
    const unlocked = this.unlockedModes.filter(k => this.firingModes[k]);
    if (unlocked.length <= 1) return;

    const currentIdx = unlocked.indexOf(this.firingMode.key);
    const nextIdx    = (currentIdx + 1) % unlocked.length;
    const nextKey    = unlocked[nextIdx];

    this.firingMode.deactivate();

    this.firingMode    = this.firingModes[nextKey];
    this.activeModeKey = nextKey;

    this.modeIcon.setText(this.firingMode.icon).setColor(this.firingMode.color);
    this.modeLabel.setText(this.firingMode.label.toUpperCase());
    this.modeBtnBg.setStrokeStyle(
      1,
      parseInt(this.firingMode.color.replace('#', '0x')),
      0.8
    );

    soundManager.play('uiClick');
  }

  activateSlot(slotIndex) {
    const type = this.inventory[slotIndex];
    if (!type) return;

    soundManager.play('uiClick');
    this.applyPowerup(type);
    this.inventory[slotIndex] = null;
    this.refreshInventoryHUD();
  }

  applyPowerup(type) {
    const powerupDefs = {
      rapidfire: {
        duration: 8000,
        apply:  (s) => { s.fireRate = Math.round(s.baseFireRate * 0.36); },
        remove: (s) => { s.fireRate = s.baseFireRate; }
      },
      spreadshot: {
        duration: 10000,
        apply:  (s) => { s.spreadShot = true; },
        remove: (s) => { s.spreadShot = false; }
      },
      shield: {
        duration: -1,
        apply:  (s) => { s.hasShield = true; },
        remove: (s) => { s.hasShield = false; }
      },
      screenbomb: {
        duration: -1,
        apply:  (s) => { s.triggerScreenBomb(); },
        remove: () => {}
      },
      coinmagnet: {
        duration: 12000,
        apply:  (s) => { s.coinMagnet = true; },
        remove: (s) => { s.coinMagnet = false; }
      },
      ghostmode: {
        duration: 5000,
        apply:  (s) => {
          s.ghostMode = true;
          s.invincible = true;
          s.coinMultiplier = 2;
        },
        remove: (s) => {
          s.ghostMode = false;
          s.invincible = false;
          s.coinMultiplier = 1;
        }
      },
      phoenix: {
        duration: -1,
        apply:  (s) => { s.hasPhoenixModule = true; },
        remove: (s) => { s.hasPhoenixModule = false; }
      },
    };

    const def = powerupDefs[type];
    if (!def) return;

    if (this.activePowerups[type]) {
      this.activePowerups[type].timeLeft = def.duration;
      this.showPickupText(type);
      return;
    }

    def.apply(this);
    this.showPickupText(type);

    if (def.duration <= 0) return;

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
      .setOrigin(0)
      .setAlpha(0.5)
      .setDepth(20);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 400,
      onComplete: () => flash.destroy()
    });
  }

  refreshInventoryHUD() {
    this.slotButtons.forEach(({ btn, label }) => {
      btn.destroy();
      label.destroy();
    });
    this.slotButtons = [];
    this.buildInventoryHUD();
  }

  showPickupText(type) {
    const label = this.getItemLabel(type);
    const color = '#' + this.getItemColor(type).toString(16).padStart(6, '0');
    const { width, height } = this.scale;

    const txt = this.add.text(width / 2, height - 90, label + ' ACTIVATED!', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: txt,
      y: height - 140,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }

  getItemLabel(type) {
    const labels = {
      rapidfire: 'RAPID FIRE',
      spreadshot: 'SPREAD SHOT',
      shield: 'SHIELD',
      screenbomb: 'SCREEN BOMB',
      coinmagnet: 'COIN MAGNET',
      ghostmode: 'GHOST MODE',
      phoenix: 'PHOENIX MODULE',
    };
    return labels[type] || type.toUpperCase();
  }

  getItemColor(type) {
    const colors = {
      rapidfire: 0x00e5ff,
      spreadshot: 0xe040fb,
      shield: 0x69ff47,
      screenbomb: 0xff6d00,
      coinmagnet: 0xffeb3b,
      ghostmode: 0xce93d8,
      phoenix: 0xff9e2c,
    };
    return colors[type] || 0xffffff;
  }

  resetWaveState() {
    this.enemies         = [];
    this.enemyBullets    = [];
    this.bullets         = [];
    this.coinDrops       = [];
    this.waveClearLocked = false;
    this.isWaveTransitioning = false;

    this.removeAllPowerups();

    if (this.firingMode) {
      this.firingMode.deactivate();
    }

    if (this.formation) {
      this.formation.reset();
    }
  }

startWave() {
  this.resetWaveState();

  this.waveTxt.setText(`WAVE  ${this.wave} / ${this.maxWaves}`);

  this.currentWave = createWave(this, this.wave);

  Object.values(soundManager.sounds).forEach(sound => {
    if (sound && typeof sound.setWave === 'function') {
      sound.setWave(this.wave);
    }
  });

  if (this.currentWave?.musicTrack) {
    soundManager.setMusic(this.currentWave.musicTrack);
  }

  this.currentWave?.onStart();
}
  checkWaveClear() {
    if (!this.currentWave) return;
    if (this.waveClearLocked) return;
    if (this.isWaveTransitioning) return;
    if (!this.currentWave.done) return;

    this.waveClearLocked = true;
    this.isWaveTransitioning = true;
    this.onWaveCleared();
  }

  onWaveCleared() {
    if (!this.currentWave) return;

    const coinBonus = this.currentWave.coinBonus || 0;
    this.coins += coinBonus;
    this.coinTxt.setText('COINS  ' + this.coins);

    const nextWave = this.wave + 1;

    if (this.wave >= this.maxWaves) {
      this.showMessage(
        'RUN COMPLETE',
        `You survived all ${this.maxWaves} waves!`,
        0x69ff47,
        2600,
        () => {
          this.scene.start('GameOverScene', {
            score: this.score,
            coins: this.coins,
          });
        }
      );
      return;
    }

    soundManager.play('uiClick');
    this.showMessage(
      `WAVE ${this.wave} CLEARED`,
      `+${coinBonus} coins  —  Shop opening...`,
      0x00e5ff,
      2200,
      () => {
        this.scene.start('ShopScene', {
          wave: nextWave,
          maxWaves: this.maxWaves,
          score: this.score,
          coins: this.coins,
          playerHP: this.playerHP,
          maxHP: this.maxHP,
          inventory: this.inventory,
          fireRateLevel: this.fireRateLevel,
          unlockedModes: this.unlockedModes,
          activeModeKey: this.activeModeKey,
          hasPhoenixModule: this.hasPhoenixModule,
          phoenixBoughtCount: this.phoenixBoughtCount,
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
      this.time.addEvent({
        delay: duration,
        callback: () => {
          if (fired) return;
          fired = true;
          this.centerMsg.setAlpha(0);
          this.subMsg.setAlpha(0);
          onDone();
        }
      });
    } else if (duration > 0) {
      this.time.addEvent({
        delay: duration,
        callback: () => {
          this.centerMsg.setAlpha(0);
          this.subMsg.setAlpha(0);
        }
      });
    }
  }

  update(time, delta) {
    const { width, height } = this.scale;

    if (this.isPointerDown) {
      this.ship.x += (this.targetX - this.ship.x) * 0.18;
      this.ship.y += (this.targetY - this.ship.y) * 0.18;
    }
    this.ship.x = Phaser.Math.Clamp(
      this.ship.x,
      this.ship.w / 2 + 10,
      width - this.ship.w / 2 - 10
    );
    this.ship.y = Phaser.Math.Clamp(
      this.ship.y,
      this.ship.h / 2 + 60,
      height - this.ship.h / 2 - 80
    );

    Object.keys(this.activePowerups).forEach(type => {
      const p = this.activePowerups[type];
      p.timeLeft -= delta;
      if (p.timeLeft <= 0) this.removePowerup(type);
    });
    this.drawPowerupBars();

    this.firingMode.update(time, delta);

    if (this.currentWave) {
      this.currentWave.update(delta);
    }

    this.formation.update(time, delta);

    this.enemies.forEach(e => e.update(delta));
    this.enemies = this.enemies.filter(e => e.alive && !e.isOffScreen());

    this.bullets = this.bullets.filter(b => {
      b.x += b.vx || 0;
      b.y -= b.speed;
      return b.y > -20 && b.x > -10 && b.x < width + 10;
    });

    this.enemyBullets = this.enemyBullets.filter(b => {
      b.x += b.vx;
      b.y += b.vy;
      return b.y < height + 20 && b.x > -20 && b.x < width + 20;
    });

    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.life--;
      p.alpha = p.life / p.maxLife;
      return p.life > 0;
    });

let collected = 0;
let collectX = this.ship.x;
let collectY = this.ship.y;

this.coinDrops = this.coinDrops.filter(c => {
  c.vx *= 0.92;
  c.vy = c.vy * 0.92 + 0.18;
  c.x += c.vx;
  c.y += c.vy;
  c.pulse = (c.pulse || 0) + 0.12;

  const dx = this.ship.x - c.x;
  const dy = this.ship.y - c.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // default soft pull
  if (dist > 0.001 && dist < 100) {
    c.vx += (dx / dist) * 1.2;
    c.vy += (dy / dist) * 1.2;
  }

  // stronger pull when magnet is active
  if (this.coinMagnet && dist > 0.001 && dist < 280) {
    const pull = dist < 120 ? 6.5 : 4.5;
    c.vx += (dx / dist) * pull;
    c.vy += (dy / dist) * pull;
  }

  const cdist = Phaser.Math.Distance.Between(c.x, c.y, this.ship.x, this.ship.y);
  if (cdist < 44) {
    collected++;
    collectX = c.x;
    collectY = c.y;
    return false;
  }

  return c.y < height + 20 && c.x > -20 && c.x < width + 20;
});

    if (collected > 0) {
      this.coins += collected * this.coinMultiplier;
      this.coinTxt.setText('COINS  ' + this.coins);
      this.showCoinCollectText(collectX, collectY - 20, collected * this.coinMultiplier);
      soundManager.play('coinCollect');
    }

    this.checkBulletEnemyCollisions();
    this.bullets = this.formation.checkBulletCollisions(this.bullets);

    if (!this.invincible) {
      this.formation.checkPlayerCollision(this.ship, () => this.takeDamage());
    }

    this.checkPlayerEnemyCollisions();
    this.checkEnemyBulletPlayerCollisions();
    this.checkWaveClear();

    this.stars.forEach(s => {
      s.y += s.speed;
      if (s.y > height) {
        s.y = 0;
        s.x = Phaser.Math.Between(0, width);
      }
    });

    this.drawBackground();
    this.formation.draw(this.formationGfx);
    this.drawEnemies();
    this.drawCoins();
    this.drawEnemyBullets();
    this.drawBullets();
    this.firingMode.draw(this.laserGraphics);
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

    const barW = 150;
    const barH = 6;
    const gap = 18;
    const bx = width / 2 - barW / 2;
    const startY = height - 90 - (active.length - 1) * gap;

    const labels = active.map(type => {
      const p = this.activePowerups[type];
      const secs = Math.ceil(p.timeLeft / 1000);
      return `${this.getItemLabel(type)} ${secs}s`;
    });
    this.powerupBarTxt.setText(labels.join('   ')).setAlpha(1);

    active.forEach((type, i) => {
      const p = this.activePowerups[type];
      const ratio = Math.max(0, p.timeLeft / p.duration);
      const color = this.getItemColor(type);
      const by = startY + i * gap;

      g.fillStyle(0x0a1628, 0.85);
      g.fillRect(bx - 4, by - 2, barW + 8, barH + 4);

      g.fillStyle(color, 0.2);
      g.fillRect(bx, by, barW, barH);

      g.fillStyle(color, 1);
      g.fillRect(bx, by, barW * ratio, barH);
    });
  }

  drawInventoryBar() {
    const { width, height } = this.scale;
    const g = this.hudGraphics;
    g.clear();

    g.fillStyle(0x060a12, 0.92);
    g.fillRect(0, height - 72, width, 72);
    g.lineStyle(0.5, 0x00e5ff, 0.15);
    g.lineBetween(0, height - 72, width, height - 72);
  }

  spawnDrifter(x, y, size, speed) {
    this.enemies.push(Drifter.spawnAt(this, x, y, size, speed));
  }

  fireEnemyBullet(fromX, fromY, toX, toY) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const spd = 3.5 + (this.wave - 1) * 0.3;
    this.enemyBullets.push({
      x: fromX,
      y: fromY,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
    });
  }

  checkBulletEnemyCollisions() {
    const deadBullets = new Set();

    this.bullets.forEach((b, bi) => {
      this.enemies.forEach(e => {
        if (!e.alive) return;
        if (Phaser.Math.Distance.Between(b.x, b.y, e.x, e.y) < e.size) {
          deadBullets.add(bi);

          if (b.isRocket) {
            this._rocketSplash(b.x, b.y, b.splashRadius, b.splashDamage);
          } else {
            e.takeBulletHit(1);
          }
        }
      });
    });

    this.bullets = this.bullets.filter((_, i) => !deadBullets.has(i));
    this.enemies = this.enemies.filter(e => e.alive);
  }

  _rocketSplash(x, y, radius, damage) {
    this.spawnExplosion(x, y, 0xff9900);
    this.spawnExplosion(x, y, 0xff6600);

    this.enemies.forEach(e => {
      if (!e.alive) return;
      if (Phaser.Math.Distance.Between(x, y, e.x, e.y) < radius) {
        e.takeBulletHit(damage);
      }
    });

    if (this.formation && this.formation.isActive()) {
      this.formation.ships.forEach(s => {
        if (!s.alive) return;
        if (Phaser.Math.Distance.Between(x, y, s.x, s.y) < radius) {
          s.hp -= damage;
          if (s.hp <= 0) {
            s.alive = false;
            this.spawnExplosion(s.x, s.y, 0x4488ff);
            this.score += 10;
            this.spawnCoinDrops(s.x, s.y, 10);
            this.scoreTxt.setText('SCORE  ' + this.score);
          }
        }
      });
    }
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
        dead.add(bi);
        this.takeDamage();
      }
    });

    this.enemyBullets = this.enemyBullets.filter((_, i) => !dead.has(i));
  }

  spawnCoinDrops(x, y, totalValue) {
    const count = Phaser.Math.Between(3, 5);
    const valueEach = Math.max(1, Math.floor(totalValue / count));

    for (let i = 0; i < count; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.FloatBetween(1.5, 4.0);

      this.coinDrops.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        value: valueEach,
        pulse: Phaser.Math.FloatBetween(0, Math.PI * 2),
        size: 5,
      });
    }
  }

  showCoinCollectText(x, y, amount) {
    const txt = this.add.text(x, y, `+${amount}`, {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#ffeb3b',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(18);

    this.tweens.add({
      targets: txt,
      y: y - 40,
      alpha: 0,
      duration: 700,
      ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }

  takeDamage() {
    if (this.hasShield) {
      this.hasShield = false;
      this.removePowerup('shield');
      this.spawnExplosion(this.ship.x, this.ship.y, 0x69ff47);
      this.refreshInventoryHUD();
      return;
    }

    if (this.ghostMode) return;

    if (this.playerHP <= 1 && this.hasPhoenixModule) {
      this.hasPhoenixModule = false;
      this.removePowerup('phoenix');

      soundManager.play('powerup');
      this.playerHP = 1;
      this.invincible = true;

      this.spawnExplosion(this.ship.x, this.ship.y, 0xff9e2c);
      this.spawnExplosion(this.ship.x, this.ship.y, 0xffd54f);

      const hearts = '♥ '.repeat(this.playerHP).trim();
      const empty  = '♡ '.repeat(Math.max(0, this.maxHP - this.playerHP)).trim();
      this.hpTxt.setText(this.playerHP > 0 ? hearts + (empty ? ' ' + empty : '') : '✕');

      const txt = this.add.text(this.ship.x, this.ship.y - 34, 'PHOENIX REVIVE!', {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#ff9e2c',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(25);

      this.tweens.add({
        targets: txt,
        y: this.ship.y - 70,
        alpha: 0,
        duration: 900,
        ease: 'Power2',
        onComplete: () => txt.destroy(),
      });

      this.time.addEvent({
        delay: 1400,
        callback: () => { this.invincible = false; }
      });

      return;
    }

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
    this.time.addEvent({
      delay: 1500,
      callback: () => { this.invincible = false; }
    });
  }

  spawnExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.FloatBetween(1, 5);

      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: Phaser.Math.FloatBetween(1.5, 3.5),
        color,
        life: Phaser.Math.Between(20, 45),
        maxLife: 45,
        alpha: 1,
      });
    }
  }

  drawBackground() {
    const { width, height } = this.scale;
    BackgroundRenderer.draw(this.bgGraphics, this.stars, width, height);
  }

  drawEnemies() {
    const g = this.enemyGraphics;
    g.clear();
    this.enemies.forEach(e => e.draw(g));
  }

  drawEnemyBullets() {
    BulletRenderer.drawEnemyBullets(this.eBulletGraphics, this.enemyBullets);
  }

  drawBullets() {
    BulletRenderer.drawPlayerBullets(this.bulletGraphics, this.bullets);
  }

  drawShip() {
    const g = this.shipGraphics;
    g.clear();

    if (this.ghostMode)        PlayerShipRenderer.drawGhost(g, this.ship, this);
    if (this.hasPhoenixModule) PlayerShipRenderer.drawPhoenix(g, this.ship, this);
    if (this.hasShield)        PlayerShipRenderer.drawShield(g, this.ship, this);

    if (PlayerShipRenderer.shouldSkipDraw(this.ship, this)) return;

    PlayerShipRenderer.draw(g, this.ship, this);
  }

  drawParticles() {
    ParticleRenderer.draw(this.fxGraphics, this.particles);
  }

  drawCoins() {
    CoinRenderer.draw(this.coinGraphics, this.coinDrops);
  }

  formatHPText(currentHP, maxHP) {
    const filled = Math.max(0, currentHP | 0);
    const max = Math.max(1, maxHP | 0);

    if (max <= 5) {
      const hearts = '♥ '.repeat(filled).trim();
      const empty  = '♡ '.repeat(Math.max(0, max - filled)).trim();
      return filled > 0 ? hearts + (empty ? ' ' + empty : '') : '✕';
    }

    const shownFilled = Math.min(5, filled);
    const hearts = '♥ '.repeat(shownFilled).trim();

    if (filled <= 0) return '✕';
    if (filled <= 5) {
      const empty = '♡ '.repeat(Math.max(0, 5 - filled)).trim();
      return hearts + (empty ? ' ' + empty : '') + `  x${max}`;
    }

    return `${hearts}  x${filled}/${max}`;
  }

  refreshHPText() {
    this.hpTxt.setText(this.formatHPText(this.playerHP, this.maxHP));
  }
}