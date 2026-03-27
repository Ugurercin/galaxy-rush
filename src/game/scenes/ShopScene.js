class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  init(data) {
    this.wave              = data.wave || 1;
    this.maxWaves          = data.maxWaves || 5;
    this.score             = data.score || 0;
    this.coins             = data.coins || 0;
    this.playerHP          = data.playerHP || 3;
    this.maxHP             = data.maxHP || 3;
    this.inventory         = data.inventory || [null, null, null];
    this.fireRateLevel     = data.fireRateLevel || 0;
    this.unlockedModes     = data.unlockedModes || ['single'];
    this.activeModeKey     = data.activeModeKey || 'single';
    this.activeTab         = data.activeTab || 0;

    // Phoenix persistence
    this.hasPhoenixModule   = data.hasPhoenixModule || false;
    this.phoenixBoughtCount = data.phoenixBoughtCount || 0;
  }

  create() {
    const { width, height } = this.scale;

    // ── Layout constants ───────────────────────────────────
    this.PAD = 18;
    this.GAP = 10;

    this.HEADER_H = 118;
    this.TABBAR_H = 42;
    this.BOTTOM_H = 118;

    this.CARD_H = 82;
    this.WIDE_CARD_H = 78;

    this.contentTop = this.HEADER_H + this.TABBAR_H + 10;
    this.contentBottom = height - this.BOTTOM_H - 8;
    this.contentHeight = this.contentBottom - this.contentTop;

    this.columns = width >= 430 ? 2 : 1;
    this.cardGap = 10;
    this.cardW =
      this.columns === 2
        ? (width - this.PAD * 2 - this.cardGap) / 2
        : (width - this.PAD * 2);

    // Keep shop definitions available globally in this scene
    this.shopItems = [
      { type: 'rapidfire',  label: 'Rapid Fire',     desc: 'Fire rate ×2.5 for 8s',                cost: 40,  color: 0x00e5ff },
      { type: 'spreadshot', label: 'Spread Shot',    desc: '3-way bullets for 10s',                cost: 50,  color: 0xe040fb },
      { type: 'shield',     label: 'Shield',         desc: 'Absorbs one hit',                      cost: 60,  color: 0x69ff47 },
      { type: 'screenbomb', label: 'Screen Bomb',    desc: 'Destroys all enemies instantly',       cost: 80,  color: 0xff6d00 },
      { type: 'coinmagnet', label: 'Coin Magnet',    desc: 'Attracts coins for 12s',               cost: 35,  color: 0xffeb3b },
      { type: 'ghostmode',  label: 'Ghost Mode',     desc: 'Invincible + 2× coins for 5s',        cost: 100, color: 0xce93d8 },
      { type: 'phoenix',    label: 'Phoenix Module', desc: 'Revive once with 1 HP on lethal hit', cost: 120, color: 0xff9e2c },
    ];

    // ── Background ─────────────────────────────────────────
    this.add.rectangle(0, 0, width, height, 0x060a12).setOrigin(0);

    // ── Header ─────────────────────────────────────────────
    this.add.text(width / 2, 22, 'Shop', {
      fontSize: '26px',
      fontFamily: 'Arial, sans-serif',
      color: '#00e5ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, 50, `Wave ${this.wave} of ${this.maxWaves} cleared`, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#9fb3c8',
    }).setOrigin(0.5);

    this._buildStatsRow(width, 78);

    this.add.graphics()
      .lineStyle(1, 0x00e5ff, 0.12)
      .lineBetween(this.PAD, 100, width - this.PAD, 100);

    // ── Tab bar ────────────────────────────────────────────
    this.tabLabels = ['Upgrades', 'Modes', 'Powerups'];
    this._buildTabBar(width, 108);

    // ── Scrollable content viewport ────────────────────────
    this.contentMaskShape = this.make.graphics({ x: 0, y: 0, add: false });
    this.contentMaskShape.fillStyle(0xffffff, 1);
    this.contentMaskShape.fillRect(this.PAD, this.contentTop, width - this.PAD * 2, this.contentHeight);
    this.contentMask = this.contentMaskShape.createGeometryMask();

    this.contentContainer = this.add.container(0, 0);
    this.contentContainer.setMask(this.contentMask);

    this.contentScrollY = 0;
    this.contentTotalHeight = 0;

    this._showTab(this.activeTab);

    this.input.on('wheel', (_pointer, _go, _dx, dy) => {
      if (this.contentTotalHeight <= this.contentHeight) return;
      this.contentScrollY = Phaser.Math.Clamp(
        this.contentScrollY - dy * 0.6,
        -(this.contentTotalHeight - this.contentHeight),
        0
      );
      this.contentContainer.y = this.contentScrollY;
    });

    // ── Bottom ─────────────────────────────────────────────
    this._buildBottom(width, height);
  }

  // ── Stats row ───────────────────────────────────────────
  _buildStatsRow(width, y) {
    const third = width / 3;

    this.add.text(third * 0.5, y, `⬡ ${this.coins}`, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffeb3b',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(third * 1.5, y, `♥ ${this.playerHP} / ${this.maxHP}`, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff5577',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const frPct = this.fireRateLevel * 10;
    this.add.text(third * 2.5, y, `⚡ +${frPct}%`, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#00e5ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  // ── Tab bar ─────────────────────────────────────────────
  _buildTabBar(width, y) {
    this.tabBtns = [];
    const tabW = (width - this.PAD * 2) / this.tabLabels.length;

    this.tabBtns = this.tabLabels.map((label, i) => {
      const cx = this.PAD + tabW * i + tabW / 2;
      const active = i === this.activeTab;

      const bg = this.add.rectangle(cx, y + 18, tabW - 6, 34, active ? 0x0d2040 : 0x080e1a)
        .setStrokeStyle(active ? 1 : 0.5, active ? 0x00e5ff : 0x1a2a3a)
        .setInteractive({ useHandCursor: true });

      const txt = this.add.text(cx, y + 18, label, {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: active ? '#00e5ff' : '#8da4bb',
        fontStyle: active ? 'bold' : 'normal',
      }).setOrigin(0.5);

      bg.on('pointerdown', () => {
        soundManager.play('uiClick');
        this._showTab(i);
      });

      return { bg, txt };
    });
  }

  _updateTabBar() {
    this.tabBtns.forEach(({ bg, txt }, i) => {
      const active = i === this.activeTab;
      bg.setFillStyle(active ? 0x0d2040 : 0x080e1a);
      bg.setStrokeStyle(active ? 1 : 0.5, active ? 0x00e5ff : 0x1a2a3a);
      txt.setColor(active ? '#00e5ff' : '#8da4bb');
      txt.setStyle({ fontStyle: active ? 'bold' : 'normal' });
    });
  }

  // ── Tab switch ──────────────────────────────────────────
  _showTab(index) {
    this.activeTab = index;
    this._updateTabBar();

    this.contentContainer.removeAll(true);
    this.contentScrollY = 0;
    this.contentContainer.y = 0;

    let usedHeight = 0;

    switch (index) {
      case 0:
        usedHeight = this._buildUpgradesTab(this.contentTop);
        break;
      case 1:
        usedHeight = this._buildModesTab(this.contentTop);
        break;
      case 2:
        usedHeight = this._buildPowerupsTab(this.contentTop);
        break;
    }

    this.contentTotalHeight = Math.max(usedHeight - this.contentTop + 14, 0);
  }

  // ══════════════════════════════════════════════════════════
  // TAB 0 — Upgrades
  // ══════════════════════════════════════════════════════════
  _buildUpgradesTab(startY) {
    const { width } = this.scale;
    let y = startY;

    this._sectionLabel('Health', y);
    y += 16;

    this._permCard(
      this.PAD, y, this.cardW, this.CARD_H,
      'Restore HP',
      `${this.playerHP} / ${this.maxHP} hearts  ·  50 ¢`,
      0xff5577,
      this.coins >= 50 && this.playerHP < this.maxHP,
      () => this.buyRestoreHP()
    );

    if (this.columns === 2) {
      this._permCard(
        this.PAD + this.cardW + this.cardGap, y, this.cardW, this.CARD_H,
        'Max HP Up',
        this.maxHP >= 6
          ? 'Maxed out'
          : `${this.maxHP} → ${this.maxHP + 1}  ·  ${this.getMaxHPCost()} ¢`,
        0xff8899,
        this.coins >= this.getMaxHPCost() && this.maxHP < 6,
        () => this.buyMaxHP()
      );
      y += this.CARD_H + 18;
    } else {
      y += this.CARD_H + 10;
      this._permCard(
        this.PAD, y, this.cardW, this.CARD_H,
        'Max HP Up',
        this.maxHP >= 6
          ? 'Maxed out'
          : `${this.maxHP} → ${this.maxHP + 1}  ·  ${this.getMaxHPCost()} ¢`,
        0xff8899,
        this.coins >= this.getMaxHPCost() && this.maxHP < 6,
        () => this.buyMaxHP()
      );
      y += this.CARD_H + 18;
    }

    this._sectionLabel('Fire Rate', y);
    y += 16;

    const frLevel = this.fireRateLevel;
    const frMaxed = frLevel >= 5;
    const frCost = this.getFireRateCost();
    const frPct = frLevel * 10;
    const frDesc = frMaxed
      ? `Maxed — ${frPct}% faster`
      : `Level ${frLevel} → ${frLevel + 1}  ·  ${frCost} ¢  (${frPct}% → ${frPct + 10}%)`;

    this._permCard(
      this.PAD, y, width - this.PAD * 2, this.WIDE_CARD_H,
      'Fire Rate Up',
      frDesc,
      0x00e5ff,
      !frMaxed && this.coins >= frCost,
      () => this.buyFireRate()
    );

    return y + this.WIDE_CARD_H;
  }

  // ══════════════════════════════════════════════════════════
  // TAB 1 — Modes
  // ══════════════════════════════════════════════════════════
  _buildModesTab(startY) {
    const { width } = this.scale;
    let y = startY;

    this.firingModeItems = [
  { key: 'double', label: 'Double Shot',    desc: 'Two parallel bullets from wing tips', cost: 150, color: 0x69ff47, icon: '⋈' },
  { key: 'triple', label: 'Triple Shot',    desc: 'Three straight bullets in a wide line', cost: 230, color: 0x00b0ff, icon: '≡' },
  { key: 'quad',   label: 'Quadruple Shot', desc: 'Four straight bullets across the ship front', cost: 320, color: 0xffd54f, icon: '⁞' },
  { key: 'laser',  label: 'Laser Beam',     desc: 'Continuous beam, tick damage', cost: 220, color: 0xff2244, icon: '|' },
  { key: 'rocket', label: 'Rocket',         desc: 'Slow projectile, area explosion', cost: 280, color: 0xff9900, icon: '◈' },
];

    const modeDef = this.firingModeItems.find(m => m.key === this.activeModeKey);
    const modeLabel = this.activeModeKey === 'single' ? 'Single Shot' : modeDef?.label || 'Single Shot';
    const modeColor = this.activeModeKey === 'single'
      ? '#00e5ff'
      : '#' + modeDef.color.toString(16).padStart(6, '0');

    this._addText(width / 2, y + 8, `Active: ${modeLabel}`, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: modeColor,
    }).setOrigin(0.5);

    y += 28;

    this.firingModeItems.forEach(item => {
      const owned = this.unlockedModes.includes(item.key);
      const canBuy = !owned && this.coins >= item.cost;
      const hex = '#' + item.color.toString(16).padStart(6, '0');
      const alpha = (owned || canBuy) ? 1 : 0.4;
      const desc = owned ? item.desc : `${item.desc}  ·  ${item.cost} ¢`;

      const card = this._makeCard(this.PAD, y, width - this.PAD * 2, 86, item.color, owned || canBuy);

      const iconBg = this.add.rectangle(this.PAD + 28, y + 43, 36, 36, item.color, 0.15)
        .setOrigin(0.5)
        .setAlpha(alpha);
      this.contentContainer.add(iconBg);

      const icon = this._addText(this.PAD + 28, y + 43, item.icon, {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: hex,
        fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(alpha);

      this._addText(this.PAD + 54, y + 12, item.label, {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: hex,
        fontStyle: 'bold',
      }).setAlpha(alpha);

      this._addText(this.PAD + 54, y + 34, desc, {
        fontSize: '11px',
        fontFamily: 'Arial, sans-serif',
        color: '#a9bed3',
        wordWrap: { width: width - this.PAD * 2 - 86 },
      }).setAlpha(alpha);

      this._addText(width - this.PAD - 10, y + 72, owned ? 'Owned' : `${item.cost} ¢`, {
        fontSize: '11px',
        fontFamily: 'Arial, sans-serif',
        color: owned ? hex : canBuy ? '#ffeb3b' : '#ff5577',
        fontStyle: 'bold',
      }).setOrigin(1, 1).setAlpha(alpha);

      if (canBuy) {
        card.on('pointerdown', () => this.buyFiringMode(item));
      }

      y += 96;
    });

    return y;
  }

  // ══════════════════════════════════════════════════════════
  // TAB 2 — Powerups
  // ══════════════════════════════════════════════════════════
  _buildPowerupsTab(startY) {
    const { width } = this.scale;
    let y = startY;

    const usedSlots = this.inventory.filter(Boolean).length;
    this._addText(width / 2, y + 8, `Loadout: ${usedSlots} / 3 slots used`, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#8da4bb',
    }).setOrigin(0.5);

    y += 24;

    this.shopItems.forEach((item, i) => {
      const col = this.columns === 2 ? i % 2 : 0;
      const row = this.columns === 2 ? Math.floor(i / 2) : i;
      const x = this.PAD + col * (this.cardW + this.cardGap);
      const cy = y + row * (this.CARD_H + this.cardGap);

      const isPhoenix = item.type === 'phoenix';
      const inInv = this.inventory.includes(item.type);
      const canAfford = this.coins >= item.cost;
      const phoenixLimitReached = isPhoenix && this.phoenixBoughtCount >= 2;
      const phoenixAlreadyActive = isPhoenix && this.hasPhoenixModule;
      const blockedBySpecialRule = phoenixLimitReached || phoenixAlreadyActive;
      const canBuy = canAfford && !inInv && !blockedBySpecialRule;

      const hex = '#' + item.color.toString(16).padStart(6, '0');
      const alpha = canBuy || inInv || blockedBySpecialRule ? 1 : 0.38;

      const card = this._makeCard(x, cy, this.cardW, this.CARD_H, item.color, canBuy);

      let desc = item.desc;
      let priceLabel = `${item.cost} ¢`;
      let priceColor = canAfford ? '#ffeb3b' : '#ff5577';

      if (inInv) {
        priceLabel = 'Owned';
        priceColor = hex;
      } else if (phoenixAlreadyActive) {
        desc = 'Phoenix is already armed on your ship';
        priceLabel = 'Active';
        priceColor = hex;
      } else if (phoenixLimitReached) {
        desc = 'Maximum 2 purchases per run';
        priceLabel = 'Limit';
        priceColor = '#ff5577';
      }

      this._addText(x + 12, cy + 12, item.label, {
        fontSize: '13px',
        fontFamily: 'Arial, sans-serif',
        color: hex,
        fontStyle: 'bold',
      }).setAlpha(alpha);

      this._addText(x + 12, cy + 33, desc, {
        fontSize: '10px',
        fontFamily: 'Arial, sans-serif',
        color: '#a9bed3',
        wordWrap: { width: this.cardW - 22 },
      }).setAlpha(alpha);

      this._addText(x + this.cardW - 8, cy + this.CARD_H - 8, priceLabel, {
        fontSize: '11px',
        fontFamily: 'Arial, sans-serif',
        color: priceColor,
        fontStyle: 'bold',
      }).setOrigin(1, 1).setAlpha(alpha);

      if (canBuy) {
        card.on('pointerdown', () => this.buyPowerup(item));
      }
    });

    const rows = this.columns === 2
      ? Math.ceil(this.shopItems.length / 2)
      : this.shopItems.length;

    return y + rows * (this.CARD_H + this.cardGap);
  }

  // ── Helpers ─────────────────────────────────────────────
  _addText(x, y, text, style) {
    const t = this.add.text(x, y, text, style);
    this.contentContainer.add(t);
    return t;
  }

  _sectionLabel(text, y) {
    this._addText(this.PAD, y, text.toUpperCase(), {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#6f8498',
      letterSpacing: 2,
    });
  }

  _makeCard(x, y, w, h, color, interactive) {
    const bg = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x0a1628)
      .setStrokeStyle(1, interactive ? color : 0x1a2a3a);

    const accent = this.add.rectangle(x, y + h / 2, 3, h, color).setOrigin(0, 0.5);

    this.contentContainer.add([bg, accent]);

    if (interactive) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => bg.setFillStyle(0x0d2040));
      bg.on('pointerout', () => bg.setFillStyle(0x0a1628));
    }

    return bg;
  }

  _permCard(x, y, w, h, label, desc, color, canBuy, onBuy) {
    const hex = '#' + color.toString(16).padStart(6, '0');
    const alpha = canBuy ? 1 : 0.38;

    const bg = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x0a1628)
      .setStrokeStyle(1, canBuy ? color : 0x1a2a3a)
      .setAlpha(alpha);

    const accent = this.add.rectangle(x, y + h / 2, 3, h, color)
      .setOrigin(0, 0.5)
      .setAlpha(alpha);

    this.contentContainer.add([bg, accent]);

    if (canBuy) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => bg.setFillStyle(0x0d2040));
      bg.on('pointerout', () => bg.setFillStyle(0x0a1628));
      bg.on('pointerdown', onBuy);
    }

    this._addText(x + 12, y + 12, label, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: hex,
      fontStyle: 'bold',
    }).setAlpha(alpha);

    this._addText(x + 12, y + 34, desc, {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#a9bed3',
      wordWrap: { width: w - 22 },
    }).setAlpha(alpha);
  }

  // ── Bottom: loadout + ready ─────────────────────────────
  _buildBottom(width, height) {
    const panelY = height - this.BOTTOM_H;

    this.add.rectangle(0, panelY, width, this.BOTTOM_H, 0x060a12)
      .setOrigin(0)
      .setDepth(20);

    this.add.graphics()
      .lineStyle(1, 0x00e5ff, 0.12)
      .lineBetween(0, panelY, width, panelY)
      .setDepth(21);

    this.add.text(width / 2, panelY + 12, 'Loadout (tap item to sell for 50%)', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#6f8498',
      letterSpacing: 1,
    }).setOrigin(0.5).setDepth(22);

    this.invSlotGfx = this.add.graphics().setDepth(22);
    this.invLabels = [];
    this._drawSlots(width, panelY + 24);

    const btnBg = this.add.rectangle(width / 2, height - 24, width - 36, 40, 0x0a1628)
      .setStrokeStyle(1, 0x00e5ff)
      .setInteractive({ useHandCursor: true })
      .setDepth(22);

    this.add.text(width / 2, height - 24, 'Ready  →', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#00e5ff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(23);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x0d2040));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x0a1628));
    btnBg.on('pointerdown', () => this.startNextWave());
  }

  _drawSlots(width, y) {
    const g = this.invSlotGfx;
    const slotW = Math.min(88, (width - 60) / 3);
    const slotH = 38;
    const gap = 10;
    const totalW = 3 * slotW + 2 * gap;
    const startX = (width - totalW) / 2;

    g.clear();
    this.invLabels.forEach(l => { try { l.destroy(); } catch (e) {} });
    this.invLabels = [];

    for (let i = 0; i < 3; i++) {
      const sx = startX + i * (slotW + gap);
      const type = this.inventory[i];
      const def = type ? this.shopItems.find(s => s.type === type) : null;
      const col = def ? def.color : 0x1a2a3a;

      g.fillStyle(0x080e1a, 1);
      g.fillRoundedRect(sx, y, slotW, slotH, 8);

      g.lineStyle(1, col, def ? 0.8 : 0.25);
      g.strokeRoundedRect(sx, y, slotW, slotH, 8);

      if (def) {
        g.fillStyle(col, 0.08);
        g.fillRoundedRect(sx, y, slotW, slotH, 8);

        const lbl = this.add.text(sx + slotW / 2, y + slotH / 2, def.label, {
          fontSize: '10px',
          fontFamily: 'Arial, sans-serif',
          color: '#' + col.toString(16).padStart(6, '0'),
          fontStyle: 'bold',
          align: 'center',
          wordWrap: { width: slotW - 10 },
        }).setOrigin(0.5).setDepth(23);

        const hit = this.add.rectangle(sx + slotW / 2, y + slotH / 2, slotW, slotH)
          .setFillStyle(0, 0)
          .setInteractive({ useHandCursor: true })
          .setDepth(24);

        hit.on('pointerdown', () => {
          this.inventory[i] = null;
          this.coins += Math.floor(def.cost * 0.5);
          this.refreshAll();
        });

        this.invLabels.push(lbl, hit);
      } else {
        const e = this.add.text(sx + slotW / 2, y + slotH / 2, 'empty', {
          fontSize: '10px',
          fontFamily: 'Arial, sans-serif',
          color: '#55697c',
        }).setOrigin(0.5).setDepth(23);

        this.invLabels.push(e);
      }
    }
  }

  // ── Costs ───────────────────────────────────────────────
  getMaxHPCost() {
    return ({ 3: 80, 4: 130, 5: 200 })[this.maxHP] || 999;
  }

  getFireRateCost() {
    return ([80, 120, 170, 230, 300])[this.fireRateLevel] || 0;
  }

  // ── Purchases ───────────────────────────────────────────
  buyRestoreHP() {
    if (this.coins < 50 || this.playerHP >= this.maxHP) return;
    soundManager.play('uiClick');
    this.coins -= 50;
    this.playerHP = Math.min(this.playerHP + 1, this.maxHP);
    this.refreshAll();
  }

  buyMaxHP() {
    const cost = this.getMaxHPCost();
    if (this.coins < cost || this.maxHP >= 6) return;
    soundManager.play('uiClick');
    this.coins -= cost;
    this.maxHP++;
    this.playerHP = Math.min(this.playerHP + 1, this.maxHP);
    this.refreshAll();
  }

  buyFireRate() {
    const cost = this.getFireRateCost();
    if (this.coins < cost || this.fireRateLevel >= 5) return;
    soundManager.play('uiClick');
    this.coins -= cost;
    this.fireRateLevel++;
    this.refreshAll();
  }

  buyFiringMode(item) {
    if (this.coins < item.cost || this.unlockedModes.includes(item.key)) return;
    soundManager.play('uiClick');
    this.coins -= item.cost;
    this.unlockedModes = [...this.unlockedModes, item.key];
    this.refreshAll();
  }

  buyPowerup(item) {
    if (this.coins < item.cost) return;

    if (item.type === 'phoenix') {
      if (this.hasPhoenixModule) {
        this._toast('Phoenix already active');
        return;
      }
      if (this.phoenixBoughtCount >= 2) {
        this._toast('Phoenix limit reached');
        return;
      }
    }

    const slot = this.inventory.indexOf(null);
    if (slot === -1) {
      this._toast('Inventory full!');
      return;
    }

    soundManager.play('uiClick');
    this.coins -= item.cost;
    this.inventory[slot] = item.type;

    if (item.type === 'phoenix') {
      this.phoenixBoughtCount++;
    }

    this.refreshAll();
  }

  // ── Refresh ─────────────────────────────────────────────
  refreshAll() {
    this.scene.restart({
      wave: this.wave,
      maxWaves: this.maxWaves,
      score: this.score,
      coins: this.coins,
      playerHP: this.playerHP,
      maxHP: this.maxHP,
      inventory: this.inventory,
      fireRateLevel: this.fireRateLevel,
      unlockedModes: this.unlockedModes,
      activeModeKey: this.activeModeKey,
      activeTab: this.activeTab,
      hasPhoenixModule: this.hasPhoenixModule,
      phoenixBoughtCount: this.phoenixBoughtCount,
    });
  }

  startNextWave() {
  soundManager.play('uiClick');
  this.scene.start('GameScene', {
    wave: this.wave,
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

  _toast(msg) {
    const { width, height } = this.scale;
    const t = this.add.text(width / 2, height / 2, msg, {
      fontSize: '13px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff5577',
      backgroundColor: '#0a1628',
      padding: { x: 12, y: 8 },
    }).setOrigin(0.5).setDepth(40);

    this.time.addEvent({
      delay: 1600,
      callback: () => t.destroy(),
    });
  }
}