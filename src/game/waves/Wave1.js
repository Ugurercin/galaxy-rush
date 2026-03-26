// Wave 1 — Tutorial feel
// Drifters only, slow spawn rate, easy to learn controls
//
// ── Tune these ───────────────────────────────────────────
// enemyCount    — total enemies this wave
// spawnInterval — ms between each spawn
// weights       — enemy type distribution

class Wave1 extends WaveBase {
  constructor(scene) {
    super(scene);
    this.enemyCount    = 8;
    this.spawnInterval = 1800;
    this.weights = {
      drifter: 1,   // drifters only
    };
  }

  get coinBonus() { return 20; }
  get musicTrack() { return 'music'; }
}