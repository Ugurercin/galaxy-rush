class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Start / resume menu background music
    soundManager.resume();
    soundManager.switchMusic('menuMusic');

    // ── Animated star background ──────────────────────────
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

    this.add.rectangle(0, 0, width, height, 0x060a12).setOrigin(0);

    // ── Title ─────────────────────────────────────────────
    this.titleTop = this.add.text(width / 2, height * 0.22, 'GALAXY', {
      fontSize: '44px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#102030',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.titleBottom = this.add.text(width / 2, height * 0.22 + 52, 'RUSH', {
      fontSize: '44px',
      fontFamily: 'monospace',
      color: '#00e5ff',
      fontStyle: 'bold',
      stroke: '#003344',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.subTxt = this.add.text(width / 2, height * 0.22 + 105, 'ARCADE ASSAULT', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#8fb3d9',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tipTxt = this.add.text(width / 2, height * 0.22 + 135, 'Survive waves. Upgrade. Defeat bosses.', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#6f8ca8',
      align: 'center',
    }).setOrigin(0.5);

    // ── Buttons ───────────────────────────────────────────
    this.buttons = [];

    this.createMenuButton(width / 2, height * 0.53, 220, 50, 'START GAME', true, () => {
      soundManager.resume();
      soundManager.play('uiClick');
      soundManager.switchMusic('music');

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

    this.createMenuButton(width / 2, height * 0.53 + 66, 220, 50, 'OPTIONS', false, () => {
      soundManager.resume();
      soundManager.play('uiClick');
      this.showSoonMessage('OPTIONS');
    });

    this.createMenuButton(width / 2, height * 0.53 + 132, 220, 50, 'SCORES', false, () => {
      soundManager.resume();
      soundManager.play('uiClick');
      this.showSoonMessage('SCORES');
    });

    this.footerTxt = this.add.text(width / 2, height - 36, 'Tap a menu item to continue', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#6f8ca8',
    }).setOrigin(0.5);

    this.flashTxt = this.add.text(width / 2, height * 0.53 + 205, '', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#ffcc66',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: [this.titleTop, this.titleBottom],
      alpha: 0.85,
      yoyo: true,
      repeat: -1,
      duration: 1000,
    });
  }

  createMenuButton(x, y, w, h, label, enabled, onClick) {
    const borderColor = enabled ? 0x00e5ff : 0x445566;
    const fillColor = enabled ? 0x0a1628 : 0x11161d;
    const hoverColor = enabled ? 0x11243a : 0x161b22;
    const pressColor = enabled ? 0x16314b : 0x1b1f26;
    const textColor = enabled ? '#00e5ff' : '#6b7785';

    const bg = this.add.rectangle(x, y, w, h, fillColor)
      .setStrokeStyle(1.5, borderColor, enabled ? 0.95 : 0.45)
      .setInteractive({ useHandCursor: true });

    const txt = this.add.text(x, y, label, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: textColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    bg.on('pointerover', () => {
      bg.setFillStyle(hoverColor);
      txt.setScale(1.03);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(fillColor);
      txt.setScale(1);
    });

    bg.on('pointerdown', () => {
      bg.setFillStyle(pressColor);
      txt.setScale(0.98);
    });

    bg.on('pointerup', () => {
      bg.setFillStyle(hoverColor);
      txt.setScale(1.03);
      onClick();
    });

    this.buttons.push({ bg, txt, enabled });
  }

  showSoonMessage(label) {
    this.flashTxt.setText(label + ' COMING SOON');
    this.flashTxt.setAlpha(1);
    this.flashTxt.y = this.scale.height * 0.53 + 205;

    if (this.flashTween) {
      this.flashTween.stop();
    }

    this.flashTween = this.tweens.add({
      targets: this.flashTxt,
      alpha: 0,
      y: this.flashTxt.y - 18,
      duration: 950,
      ease: 'Power2',
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
        s.y = -2;
        s.x = Phaser.Math.Between(0, width);
      }

      this.bgGfx.fillStyle(0xffffff, s.alpha);
      this.bgGfx.fillCircle(s.x, s.y, s.size);
    }

    this.uiGfx.clear();
    this.uiGfx.lineStyle(1, 0x00e5ff, 0.12);
    this.uiGfx.strokeRect(10, 10, width - 20, height - 20);
    this.uiGfx.lineStyle(1, 0x00e5ff, 0.05);
    this.uiGfx.strokeRect(18, 18, width - 36, height - 36);
  }
}