// Wave 4 — Grid formation + all enemy types
// Formation enters at start, loose enemies spawn alongside
// Splitters introduced — creates chain reactions
//
// ── Tune these ───────────────────────────────────────────

class Wave4 extends WaveBase {
  constructor(scene) {
    super(scene);
    this.enemyCount    = 8;
    this.spawnInterval = 1100;
    this.formation     = 'grid';
    this.weights = {
      drifter:  3,
      shooter:  2,
      chaser:   2,
      splitter: 1,
    };
  }

  onStart() {
    this.spawnFormation(this.formation);
  }

  get coinBonus() { return 55; }
  get musicTrack() { return 'formationMusic'; }
}