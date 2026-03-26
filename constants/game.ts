// Game dimensions — matches Phaser canvas
export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

// Player
export const PLAYER_BASE_HP = 3;
export const PLAYER_BASE_FIRE_RATE = 2; // bullets per second
export const PLAYER_BASE_DAMAGE = 1;

// Enemies
export const ENEMY_DRIFTER_HP = 1;
export const ENEMY_SHOOTER_HP = 2;
export const ENEMY_CHASER_HP = 2;
export const ENEMY_SPLITTER_HP = 3;

// New enemies
export const ENEMY_ZIGZAG_HP = 1;
export const ENEMY_DASHER_HP = 2;
export const ENEMY_BOMBER_HP = 2;
export const ENEMY_TANK_HP = 6;

// Coins
export const COIN_DRIFTER = 5;
export const COIN_SHOOTER = 10;
export const COIN_CHASER = 12;
export const COIN_SPLITTER = 15;

// New enemy coin rewards
export const COIN_ZIGZAG = 6;
export const COIN_DASHER = 10;
export const COIN_BOMBER = 12;
export const COIN_TANK = 20;

export const COIN_BOSS = 80;
export const COIN_WAVE_CLEAR = 20;

// Difficulty scaling per run
export const DIFFICULTY_HP_SCALE = 0.10;     // +10% enemy HP per run
export const DIFFICULTY_SPEED_SCALE = 0.05;  // +5% enemy speed per run
export const DIFFICULTY_SPAWN_SCALE = 0.08;  // +8% spawn rate per run

// Formation
export const FORMATION_SPLIT_THRESHOLD = 0.5;   // split at 50% remaining
export const FORMATION_BREAK_THRESHOLD = 0.4;   // scatter at 40%

// Waves before boss
export const WAVES_PER_BOSS = 5;

// Enemy wave unlocks
export const WAVE_UNLOCK_DRIFTER = 1;
export const WAVE_UNLOCK_SHOOTER = 2;
export const WAVE_UNLOCK_ZIGZAG = 2;
export const WAVE_UNLOCK_CHASER = 3;
export const WAVE_UNLOCK_DASHER = 3;
export const WAVE_UNLOCK_BOMBER = 3;
export const WAVE_UNLOCK_SPLITTER = 4;
export const WAVE_UNLOCK_TANK = 4;

// Colors (used in both RN and Phaser)
export const COLORS = {
  background: '#060a12',
  playerCyan: '#00e5ff',

  enemyRed: '#ff3355',
  enemyOrange: '#ff9900',

  // New enemy colors
  enemyGreen: '#66ff88',
  enemyYellow: '#ffdd44',
  enemyBurn: '#ff6644',
  enemyBlue: '#8899ff',

  bulletYellow: '#ffe066',
  coinYellow: '#ffeb3b',
  lootGreen: '#69ff47',
  uiText: '#c8d8f0',
  uiDim: 'rgba(200,216,240,0.45)',
  border: 'rgba(0,229,255,0.18)',
};