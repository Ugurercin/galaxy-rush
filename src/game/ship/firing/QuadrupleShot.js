class QuadrupleShot extends FiringBase {
  constructor(scene) {
    super(scene);
    this.key = 'quad';
    this.label = 'Quad';
    this.icon = '⁞';
    this.color = '#ffd54f';
    this.fireRateMod = 0.9;
    this.bulletSpeed = 10;
    this.spreadInner = 12;
    this.spreadOuter = 24;
    this.sideVX = 1.8;
    this._lastFired = 0;
  }

  update(time, delta) {
    if (time < this._lastFired + this.effectiveFireRate()) return;
    this._lastFired = time;

    const { x, y, h } = this.scene.ship;
    const by = y - h / 2;

    if (this.scene.spreadShot) {
      this.spawnSpreadGroup(x - this.spreadOuter, by, this.bulletSpeed, this.sideVX);
      this.spawnSpreadGroup(x - this.spreadInner, by, this.bulletSpeed, this.sideVX);
      this.spawnSpreadGroup(x + this.spreadInner, by, this.bulletSpeed, this.sideVX);
      this.spawnSpreadGroup(x + this.spreadOuter, by, this.bulletSpeed, this.sideVX);
    } else {
      this.spawnBullet(x - this.spreadOuter, by, this.bulletSpeed, 0);
      this.spawnBullet(x - this.spreadInner, by, this.bulletSpeed, 0);
      this.spawnBullet(x + this.spreadInner, by, this.bulletSpeed, 0);
      this.spawnBullet(x + this.spreadOuter, by, this.bulletSpeed, 0);
    }

    soundManager.play('shoot');
  }

  draw(g) { g.clear(); }
  deactivate() {}
}