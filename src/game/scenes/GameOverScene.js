
    class GameOverScene extends Phaser.Scene {

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.coinsEarned = data.coins || 0;
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x060a12).setOrigin(0);

    this.add.text(width / 2, height * 0.38, 'GAME OVER', {
      fontSize: '36px',
      fontFamily: 'monospace',
      color: '#ff3355',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.50, `Score: ${this.finalScore}`, {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#c8d8f0',
    }).setOrigin(0.5);

    // Retry button
    const btn = this.add.rectangle(width / 2, height * 0.65, 180, 52, 0x0a1628)
      .setStrokeStyle(1, 0x00e5ff)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.65, 'RETRY', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#00e5ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}