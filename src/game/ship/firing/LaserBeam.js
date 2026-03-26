class LaserBeam extends FiringBase {
  constructor(scene) {
    super(scene);
    this.key           = 'laser';
    this.label         = 'Laser';
    this.icon          = '|';
    this.color         = '#ff3355';
    this.fireRateMod   = 1.0;
    this.tickRate      = 80;
    this.damagePerTick = 1;
    this.beamColor     = 0xff2244;
    this._lastTick     = 0;
    this._flicker      = 0;
    this._active       = false;
  }

  update(time, delta) {
    this._active  = true;
    this._flicker = (this._flicker + delta * 0.02) % (Math.PI * 2);

    if (time < this._lastTick + this.tickRate) return;
    this._lastTick = time;

    const { x, y, h } = this.scene.ship;
    const beamX = x;

    // Damage loose enemies
    this.scene.enemies.forEach(e => {
      if (!e.alive) return;
      if (Math.abs(e.x - beamX) < 6 + e.size * 0.5 && e.y < y - h / 2) {
        e.takeBulletHit(this.damagePerTick);
      }
    });

    // Damage formation ships
    if (this.scene.formation && this.scene.formation.isActive()) {
      this.scene.formation.ships.forEach(s => {
        if (!s.alive) return;
        if (Math.abs(s.x - beamX) < 6 + s.w / 2 && s.y < y - h / 2) {
          s.hp--;
          if (s.hp <= 0) {
            s.alive = false;
            this.scene.spawnExplosion(s.x, s.y, 0x4488ff);
            this.scene.score += 10;
            this.scene.spawnCoinDrops(s.x, s.y, 10);
            this.scene.scoreTxt.setText('SCORE  ' + this.scene.score);
          }
        }
      });
    }
        soundManager.play('shootRocket');
  }

  draw(g) {
    g.clear();
    if (!this._active) return;

    const { x, y, h } = this.scene.ship;
    const beamY   = y - h / 2;
    const flicker = 1 + Math.sin(this._flicker) * 0.15;

    g.fillStyle(this.beamColor, 0.12 * flicker);
    g.fillRect(x - 8, 0, 16, beamY);
    g.fillStyle(this.beamColor, 0.35 * flicker);
    g.fillRect(x - 4, 0, 8, beamY);
    g.fillStyle(0xff8899, 0.9);
    g.fillRect(x - 1.5, 0, 3, beamY);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(x, beamY, 4);

    this._active = false; // reset each frame
  }

  deactivate() {
    this._active = false;
  }
}