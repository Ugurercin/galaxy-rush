
const config = {
  type: Phaser.CANVAS,
  width: 390,
  height: 844,
  backgroundColor: '#060a12',
  parent: document.body,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 390,
    height: 844,
  },
  render: {
    antialias: false,
    pixelArt: false,
    roundPixels: true,
  },
  scene: [BootScene, MenuScene, GameScene, ShopScene, GameOverScene],
};

window.addEventListener('load', () => {
  new Phaser.Game(config);
});