// Wave 3 — Chasers introduced
// Player must keep moving — chasers punish staying still
// Mix of all three enemy types
//
// ── Tune these ───────────────────────────────────────────

class Wave3 extends WaveBase {
  constructor(scene) {
    super(scene);
    this.enemyCount    = 16;
    this.spawnInterval = 1200;
    this.weights = {
      drifter: 5,
      shooter: 2,
      chaser:  3,
    };
  }

  get coinBonus() { return 40; }
  get musicTrack() { return 'music'; }
}