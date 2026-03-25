class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore  = data.score || 0;
    this.coinsEarned = data.coins || 0;
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x060a12).setOrigin(0);

    this.add.text(width / 2, height * 0.32, 'GAME OVER', {
      fontSize: '36px', fontFamily: 'monospace',
      color: '#ff3355', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.46, `SCORE  ${this.finalScore}`, {
      fontSize: '22px', fontFamily: 'monospace', color: '#c8d8f0',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.53, `COINS  ${this.coinsEarned}`, {
      fontSize: '16px', fontFamily: 'monospace', color: '#ffeb3b',
    }).setOrigin(0.5);

    // Retry button
    const retryBtn = this.add.rectangle(width / 2, height * 0.66, 180, 50, 0x0a1628)
      .setStrokeStyle(1, 0x00e5ff)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.66, 'RETRY', {
      fontSize: '20px', fontFamily: 'monospace', color: '#00e5ff', fontStyle: 'bold',
    }).setOrigin(0.5);

    retryBtn.on('pointerover', () => retryBtn.setFillStyle(0x0d2040));
    retryBtn.on('pointerout',  () => retryBtn.setFillStyle(0x0a1628));
    retryBtn.on('pointerdown', () => {
      soundManager.play('uiClick');
      this.scene.start('GameScene');
    });

    // Menu button
    const menuBtn = this.add.rectangle(width / 2, height * 0.76, 180, 50, 0x0a1628)
      .setStrokeStyle(1, 0x1a2a3a)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.76, 'MENU', {
      fontSize: '20px', fontFamily: 'monospace', color: '#c8d8f0', fontStyle: 'bold',
    }).setOrigin(0.5);

    menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x0d2040));
    menuBtn.on('pointerout',  () => menuBtn.setFillStyle(0x0a1628));
    menuBtn.on('pointerdown', () => {
      soundManager.play('uiClick');
      soundManager.stopMusic();
      this.scene.start('MenuScene');
    });
  }
}