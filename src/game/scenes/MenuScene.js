class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x060a12).setOrigin(0);

    this.add.text(width / 2, height * 0.35, 'GALAXY', {
      fontSize: '52px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.35 + 58, 'RUSH', {
      fontSize: '52px', fontFamily: 'monospace', color: '#00e5ff', fontStyle: 'bold',
    }).setOrigin(0.5);

    const btnBg = this.add.rectangle(width / 2, height * 0.62, 180, 52, 0x0a1628)
      .setStrokeStyle(1, 0x00e5ff)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.62, 'PLAY', {
      fontSize: '20px', fontFamily: 'monospace', color: '#00e5ff', fontStyle: 'bold',
    }).setOrigin(0.5);

    btnBg.on('pointerover',  () => btnBg.setFillStyle(0x0d2040));
    btnBg.on('pointerout',   () => btnBg.setFillStyle(0x0a1628));
    btnBg.on('pointerdown',  () => this.scene.start('GameScene'));
  }
}