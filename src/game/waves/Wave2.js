// Wave 2 — Shooters introduced
// First time player encounters aimed bullets
// Mostly drifters but shooters appear occasionally
//
// ── Tune these ───────────────────────────────────────────

class Wave2 extends WaveBase {
  constructor(scene) {
    super(scene);
    this.enemyCount    = 12;
    this.spawnInterval = 1500;
    this.weights = {
      drifter: 6,
      shooter: 2,
    };
  }

  get coinBonus() { return 30; }
  get musicTrack() { return 'music'; }
}