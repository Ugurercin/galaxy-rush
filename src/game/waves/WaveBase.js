// WaveBase — shared base class all waves extend
// Handles the spawn ticker, enemy pool weighting,
// and wave clear detection automatically
// Override config and onStart() in subclasses

class WaveBase {
  constructor(scene) {
    this.scene    = scene;
    this.done     = false;
    this._spawned = 0;
    this._timer   = 0;

    // ── Override these in subclasses ─────────────────────
    this.enemyCount    = 8;
    this.spawnInterval = 1600;
    this.formation     = null;

    this.weights = {
      drifter: 8,
      shooter: 0,
      chaser: 0,
      splitter: 0,
      zigzag: 0,
      dasher: 0,
      bomber: 0,
      tank: 0,
      orbiter: 0,
      sniper: 0,
    };
  }

  // Called once when the wave starts — override for setup
  onStart() {}

  // Called every frame by GameScene
  update(delta) {
    if (this.done) return;

    this._timer += delta;
    if (this._timer >= this.spawnInterval && this._spawned < this.enemyCount) {
      this._timer = 0;
      this._spawnNext();
      this._spawned++;
    }

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
    const entries = Object.entries(this.weights).filter(([, weight]) => weight > 0);
    if (entries.length === 0) return;

    const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = Phaser.Math.FloatBetween(0, totalWeight);

    for (const [type, weight] of entries) {
      roll -= weight;
      if (roll <= 0) {
        this._spawnType(type);
        return;
      }
    }

    this._spawnType(entries[0][0]);
  }

  _spawnType(type) {
    const wave = this.scene.wave;

    switch (type) {
      case 'drifter':
        this.scene.enemies.push(new Drifter(this.scene, wave));
        break;
      case 'shooter':
        this.scene.enemies.push(new Shooter(this.scene, wave));
        break;
      case 'chaser':
        this.scene.enemies.push(new Chaser(this.scene, wave));
        break;
      case 'splitter':
        this.scene.enemies.push(new Splitter(this.scene, wave));
        break;
      case 'zigzag':
        this.scene.enemies.push(new ZigZag(this.scene, wave));
        break;
      case 'bomber':
        this.scene.enemies.push(new Bomber(this.scene, wave));
        break;
      case 'dasher':
        this.scene.enemies.push(new Dasher(this.scene, wave));
        break;
      case 'tank':
        this.scene.enemies.push(new Tank(this.scene, wave));
        break;
      case 'orbiter':
        this.scene.enemies.push(new Orbiter(this.scene, wave));
        break;
      case 'sniper':
        this.scene.enemies.push(new SniperEnemy(this.scene, wave));
        break;
      default:
        console.warn('Unknown enemy type:', type);
        this.scene.enemies.push(new Drifter(this.scene, wave));
        break;
    }
  }

  // Spawn a formation — called from subclass onStart()
  spawnFormation(type) {
    if (type === 'grid') {
      this.scene.formation.spawnGrid(6, 3, 'drifter');
      this.scene.showMessage('FORMATION INCOMING', 'Destroy them all!', 0x4488ff, 1800, null);
      soundManager.switchMusic('formationMusic');
    }

    if (type === 'vshape') {
      this.scene.formation.spawnVShape('chaser');
      this.scene.showMessage('FINAL WAVE', 'V-Formation attack!', 0xff9900, 1800, null);
      soundManager.switchMusic('formationMusic');
    }

    if (type === 'zigzagLine') {
      this.scene.formation.spawnGrid(5, 2, 'zigzag');
      this.scene.showMessage('SWARM INCOMING', 'Unstable movement pattern!', 0x66ff88, 1800, null);
      soundManager.switchMusic('formationMusic');
    }

    if (type === 'bomberLine') {
      this.scene.formation.spawnGrid(4, 2, 'bomber');
      this.scene.showMessage('BOMBER SQUAD', 'Incoming fire!', 0xff6644, 1800, null);
      soundManager.switchMusic('formationMusic');
    }
  }

  // Coins bonus awarded on wave clear
  get coinBonus() { return 20; }

  // Music track for this wave — override to change
  get musicTrack() { return 'music'; }
}