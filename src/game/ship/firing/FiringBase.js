class FiringBase {
  constructor(scene) {
    this.scene = scene;
    this.key = 'base';
    this.label = 'Base';
    this.icon = '?';
    this.color = '#fff';
    this.fireRateMod = 1;
    this._lastFired = 0;
  }

  effectiveFireRate() {
    return this.scene.baseFireRate / this.fireRateMod;
  }

  spawnBullet(x, y, speed, vx = 0) {
    this.scene.bullets.push({ x, y, speed, vx });
  }

  spawnSpreadGroup(x, y, speed, sideVX = 2.2) {
    this.spawnBullet(x, y, speed, -sideVX);
    this.spawnBullet(x, y, speed, 0);
    this.spawnBullet(x, y, speed, sideVX);
  }

  draw(g) { g.clear(); }
  deactivate() {}
}