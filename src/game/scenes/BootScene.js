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
  // ── SFX ───────────────────────────────────────────────
  soundManager.register('shoot',        ShootSound);
  soundManager.register('shootLaser',   LaserShootSound);
  soundManager.register('shootRocket',  RocketShootSound);
  soundManager.register('hit',          HitSound);
  soundManager.register('explosion',    ExplosionSound);
  soundManager.register('playerHit',    PlayerHitSound);
  soundManager.register('uiClick',      UIClickSound);
  soundManager.register('coinCollect',  CoinCollectSound);
  

  // ── Music tracks ──────────────────────────────────────
  soundManager.register('music',          MusicTrack);
  soundManager.register('formationMusic', FormationMusic);
  soundManager.register('bossMusic',      BossMusic);
  soundManager.register('menuMusic', MenuMusic);

  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = 'none';

  this.scene.start('MenuScene');
}
}