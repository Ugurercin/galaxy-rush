// WaveBase — shared base class all waves extend
// Handles the spawn ticker, enemy pool weighting,
// and wave clear detection automatically
// Override config and onStart() in subclasses

class WaveBase {
  constructor(scene) {
    this.scene    = scene;
    this.done     = false;   // true when all enemies spawned + killed
    this._spawned = 0;
    this._timer   = 0;

    // ── Override these in subclasses ─────────────────────
    this.enemyCount    = 8;      // total enemies to spawn this wave
    this.spawnInterval = 1600;   // ms between spawns
    this.formation     = null;   // 'grid' | 'vshape' | null

    // Which enemy types appear and how often
    // Higher weight = appears more frequently
    this.weights = {
      drifter: 8,
    };
  }

  // Called once when the wave starts — override for setup
  onStart() {}

  // Called every frame by GameScene
  update(delta) {
    if (this.done) return;

    // Tick spawn timer
    this._timer += delta;
    if (this._timer >= this.spawnInterval && this._spawned < this.enemyCount) {
      this._timer = 0;
      this._spawnNext();
      this._spawned++;
    }

    // Check if wave is cleared
    // All enemies spawned + none alive on screen + no active formation
    if (
      this._spawned >= this.enemyCount &&
      this.scene.enemies.length === 0 &&
      !this.scene.formation.isActive()
    ) {
      this.done = true;
    }
  }

  // Pick and spawn a random enemy based on weights
  _spawnNext() {
    const weighted = [];
    Object.entries(this.weights).forEach(([type, w]) => {
      for (let i = 0; i < w; i++) weighted.push(type);
    });
    const type = weighted[Phaser.Math.Between(0, weighted.length - 1)];
    this._spawnType(type);
  }

  _spawnType(type) {
    const wave = this.scene.wave;
    switch (type) {
      case 'drifter':  this.scene.enemies.push(new Drifter(this.scene, wave));  break;
      case 'shooter':  this.scene.enemies.push(new Shooter(this.scene, wave));  break;
      case 'chaser':   this.scene.enemies.push(new Chaser(this.scene, wave));   break;
      case 'splitter': this.scene.enemies.push(new Splitter(this.scene, wave)); break;
    }
  }

  // Spawn a formation — called from subclass onStart()
  spawnFormation(type) {
    if (type === 'grid')   {
      this.scene.formation.spawnGrid(6, 3, 'drifter');
      this.scene.showMessage('FORMATION INCOMING', 'Destroy them all!', 0x4488ff, 1800, null);
      soundManager.switchMusic('formationMusic');
    }
    if (type === 'vshape') {
      this.scene.formation.spawnVShape('chaser');
      this.scene.showMessage('FINAL WAVE', 'V-Formation attack!', 0xff9900, 1800, null);
      soundManager.switchMusic('formationMusic');
    }
  }

  // Coins bonus awarded on wave clear
  get coinBonus() { return 20; }

  // Music track for this wave — override to change
  get musicTrack() { return 'music'; }
}