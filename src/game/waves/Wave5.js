// Wave 5 — V-shape formation, final wave before boss
// Most intense regular wave — fast spawns, all enemy types
// Formation is V-shape of chasers with shooter at tip
//
// ── Tune these ───────────────────────────────────────────

class Wave5 extends WaveBase {
  constructor(scene) {
    super(scene);
    this.enemyCount    = 6;
    this.spawnInterval = 900;
    this.formation     = 'vshape';
    this.weights = {
      drifter:  2,
      shooter:  2,
      chaser:   3,
      splitter: 1,
    };
  }

  onStart() {
    this.spawnFormation(this.formation);
  }

  get coinBonus() { return 70; }
  get musicTrack() { return 'formationMusic'; }
}