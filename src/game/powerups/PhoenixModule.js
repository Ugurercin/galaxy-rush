class PhoenixModule {
  static type     = 'phoenix';
  static label    = 'PHOENIX MODULE';
  static color    = 0xff9e2c;
  static duration = -1; // stays armed until consumed

  static apply(scene) {
    scene.hasPhoenixModule = true;
  }

  static remove(scene) {
    scene.hasPhoenixModule = false;
  }

  static drawOrb(g, orb) {
    const c = this.color;
    const pulse = 1 + Math.sin(orb.pulse) * 0.12;

    // outer glow
    g.fillStyle(c, 0.18);
    g.fillCircle(orb.x, orb.y, 13 * pulse);

    // core
    g.fillStyle(0x2a1200, 1);
    g.fillCircle(orb.x, orb.y, 9);

    // phoenix diamond/flame
    g.fillStyle(c, 1);
    g.fillTriangle(
      orb.x,     orb.y - 7,
      orb.x - 6, orb.y + 5,
      orb.x + 6, orb.y + 5
    );

    g.fillStyle(0xffd54f, 1);
    g.fillCircle(orb.x, orb.y + 1, 3);
  }
}