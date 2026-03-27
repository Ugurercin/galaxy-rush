const WAVE_CONFIGS = [];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function isBossWave(wave) {
  return wave % 10 === 0;
}

function isFormationWave(wave) {
  return wave % 10 === 5;
}

function getMusicTrackForWave(wave, formation = null, isBoss = false) {
  if (formation) return 'formationMusic';
  if (isBoss) return 'bossMusic';

  if (wave < 20) return 'music_dark';
  if (wave < 40) return 'music_upbeat';
  if (wave < 60) return 'music_bouncy';
  if (wave < 80) return 'music_dark';

  return 'music_upbeat';
}

function makeWeights(wave) {
  return {
    drifter:  clamp(10 - Math.floor(wave / 5), 1, 10),
    zigzag:   wave >= 2  ? clamp(1 + Math.floor(wave / 6), 1, 5) : 0,
    shooter:  wave >= 3  ? clamp(Math.floor((wave - 1) / 5), 1, 4) : 0,
    chaser:   wave >= 5  ? clamp(Math.floor((wave - 3) / 5), 1, 5) : 0,
    bomber:   wave >= 7  ? clamp(Math.floor((wave - 5) / 6), 1, 4) : 0,
    dasher:   wave >= 10 ? clamp(Math.floor((wave - 8) / 7), 1, 4) : 0,
    orbiter:  wave >= 12 ? clamp(Math.floor((wave - 10) / 7), 1, 4) : 0,
    splitter: wave >= 14 ? clamp(Math.floor((wave - 10) / 8), 1, 3) : 0,
    sniper:   wave >= 16 ? clamp(Math.floor((wave - 14) / 8), 1, 3) : 0,
    tank:     wave >= 18 ? clamp(Math.floor((wave - 14) / 10), 1, 2) : 0,
  };
}

function makeMessage(wave) {
  if (wave === 1) {
    return {
      title: 'WAVE 1',
      subtitle: 'Get ready!',
      color: 0x44ddee,
      duration: 1300,
    };
  }

  if (isFormationWave(wave)) {
    return {
      title: `WAVE ${wave}`,
      subtitle: 'Formation attack incoming!',
      color: 0x66aaff,
      duration: 1450,
    };
  }

  return {
    title: `WAVE ${wave}`,
    subtitle: wave < 10
      ? 'Stay sharp.'
      : wave < 25
      ? 'Threat level rising.'
      : 'Survive the swarm.',
    color: 0x44ddee,
    duration: 1300,
  };
}

function makeFormation(wave) {
  if (isFormationWave(wave)) {
    return wave >= 25 ? 'vshape' : 'grid';
  }
  return null;
}

function makeWaveConfig(wave) {
  const formation = makeFormation(wave);

  const enemyCount =
    wave <= 5
      ? 8 + wave * 2
      : 14 + Math.floor(wave * 1.15);

  const spawnInterval =
    wave <= 5
      ? 600 - wave * 20
      : clamp(520 - wave * 5, 250, 520);

  const coinBonus =
    wave <= 5
      ? 8 + wave * 2
      : 30 + (wave - 5) * 10;

  return {
    id: wave,
    name: `Wave ${wave}`,
    enemyCount,
    spawnInterval,
    weights: makeWeights(wave),
    coinBonus,
    musicTrack: getMusicTrackForWave(wave, formation, false),
    formation,
    message: makeMessage(wave),
  };
}

for (let wave = 1; wave <= 100; wave++) {
  if (isBossWave(wave)) continue;
  WAVE_CONFIGS.push(makeWaveConfig(wave));
}

WAVE_CONFIGS.unshift(
  {
    id: 1,
    name: 'Warmup',
    enemyCount: 10,
    spawnInterval: 580,
    weights: {
      drifter: 10,
      zigzag: 0,
      shooter: 0,
      chaser: 0,
      bomber: 0,
      dasher: 0,
      splitter: 0,
      tank: 0,
    },
    coinBonus: 4,
    musicTrack: getMusicTrackForWave(1, null, false),
    formation: null,
    message: {
      title: 'WAVE 1',
      subtitle: 'Get ready!',
      color: 0x44ddee,
      duration: 1300,
    },
  },
  {
    id: 2,
    name: 'Movement Check',
    enemyCount: 12,
    spawnInterval: 560,
    weights: {
      drifter: 8,
      zigzag: 2,
      shooter: 0,
      chaser: 0,
      bomber: 0,
      dasher: 0,
      splitter: 0,
      tank: 0,
    },
    coinBonus: 8,
    musicTrack: getMusicTrackForWave(2, null, false),
    formation: null,
    message: {
      title: 'WAVE 2',
      subtitle: 'Watch their movement.',
      color: 0x44ddee,
      duration: 1300,
    },
  },
  {
    id: 3,
    name: 'First Guns',
    enemyCount: 13,
    spawnInterval: 540,
    weights: {
      drifter: 7,
      zigzag: 2,
      shooter: 2,
      chaser: 0,
      bomber: 0,
      dasher: 0,
      splitter: 0,
      tank: 0,
    },
    coinBonus: 12,
    musicTrack: getMusicTrackForWave(3, null, false),
    formation: null,
    message: {
      title: 'WAVE 3',
      subtitle: 'Incoming fire.',
      color: 0x44ddee,
      duration: 1300,
    },
  },
  {
    id: 4,
    name: 'Mixed Entry',
    enemyCount: 14,
    spawnInterval: 525,
    weights: {
      drifter: 6,
      zigzag: 3,
      shooter: 2,
      chaser: 0,
      bomber: 1,
      dasher: 0,
      splitter: 0,
      tank: 0,
    },
    coinBonus: 16,
    musicTrack: getMusicTrackForWave(4, null, false),
    formation: null,
    message: {
      title: 'WAVE 4',
      subtitle: 'More angles. More pressure.',
      color: 0x44ddee,
      duration: 1300,
    },
  },
  {
    id: 5,
    name: 'Formation Intro',
    enemyCount: 16,
    spawnInterval: 500,
    weights: {
      drifter: 4,
      zigzag: 2,
      shooter: 2,
      chaser: 2,
      bomber: 0,
      dasher: 0,
      splitter: 0,
      tank: 0,
    },
    coinBonus: 30,
    musicTrack: getMusicTrackForWave(5, 'grid', false),
    formation: 'grid',
    message: {
      title: 'WAVE 5',
      subtitle: 'Formation attack incoming!',
      color: 0x66aaff,
      duration: 1450,
    },
  }
);