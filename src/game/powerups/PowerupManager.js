class PowerupManager {
  constructor(scene) {
    this.scene       = scene;
    this.orbs        = [];
    this.active      = null;  // currently active timed powerup
    this.timeLeft    = 0;
    this.dropChance  = 0.28;  // 28% chance on enemy death

    // All powerup definitions — loaded from individual files
    this.definitions = {
      rapidfire:  RapidFire,
      spreadshot: SpreadShot,
      shield:     Shield,
      screenbomb: ScreenBomb,
      coinmagnet: CoinMagnet,
      ghostmode:  GhostMode,
      phoenix:    PhoenixModule,
    };

    // Drop weights — ghostmode is rare
    this.dropPool = [
      'rapidfire',  'rapidfire',
      'spreadshot', 'spreadshot',
      'shield',     'shield',
      'screenbomb',
      'coinmagnet', 'coinmagnet',
      'ghostmode',
      'phoenix',
    ];

    // HUD bar at bottom center
    this.hudBar  = scene.add.graphics().setDepth(15);
    this.hudText = scene.add.text(
      scene.scale.width / 2, scene.scale.height - 18, '',
      { fontSize: '11px', fontFamily: 'monospace', color: '#c8d8f0' }
    ).setOrigin(0.5, 1).setDepth(15).setAlpha(0);
  }

  // ── Try to drop an orb at position ─────────────────────
  tryDrop(x, y) {
    if (Math.random() > this.dropChance) return;

    const type = this.dropPool[
      Phaser.Math.Between(0, this.dropPool.length - 1)
    ];
    const def = this.definitions[type];

    this.orbs.push({
      x, y,
      type,
      color:   def.color,
      vy:      1.2,
      pulse:   0,
      def,
    });
  }

  // ── Update orbs + timer ─────────────────────────────────
  update(delta) {
    const { height } = this.scene.scale;
    const ship = this.scene.ship;

    // Move orbs downward
    this.orbs = this.orbs.filter(o => {
      o.y     += o.vy;
      o.pulse += 0.08;

      // Coin magnet — pull toward player
      if (this.scene.coinMagnet) {
        const dx = ship.x - o.x;
        const dy = ship.y - o.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          o.x += dx * 0.04;
          o.y += dy * 0.04;
        }
      }

      // Collection check
      const dist = Phaser.Math.Distance.Between(o.x, o.y, ship.x, ship.y);
      if (dist < 24) {
        this.collect(o);
        return false;
      }

      return o.y < height + 20;
    });

    // Tick active timed powerup
    if (this.active && this.definitions[this.active].duration > 0) {
      this.timeLeft -= delta;
      if (this.timeLeft <= 0) {
        this.deactivate();
      }
    }

    this.drawHUD();
  }

  // ── Collect an orb ──────────────────────────────────────
  collect(orb) {
    const def = orb.def;

    // Instant powerups (duration === -1) apply and done
    if (def.duration === -1) {
      def.apply(this.scene);
      this.showPickupText(orb.x, orb.y, def.label, def.color);
      return;
    }

    // Deactivate previous timed powerup if different
    if (this.active && this.active !== def.type) {
      this.deactivate();
    }

    this.active    = def.type;
    this.timeLeft  = def.duration;
    def.apply(this.scene);
    this.showPickupText(orb.x, orb.y, def.label, def.color);
    this.hudText.setAlpha(1);
  }

  // ── Deactivate current timed powerup ───────────────────
  deactivate() {
    if (!this.active) return;
    const def = this.definitions[this.active];
    if (def) def.remove(this.scene);
    this.active   = null;
    this.timeLeft = 0;
    this.hudText.setAlpha(0);
    this.hudBar.clear();
  }

  // ── Draw orbs ───────────────────────────────────────────
  drawOrbs(g) {
    g.clear();
    this.orbs.forEach(o => {
      const scale = 1 + Math.sin(o.pulse) * 0.12;
      g.scaleX = scale;
      o.def.drawOrb(g, o);
    });
  }

  // ── Draw HUD timer bar at bottom ────────────────────────
  drawHUD() {
    this.hudBar.clear();
    if (!this.active) return;

    const def = this.definitions[this.active];
    if (!def || def.duration <= 0) return;

    const { width, height } = this.scene.scale;
    const ratio = Math.max(0, this.timeLeft / def.duration);
    const barW  = 160;
    const bx    = width / 2 - barW / 2;
    const by    = height - 28;

    // Background
    this.hudBar.fillStyle(0x0a1628, 0.85);
    this.hudBar.fillRect(bx - 4, by - 4, barW + 8, 14);

    // Fill
    const col = def.color;
    this.hudBar.fillStyle(col, 0.25);
    this.hudBar.fillRect(bx, by, barW, 6);
    this.hudBar.fillStyle(col, 1);
    this.hudBar.fillRect(bx, by, barW * ratio, 6);

    // Label
    const secs = Math.ceil(this.timeLeft / 1000);
    this.hudText.setText(`${def.label}  ${secs}s`);
  }

  // ── Floating pickup text ────────────────────────────────
  showPickupText(x, y, label, color) {
    const hex = '#' + color.toString(16).padStart(6, '0');
    const txt = this.scene.add.text(x, y - 10, label, {
      fontSize: '12px', fontFamily: 'monospace', color: hex, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);

    this.scene.tweens.add({
      targets:  txt,
      y:        y - 50,
      alpha:    0,
      duration: 900,
      ease:     'Power2',
      onComplete: () => txt.destroy(),
    });
  }

  // ── Called when player takes damage ────────────────────
  onPlayerHit() {
    if (this.scene.hasShield) {
      // Shield absorbs the hit
      this.scene.hasShield = false;
      if (this.active === 'shield') this.deactivate();
      // Spawn shield break particles
      this.scene.spawnExplosion(this.scene.ship.x, this.scene.ship.y, 0x69ff47);
      return true; // hit absorbed
    }
    if (this.scene.ghostMode) return true; // ghost — no damage
    return false; // hit lands
  }

  reset() {
    this.deactivate();
    this.orbs = [];
    this.hudBar.clear();
    this.hudText.setAlpha(0);
  }
}