class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // ── Background stars ───────────────────────────────────
    this.stars = [];
    for (let i = 0; i < 90; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        speed: Phaser.Math.FloatBetween(0.3, 1.4),
        size: Phaser.Math.FloatBetween(1, 2.2),
        alpha: Phaser.Math.FloatBetween(0.2, 1),
      });
    }

    this.bgGfx = this.add.graphics();
    this.uiGfx = this.add.graphics();

    // ── Title ──────────────────────────────────────────────
    this.titleTxt = this.add.text(width / 2, 130, 'GALAXY RUSH', {
      fontSize: '34px',
      fontFamily: 'monospace',
      color: '#00e5ff',
      fontStyle: 'bold',
      stroke: '#003344',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.subTxt = this.add.text(width / 2, 175, 'ARCADE ASSAULT', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#c8d8f0',
      letterSpacing: 2,
    }).setOrigin(0.5);

    this.tipTxt = this.add.text(width / 2, 215, 'Survive waves. Upgrade. Defeat bosses.', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#8fb3d9',
      align: 'center',
    }).setOrigin(0.5);

    // ── Menu buttons ───────────────────────────────────────
    this.buttons = [];

    this.createMenuButton(width / 2, 340, 220, 48, 'START GAME', true, () => {
      soundManager.play('uiClick');
      this.scene.start('GameScene', {
        wave: 1,
        score: 0,
        coins: 0,
        playerHP: 3,
        maxHP: 3,
        inventory: [null, null, null],
        fireRateLevel: 0,
        unlockedModes: ['single'],
        activeModeKey: 'single',
        hasPhoenixModule: false,
        phoenixBoughtCount: 0,
      });
    });

    this.createMenuButton(width / 2, 405, 220, 48, 'OPTIONS', false, () => {
      soundManager.play('uiClick');
      this.showSoonMessage('OPTIONS');
    });

    this.createMenuButton(width / 2, 470, 220, 48, 'SCORES', false, () => {
      soundManager.play('uiClick');
      this.showSoonMessage('SCORES');
    });

    // ── Footer ─────────────────────────────────────────────
    this.footerTxt = this.add.text(width / 2, height - 38, 'Tap a menu item to continue', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#6f8ca8',
    }).setOrigin(0.5);

    this.flashTxt = this.add.text(width / 2, 545, '', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#ffcc66',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    // ── Title pulse ────────────────────────────────────────
    this.tweens.add({
      targets: this.titleTxt,
      alpha: 0.82,
      yoyo: true,
      repeat: -1,
      duration: 900,
    });
  }

  createMenuButton(x, y, w, h, label, enabled, onClick) {
    const borderColor = enabled ? 0x00e5ff : 0x445566;
    const fillColor   = enabled ? 0x0a1628 : 0x11161d;
    const textColor   = enabled ? '#c8f6ff' : '#6b7785';

    const bg = this.add.rectangle(x, y, w, h, fillColor)
      .setStrokeStyle(1.5, borderColor, enabled ? 0.9 : 0.45)
      .setInteractive({ useHandCursor: enabled });

    const txt = this.add.text(x, y, label, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: textColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    if (enabled) {
      bg.on('pointerover', () => {
        bg.setFillStyle(0x11243a);
        bg.setStrokeStyle(2, 0x66f2ff, 1);
        txt.setScale(1.03);
      });

      bg.on('pointerout', () => {
        bg.setFillStyle(fillColor);
        bg.setStrokeStyle(1.5, borderColor, 0.9);
        txt.setScale(1);
      });

      bg.on('pointerdown', () => {
        bg.setFillStyle(0x16314b);
        txt.setScale(0.98);
      });

      bg.on('pointerup', () => {
        bg.setFillStyle(0x11243a);
        txt.setScale(1.03);
        onClick();
      });
    } else {
      bg.on('pointerdown', () => onClick());
    }

    this.buttons.push({ bg, txt, enabled });
  }

  showSoonMessage(label) {
    this.flashTxt.setText(label + ' COMING SOON');
    this.flashTxt.setAlpha(1);

    if (this.flashTween) {
      this.flashTween.stop();
    }

    this.flashTween = this.tweens.add({
      targets: this.flashTxt,
      alpha: 0,
      y: this.flashTxt.y - 18,
      duration: 950,
      ease: 'Power2',
      onComplete: () => {
        this.flashTxt.y = 545;
      }
    });
  }

  update() {
    const { width, height } = this.scale;

    this.bgGfx.clear();
    this.bgGfx.fillStyle(0x060a12, 1);
    this.bgGfx.fillRect(0, 0, width, height);

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.y += s.speed;
      if (s.y > height) {
        s.y = 0;
        s.x = Phaser.Math.Between(0, width);
      }

      this.bgGfx.fillStyle(0xffffff, s.alpha);
      this.bgGfx.fillCircle(s.x, s.y, s.size);
    }

    // subtle frame
    this.uiGfx.clear();
    this.uiGfx.lineStyle(1, 0x00e5ff, 0.12);
    this.uiGfx.strokeRect(10, 10, width - 20, height - 20);
    this.uiGfx.lineStyle(1, 0x00e5ff, 0.06);
    this.uiGfx.strokeRect(18, 18, width - 36, height - 36);
  }
}