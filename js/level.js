/** Level / wave configuration */

export const LEVELS = [
  { waves: 2, perWave: 3, speed: 55, enemyHp: 1 },
  { waves: 2, perWave: 4, speed: 70, enemyHp: 1 },
  { waves: 3, perWave: 5, speed: 85, enemyHp: 1 },
  { waves: 3, perWave: 6, speed: 100, enemyHp: 2 },
  { waves: 4, perWave: 7, speed: 115, enemyHp: 2 },
];

export function createLevelState(levelIndex = 0) {
  const cfg = LEVELS[levelIndex];
  return {
    levelIndex,
    waveIndex: 0,
    wavesTotal: cfg.waves,
    perWave: cfg.perWave,
    speed: cfg.speed,
    enemyHp: cfg.enemyHp,
    enemiesRemainingToSpawn: cfg.perWave,
    spawnTimer: 0.4,
    waveActive: true,
    score: 0,
  };
}

export function advanceWave(state) {
  state.waveIndex += 1;
  if (state.waveIndex >= state.wavesTotal) {
    return "levelClear";
  }
  const cfg = LEVELS[state.levelIndex];
  state.perWave = cfg.perWave;
  state.enemiesRemainingToSpawn = cfg.perWave;
  state.spawnTimer = 0.8;
  state.waveActive = true;
  return "nextWave";
}

export function advanceLevel(state) {
  const next = state.levelIndex + 1;
  if (next >= LEVELS.length) return null;
  return createLevelState(next);
}
