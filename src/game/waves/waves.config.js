// waves.config.js

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

function makeWeights(wave) {
  return {
    drifter:  clamp(10 - Math.floor(wave / 5), 1, 10),
    zigzag:   wave >= 2  ? clamp(1 + Math.floor(wave / 6), 1, 5) : 0,
    shooter:  wave >= 3  ? clamp(Math.floor((wave - 1) / 5), 1, 4) : 0,
    chaser:   wave >= 5  ? clamp(Math.floor((wave - 3) / 5), 1, 5) : 0,
    bomber:   wave >= 7  ? clamp(Math.floor((wave - 5) / 6), 1, 4) : 0,
    dasher:   wave >= 10 ? clamp(Math.floor((wave - 8) / 7), 1, 4) : 0,
    splitter: wave >= 14 ? clamp(Math.floor((wave - 10) / 8), 1, 3) : 0,
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
      : 14 + Math.floor(wave * 0.9);

  return {
    id: wave,
    name: `Wave ${wave}`,
    enemyCount,
    spawnInterval,
    weights: makeWeights(wave),
    coinBonus,
    musicTrack: formation ? 'formationMusic' : 'music',
    formation,
    message: makeMessage(wave),
  };
}

for (let wave = 1; wave <= 50; wave++) {
  if (isBossWave(wave)) continue; // boss waves handled separately
  WAVE_CONFIGS.push(makeWaveConfig(wave));
}

// Hand-tuned early waves
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
    coinBonus: 20,
    musicTrack: 'music',
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
    coinBonus: 25,
    musicTrack: 'music',
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
    coinBonus: 30,
    musicTrack: 'music',
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
    coinBonus: 35,
    musicTrack: 'music',
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
    name: 'Formation Trial',
    enemyCount: 0,
    spawnInterval: 999999,
    weights: {
      drifter: 0,
      zigzag: 0,
      shooter: 0,
      chaser: 0,
      bomber: 0,
      dasher: 0,
      splitter: 0,
      tank: 0,
    },
    coinBonus: 50,
    musicTrack: 'formationMusic',
    formation: 'grid',
    message: {
      title: 'WAVE 5',
      subtitle: 'Formation attack incoming!',
      color: 0x66aaff,
      duration: 1450,
    },
  }
);

// remove duplicate ids caused by unshift + generated entries
const deduped = [];
const seen = new Set();
for (let i = 0; i < WAVE_CONFIGS.length; i++) {
  const w = WAVE_CONFIGS[i];
  if (seen.has(w.id)) continue;
  seen.add(w.id);
  deduped.push(w);
}
WAVE_CONFIGS.length = 0;
for (let i = 0; i < deduped.length; i++) {
  WAVE_CONFIGS.push(deduped[i]);
}