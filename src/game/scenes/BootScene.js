class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    
    const { width, height } = this.scale;
    const barBg = this.add.rectangle(width / 2, height / 2, 200, 4, 0x1a2a3a);
    const bar   = this.add.rectangle(width / 2 - 100, height / 2, 0, 4, 0x00e5ff);
    this.add.text(width / 2, height / 2 - 22, 'LOADING...', {
  fontSize: '12px',
  fontFamily: 'monospace',
  color: '#00e5ff',
}).setOrigin(0.5);
    bar.setOrigin(0, 0.5);
    this.load.on('progress', (v) => { bar.width = 200 * v; });
  }

create() {
  window.soundManager.register('shoot', ShootSound);
  window.soundManager.register('shootLaser', LaserShootSound);
  window.soundManager.register('shootRocket', RocketShootSound);
  window.soundManager.register('hit', HitSound);
  window.soundManager.register('explosion', ExplosionSound);
  window.soundManager.register('playerHit', PlayerHitSound);
  window.soundManager.register('uiClick', UIClickSound);
  window.soundManager.register('coinCollect', CoinCollectSound);

  window.soundManager.register('music_dark', MusicTrackDark);
  window.soundManager.register('music_upbeat', MusicTrackUpbeat);
  window.soundManager.register('music_bouncy', MusicTrackBouncy);
  window.soundManager.register('music', MusicTrackDark);
  window.soundManager.register('formationMusic', FormationMusic);
  window.soundManager.register('bossMusic', BossMusic);
  window.soundManager.register('menuMusic', MenuMusic);

  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = 'none';

  this.scene.start('MenuScene');
}
}