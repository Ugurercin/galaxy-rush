class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  init(data) {
    this.wave       = data.wave      || 1;
    this.maxWaves   = data.maxWaves  || 5;
    this.score      = data.score     || 0;
    this.coins      = data.coins     || 0;
    this.playerHP   = data.playerHP  || 3;
    this.maxHP      = data.maxHP     || 3;
    this.inventory  = data.inventory || [null, null, null];
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x060a12, 0.96).setOrigin(0);

    // ── Header ─────────────────────────────────────────────
    this.add.text(width / 2, 32, 'SHOP', {
      fontSize: '26px', fontFamily: 'monospace',
      color: '#00e5ff', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, 62, `WAVE ${this.wave} CLEARED  —  NEXT: WAVE ${this.wave + 1}`, {
      fontSize: '11px', fontFamily: 'monospace', color: '#c8d8f0',
    }).setOrigin(0.5);

    // ── Coin + HP display ──────────────────────────────────
    this.coinTxt = this.add.text(width / 2 - 60, 88, `COINS  ${this.coins}`, {
      fontSize: '15px', fontFamily: 'monospace', color: '#ffeb3b', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.hpTxt = this.add.text(width / 2 + 60, 88, `HP  ${this.playerHP} / ${this.maxHP}`, {
      fontSize: '15px', fontFamily: 'monospace', color: '#ff3355', fontStyle: 'bold',
    }).setOrigin(0.5);

    // ── Divider ────────────────────────────────────────────
    const g = this.add.graphics();
    g.lineStyle(0.5, 0x00e5ff, 0.25);
    g.lineBetween(24, 106, width - 24, 106);

    // ── Section: Health ────────────────────────────────────
    this.add.text(24, 116, 'HEALTH', {
      fontSize: '10px', fontFamily: 'monospace',
      color: 'rgba(200,216,240,0.4)', letterSpacing: 3,
    });

    this.healthCards = [];
    this.buildHealthSection(130);

    // ── Divider ────────────────────────────────────────────
    const g2 = this.add.graphics();
    g2.lineStyle(0.5, 0x1a2a3a, 1);
    g2.lineBetween(24, 234, width - 24, 234);

    // ── Section: Powerups ──────────────────────────────────
    this.add.text(24, 244, 'POWERUPS', {
      fontSize: '10px', fontFamily: 'monospace',
      color: 'rgba(200,216,240,0.4)', letterSpacing: 3,
    });

    this.shopItems = [
      { type: 'rapidfire',  label: 'RAPID FIRE',   desc: 'Fire rate ×2.5 for 8s',         cost: 40,  color: 0x00e5ff },
      { type: 'spreadshot', label: 'SPREAD SHOT',  desc: '3-way bullets for 10s',          cost: 50,  color: 0xe040fb },
      { type: 'shield',     label: 'SHIELD',       desc: 'Absorbs one hit',                cost: 60,  color: 0x69ff47 },
      { type: 'screenbomb', label: 'SCREEN BOMB',  desc: 'Destroys all enemies instantly', cost: 80,  color: 0xff6d00 },
      { type: 'coinmagnet', label: 'COIN MAGNET',  desc: 'Attracts coins for 12s',         cost: 35,  color: 0xffeb3b },
      { type: 'ghostmode',  label: 'GHOST MODE',   desc: 'Invincible + 2× coins for 5s',   cost: 100, color: 0xce93d8 },
    ];

    this.itemCards = [];
    this.buildPowerupGrid(260);

    // ── Inventory preview ──────────────────────────────────
    this.add.text(width / 2, height - 146, 'YOUR LOADOUT', {
      fontSize: '10px', fontFamily: 'monospace',
      color: 'rgba(200,216,240,0.35)', letterSpacing: 3,
    }).setOrigin(0.5);

    this.invSlotGfx = this.add.graphics();
    this.invLabels  = [];
    this.drawInventoryPreview();

    // ── Ready button ───────────────────────────────────────
    const btnBg = this.add.rectangle(width / 2, height - 40, 200, 46, 0x0a1628)
      .setStrokeStyle(1, 0x00e5ff)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height - 40, 'READY', {
      fontSize: '18px', fontFamily: 'monospace', color: '#00e5ff', fontStyle: 'bold',
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x0d2040));
    btnBg.on('pointerout',  () => btnBg.setFillStyle(0x0a1628));
    btnBg.on('pointerdown', () => this.startNextWave());
  }

  // ── Health section — restore HP + upgrade max HP ────────
  buildHealthSection(startY) {
    const { width } = this.scale;
    const cardW = (width - 48 - 12) / 2;
    const cardH = 72;

    // Card 1 — Restore 1 HP
    const restoreCost    = 50;
    const canRestore     = this.coins >= restoreCost && this.playerHP < this.maxHP;
    this.buildHealthCard(
      24, startY, cardW, cardH,
      '+ RESTORE HP',
      `${this.playerHP} / ${this.maxHP} hearts`,
      restoreCost,
      0xff3355,
      canRestore,
      'restore',
    );

    // Card 2 — Upgrade max HP (cost scales with current max)
    const maxHPCost   = this.getMaxHPCost();
    const canUpgrade  = this.coins >= maxHPCost && this.maxHP < 6;
    const maxed       = this.maxHP >= 6;
    this.buildHealthCard(
      24 + cardW + 12, startY, cardW, cardH,
      '+ MAX HP',
      maxed ? 'MAXED OUT' : `${this.maxHP} → ${this.maxHP + 1} hearts`,
      maxed ? 0 : maxHPCost,
      0xff6688,
      canUpgrade && !maxed,
      'maxhp',
    );
  }

  getMaxHPCost() {
    // Scales: 3→4 = 80c, 4→5 = 130c, 5→6 = 200c
    const costs = { 3: 80, 4: 130, 5: 200 };
    return costs[this.maxHP] || 999;
  }

  buildHealthCard(x, y, w, h, label, desc, cost, color, canBuy, action) {
    const hexColor = '#' + color.toString(16).padStart(6, '0');
    const alpha    = canBuy ? 1 : 0.38;
    const maxed    = action === 'maxhp' && this.maxHP >= 6;

    const bg = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x0a1628)
      .setStrokeStyle(0.8, canBuy ? color : 0x1a2a3a)
      .setAlpha(alpha);

    if (canBuy) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => bg.setStrokeStyle(1.2, color));
      bg.on('pointerout',  () => bg.setStrokeStyle(0.8, color));
      bg.on('pointerdown', () => {
        if (action === 'restore') this.buyRestoreHP();
        if (action === 'maxhp')   this.buyMaxHP();
      });
    }

    // Accent bar
    this.add.rectangle(x, y + h / 2, 3, h, color).setOrigin(0, 0.5).setAlpha(alpha);

    this.add.text(x + 12, y + 14, label, {
      fontSize: '12px', fontFamily: 'monospace', color: hexColor, fontStyle: 'bold',
    }).setAlpha(alpha);

    this.add.text(x + 12, y + 32, desc, {
      fontSize: '10px', fontFamily: 'monospace', color: '#c8d8f0',
    }).setAlpha(alpha * 0.7);

    const costStr = maxed ? 'MAXED' : cost > 0 ? `${cost} ¢` : '';
    const costColor = canBuy ? '#ffeb3b' : maxed ? hexColor : '#ff3355';
    this.add.text(x + w - 10, y + h - 10, costStr, {
      fontSize: '11px', fontFamily: 'monospace', color: costColor, fontStyle: 'bold',
    }).setOrigin(1, 1).setAlpha(alpha);

    this.healthCards.push(bg);
  }

  buyRestoreHP() {
    const cost = 50;
    if (this.coins < cost || this.playerHP >= this.maxHP) return;
    this.coins    -= cost;
    this.playerHP  = Math.min(this.playerHP + 1, this.maxHP);
    this.refreshAll();
  }

  buyMaxHP() {
    const cost = this.getMaxHPCost();
    if (this.coins < cost || this.maxHP >= 6) return;
    this.coins -= cost;
    this.maxHP++;
    this.playerHP = Math.min(this.playerHP + 1, this.maxHP); // also restore 1 on upgrade
    this.refreshAll();
  }

  // ── Powerup grid ───────────────────────────────────────
  buildPowerupGrid(startY) {
    const { width } = this.scale;
    const cols  = 2;
    const cardW = (width - 48 - 12) / 2;
    const cardH = 74;
    const gapY  = 8;

    this.shopItems.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x   = 24 + col * (cardW + 12);
      const y   = startY + row * (cardH + gapY);
      this.buildPowerupCard(item, x, y, cardW, cardH);
    });
  }

  buildPowerupCard(item, x, y, w, h) {
    const canAfford = this.coins >= item.cost;
    const inInv     = this.inventory.includes(item.type);
    const hexColor  = '#' + item.color.toString(16).padStart(6, '0');
    const alpha     = (!canAfford || inInv) ? 0.35 : 1;

    const bg = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x0a1628)
      .setStrokeStyle(0.8, inInv ? item.color : 0x1a2a3a)
      .setAlpha(alpha);

    if (canAfford && !inInv) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => bg.setStrokeStyle(1, item.color));
      bg.on('pointerout',  () => bg.setStrokeStyle(0.8, 0x1a2a3a));
      bg.on('pointerdown', () => this.buyPowerup(item));
    }

    this.add.rectangle(x, y + h / 2, 3, h, item.color).setOrigin(0, 0.5).setAlpha(alpha);

    this.add.text(x + 12, y + 12, item.label, {
      fontSize: '12px', fontFamily: 'monospace', color: hexColor, fontStyle: 'bold',
    }).setAlpha(alpha);

    this.add.text(x + 12, y + 30, item.desc, {
      fontSize: '10px', fontFamily: 'monospace', color: '#c8d8f0',
      wordWrap: { width: w - 20 },
    }).setAlpha(alpha * 0.7);

    const costColor = canAfford ? '#ffeb3b' : '#ff3355';
    this.add.text(x + w - 10, y + h - 10, inInv ? 'OWNED' : `${item.cost} ¢`, {
      fontSize: '11px', fontFamily: 'monospace',
      color: inInv ? hexColor : costColor, fontStyle: 'bold',
    }).setOrigin(1, 1).setAlpha(alpha);
  }

  buyPowerup(item) {
    if (this.coins < item.cost) return;
    const emptySlot = this.inventory.indexOf(null);
    if (emptySlot === -1) { this.showToast('Inventory full!'); return; }
    this.coins -= item.cost;
    this.inventory[emptySlot] = item.type;
    this.refreshAll();
  }

  // ── Full refresh ────────────────────────────────────────
  refreshAll() {
    // Destroy all dynamic children except permanent ones
    this.children.list
      .filter(c => c.type === 'Rectangle' || c.type === 'Text')
      .filter(c => c.depth === 0)
      .forEach(c => c.destroy());

    // Re-create everything
    this.scene.restart({
      wave:      this.wave,
      maxWaves:  this.maxWaves,
      score:     this.score,
      coins:     this.coins,
      playerHP:  this.playerHP,
      maxHP:     this.maxHP,
      inventory: this.inventory,
    });
  }

  // ── Inventory preview ───────────────────────────────────
  drawInventoryPreview() {
    const { width, height } = this.scale;
    const g      = this.invSlotGfx;
    const slotW  = 88, slotH = 40, gap = 12;
    const totalW = 3 * slotW + 2 * gap;
    const startX = (width - totalW) / 2;
    const y      = height - 116;

    g.clear();
    this.invLabels.forEach(l => l.destroy());
    this.invLabels = [];

    for (let i = 0; i < 3; i++) {
      const sx   = startX + i * (slotW + gap);
      const type = this.inventory[i];
      const def  = type ? this.shopItems.find(s => s.type === type) : null;
      const col  = def ? def.color : 0x1a2a3a;

      g.fillStyle(0x0a1628, 1);    g.fillRect(sx, y, slotW, slotH);
      g.lineStyle(0.8, col, def ? 0.9 : 0.25);
      g.strokeRect(sx, y, slotW, slotH);

      if (def) {
        g.fillStyle(col, 0.12); g.fillRect(sx, y, slotW, slotH);
        const lbl = this.add.text(sx + slotW / 2, y + slotH / 2, def.label, {
          fontSize: '9px', fontFamily: 'monospace',
          color: '#' + col.toString(16).padStart(6, '0'),
          fontStyle: 'bold', align: 'center', wordWrap: { width: slotW - 8 },
        }).setOrigin(0.5);
        this.invLabels.push(lbl);

        // Tap slot to refund
        const hit = this.add.rectangle(sx + slotW / 2, y + slotH / 2, slotW, slotH)
          .setFillStyle(0, 0).setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => {
          this.inventory[i] = null;
          this.coins += Math.floor(def.cost * 0.5);
          this.refreshAll();
        });
        this.invLabels.push(hit);
      } else {
        const empty = this.add.text(sx + slotW / 2, y + slotH / 2, 'EMPTY', {
          fontSize: '9px', fontFamily: 'monospace', color: 'rgba(200,216,240,0.18)',
        }).setOrigin(0.5);
        this.invLabels.push(empty);
      }
    }
  }

  showToast(msg) {
    const { width, height } = this.scale;
    const txt = this.add.text(width / 2, height / 2, msg, {
      fontSize: '12px', fontFamily: 'monospace', color: '#ff3355',
      backgroundColor: '#0a1628', padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setDepth(20);
    this.time.addEvent({ delay: 1800, callback: () => txt.destroy() });
  }

  startNextWave() {
    this.scene.start('GameScene', {
      wave:      this.wave + 1,
      score:     this.score,
      coins:     this.coins,
      playerHP:  this.playerHP,
      maxHP:     this.maxHP,
      inventory: this.inventory,
    });
  }
}