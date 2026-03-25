class BootScene extends Phaser.Scene  {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // We'll load assets here later (spritesheets, audio etc.)
    // For now just a small progress indicator
    const { width, height } = this.scale;

    const barBg = this.add.rectangle(width / 2, height / 2, 200, 4, 0x1a2a3a);
    const bar = this.add.rectangle(width / 2 - 100, height / 2, 0, 4, 0x00e5ff);
    bar.setOrigin(0, 0.5);

    this.load.on('progress', (value) => {
      bar.width = 200 * value;
    });
  }

  create() {
    this.scene.start('MenuScene');
  }
}