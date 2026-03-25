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

// Coins
export const COIN_DRIFTER = 5;
export const COIN_SHOOTER = 10;
export const COIN_CHASER = 12;
export const COIN_SPLITTER = 15;
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

// Colors (used in both RN and Phaser)
export const COLORS = {
  background: '#060a12',
  playerCyan: '#00e5ff',
  enemyRed: '#ff3355',
  enemyOrange: '#ff9900',
  bulletYellow: '#ffe066',
  coinYellow: '#ffeb3b',
  lootGreen: '#69ff47',
  uiText: '#c8d8f0',
  uiDim: 'rgba(200,216,240,0.45)',
  border: 'rgba(0,229,255,0.18)',
};