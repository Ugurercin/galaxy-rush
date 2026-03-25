const config = {
  type: Phaser.AUTO,
  width: 390,
  height: 844,
  backgroundColor: '#060a12',
  parent: document.body,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, GameScene, ShopScene, GameOverScene],
};

const game = new Phaser.Game(config);