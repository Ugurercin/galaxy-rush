class TripleShot extends FiringBase {
  constructor(scene) {
    super(scene);
    this.key = 'triple';
    this.label = 'Triple';
    this.icon = '≡';
    this.color = '#00b0ff';
    this.fireRateMod = 0.98;
    this.bulletSpeed = 10;
    this.spread = 18;
    this.sideVX = 1.9;
    this._lastFired = 0;
  }

  update(time, delta) {
    if (time < this._lastFired + this.effectiveFireRate()) return;
    this._lastFired = time;

    const { x, y, h } = this.scene.ship;
    const by = y - h / 2;

    if (this.scene.spreadShot) {
      this.spawnSpreadGroup(x - this.spread, by, this.bulletSpeed, this.sideVX);
      this.spawnSpreadGroup(x,               by, this.bulletSpeed, this.sideVX);
      this.spawnSpreadGroup(x + this.spread, by, this.bulletSpeed, this.sideVX);
    } else {
      this.spawnBullet(x - this.spread, by, this.bulletSpeed, 0);
      this.spawnBullet(x,               by, this.bulletSpeed, 0);
      this.spawnBullet(x + this.spread, by, this.bulletSpeed, 0);
    }

    soundManager.play('shoot');
  }

  draw(g) { g.clear(); }
  deactivate() {}
}