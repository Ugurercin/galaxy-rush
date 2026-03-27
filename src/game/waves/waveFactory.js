// waveFactory.js

function getMusicTrackForWave(wave, formation = null, isBoss = false) {
  if (formation) return 'formationMusic';
  if (isBoss) return 'bossMusic';

  // if (wave < 2) return 'music_dark';
  // if (wave < 4) return 'music_upbeat';
  // if (wave < 5) return 'music_bouncy';
  // if (wave < 7) return 'music_dark';

  return 'music_bouncy';
}

function createBossEnemy(scene, waveNumber) {
  switch (waveNumber) {
    case 10:
      return new BossEnemy(scene, waveNumber);
    case 20:
      return new CarrierBoss(scene, waveNumber);
    case 30:
      return new LaserBoss(scene, waveNumber);
    case 40:
      return new CrusherBoss(scene, waveNumber);
    case 50:
      return new HiveBoss(scene, waveNumber);
    case 60:
      return new BossEnemy(scene, waveNumber);
    case 70:
      return new CarrierBoss(scene, waveNumber);
    case 80:
      return new LaserBoss(scene, waveNumber);
    case 90:
      return new CrusherBoss(scene, waveNumber);
    case 100:
      return new HiveBoss(scene, waveNumber);

    default: {
      const bossIndex = (Math.floor(waveNumber / 10) - 1) % 5;

      switch (bossIndex) {
        case 0: return new BossEnemy(scene, waveNumber);
        case 1: return new CarrierBoss(scene, waveNumber);
        case 2: return new LaserBoss(scene, waveNumber);
        case 3: return new CrusherBoss(scene, waveNumber);
        case 4: return new HiveBoss(scene, waveNumber);
        default: return new BossEnemy(scene, waveNumber);
      }
    }
  }
}

function createWave(scene, waveNumber) {
  if (waveNumber % 10 === 0) {
    const bossWave = new BossWave(
      scene,
      waveNumber,
      () => createBossEnemy(scene, waveNumber)
    );

    bossWave.musicTrack = getMusicTrackForWave(waveNumber, null, true);
    return bossWave;
  }

  const config = WAVE_CONFIGS.find(w => w.id === waveNumber);

  if (config) {
    return new ConfigWave(scene, config);
  }

  return new ConfigWave(scene, {
    id: waveNumber,
    name: 'Wave ' + waveNumber,
    enemyCount: 18,
    spawnInterval: 320,
    weights: {
      drifter: 2,
      zigzag: 3,
      shooter: 3,
      chaser: 4,
      bomber: 3,
      dasher: 3,
      orbiter: 3,
      splitter: 2,
      sniper: 2,
      tank: 2,
    },
    coinBonus: 30 + Math.max(0, waveNumber - 5) * 5,
    musicTrack: getMusicTrackForWave(waveNumber, null, false),
    formation: null,
    message: {
      title: `WAVE ${waveNumber}`,
      subtitle: waveNumber < 25
        ? 'Hostiles incoming.'
        : waveNumber < 50
        ? 'Threat level rising.'
        : 'Survive the swarm.',
      color: 0x44ddee,
      duration: 1300,
    },
  });
}