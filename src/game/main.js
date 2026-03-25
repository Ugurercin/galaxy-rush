const config = {
  // Force Canvas on Android — WebGL can silently fail in emulator WebView
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
    antialias: false,      // better performance on mobile
    pixelArt: false,
    roundPixels: true,
  },
  scene: [BootScene, MenuScene, GameScene, ShopScene, GameOverScene],
};

// Small delay to let the WebView fully initialize before Phaser boots
window.addEventListener('load', () => {
  new Phaser.Game(config);
});