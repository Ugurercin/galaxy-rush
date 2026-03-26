// waveFactory.js

function createWave(scene, waveNumber) {
  if (waveNumber % 10 === 0) {
    return new BossWave(scene, waveNumber);
  }

  const config = WAVE_CONFIGS.find(w => w.id === waveNumber);

  if (config) {
    return new ConfigWave(scene, config);
  }

  // fallback
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
      splitter: 2,
      tank: 2,
    },
    coinBonus: 30,
    musicTrack: 'music',
    formation: null,
    message: {
      title: `WAVE ${waveNumber}`,
      subtitle: 'Hostiles incoming.',
      color: 0x44ddee,
      duration: 1300,
    },
  });
}