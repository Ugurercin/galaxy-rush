class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const { width, height } = this.scale;
    const barBg = this.add.rectangle(width / 2, height / 2, 200, 4, 0x1a2a3a);
    const bar   = this.add.rectangle(width / 2 - 100, height / 2, 0, 4, 0x00e5ff);
    bar.setOrigin(0, 0.5);
    this.load.on('progress', (v) => { bar.width = 200 * v; });
  }

  create() {
    // ── SFX ───────────────────────────────────────────────
    soundManager.register('shoot',        ShootSound);
    soundManager.register('hit',          HitSound);
    soundManager.register('explosion',    ExplosionSound);
    soundManager.register('playerHit',    PlayerHitSound);
    soundManager.register('uiClick',      UIClickSound);
    soundManager.register('coinCollect',  CoinCollectSound);

    // ── Music tracks ──────────────────────────────────────
    soundManager.register('music',       MusicTrack);       // normal waves
    soundManager.register('formationMusic', FormationMusic); // formation waves
    soundManager.register('bossMusic',   BossMusic);         // boss fight

    this.scene.start('MenuScene');
  }
}