import { ENEMY_CONTACT_DAMAGE, ENEMY_CONTACT_COOLDOWN, HI_SCORE_KEY, dist } from "./constants.js";
import { initInput, getMouse, clearShootQueue, isDown } from "./input.js";
import { createPlayer, resetPlayer, updatePlayer, hurtPlayer } from "./player.js";
import { updateBullets } from "./bullet.js";
import { spawnEnemy, updateEnemies, hurtEnemy } from "./enemy.js";
import { LEVELS, createLevelState, advanceWave, advanceLevel } from "./level.js";
import { ParticleSystem } from "./sprites.js";
import { drawArena, drawPlayer, drawEnemy, drawBullet, drawAimReticle } from "./render.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const hud = document.getElementById("hud");
const overlay = document.getElementById("overlay");
const panels = {
  menu: document.getElementById("panel-menu"),
  pause: document.getElementById("panel-pause"),
  levelclear: document.getElementById("panel-levelclear"),
  gameover: document.getElementById("panel-gameover"),
  victory: document.getElementById("panel-victory"),
};

const el = {
  level: document.getElementById("hud-level"),
  wave: document.getElementById("hud-wave"),
  enemies: document.getElementById("hud-enemies"),
  hpFill: document.getElementById("hud-hp-fill"),
  score: document.getElementById("hud-score"),
  menuHi: document.getElementById("menu-hi"),
  levelclearMsg: document.getElementById("levelclear-msg"),
  gameoverMsg: document.getElementById("gameover-msg"),
  victoryMsg: document.getElementById("victory-msg"),
  victoryHi: document.getElementById("victory-hi"),
};

/** @type {'menu'|'playing'|'paused'|'levelclear'|'gameover'|'victory'} */
let screen = "menu";
let player = createPlayer();
let bullets = [];
let enemies = [];
let levelState = null;
let particles = new ParticleSystem();
let contactTimer = 0;
let totalScore = 0;
let lastTime = 0;
let escWasDown = false;

initInput(canvas);
refreshHiScoreDisplay();
showScreen("menu");

document.getElementById("btn-start").addEventListener("click", startGame);
document.getElementById("btn-resume").addEventListener("click", () => showScreen("playing"));
document.getElementById("btn-quit").addEventListener("click", () => showScreen("menu"));
document.getElementById("btn-next").addEventListener("click", goNextLevel);
document.getElementById("btn-retry").addEventListener("click", startGame);
document.getElementById("btn-menu-go").addEventListener("click", () => showScreen("menu"));
document.getElementById("btn-menu-win").addEventListener("click", () => showScreen("menu"));

function getHiScore() {
  return Number(localStorage.getItem(HI_SCORE_KEY) || 0);
}

function saveHiScore(score) {
  if (score > getHiScore()) {
    localStorage.setItem(HI_SCORE_KEY, String(score));
  }
  refreshHiScoreDisplay();
}

function refreshHiScoreDisplay() {
  const hi = getHiScore();
  el.menuHi.textContent = `HI-SCORE ${hi}`;
  el.victoryHi.textContent = `HI-SCORE ${hi}`;
}

function showScreen(name) {
  screen = name;
  const panelKey = name === "paused" ? "pause" : name;
  const showHud = name === "playing" || name === "paused";

  hud.classList.toggle("hidden", !showHud);
  overlay.classList.toggle("hidden", name === "playing");

  for (const key of Object.keys(panels)) {
    panels[key].classList.toggle("hidden", key !== panelKey);
  }

  if (name === "menu") {
    clearShootQueue();
    refreshHiScoreDisplay();
  }
}

function startGame() {
  player = createPlayer();
  bullets = [];
  enemies = [];
  particles.clear();
  levelState = createLevelState(0);
  totalScore = 0;
  contactTimer = 0;
  clearShootQueue();
  updateHud();
  showScreen("playing");
}

function goNextLevel() {
  const next = advanceLevel(levelState);
  if (!next) {
    endVictory();
    return;
  }
  levelState = next;
  levelState.score = totalScore;
  resetPlayer(player);
  bullets = [];
  enemies = [];
  particles.clear();
  contactTimer = 0;
  clearShootQueue();
  updateHud();
  showScreen("playing");
}

function endGameOver() {
  saveHiScore(totalScore);
  el.gameoverMsg.textContent = `Score ${totalScore}`;
  showScreen("gameover");
}

function endVictory() {
  saveHiScore(totalScore);
  el.victoryMsg.textContent = `Score ${totalScore} — all 5 levels cleared!`;
  refreshHiScoreDisplay();
  showScreen("victory");
}

function endLevelClear() {
  el.levelclearMsg.textContent =
    levelState.levelIndex + 1 >= LEVELS.length
      ? "Final level done!"
      : `Level ${levelState.levelIndex + 1} complete. HP restored.`;
  showScreen("levelclear");
}

function updateHud() {
  if (!levelState) return;
  el.level.textContent = `LVL ${levelState.levelIndex + 1}/${LEVELS.length}`;
  el.wave.textContent = `WAVE ${levelState.waveIndex + 1}/${levelState.wavesTotal}`;
  const alive = enemies.filter((e) => e.alive && e.dying <= 0).length;
  const pending = levelState.enemiesRemainingToSpawn;
  el.enemies.textContent = `ENEMIES ${alive + pending}`;
  el.score.textContent = `SCORE ${totalScore}`;
  const pct = Math.max(0, (player.hp / player.maxHp) * 100);
  el.hpFill.style.width = `${pct}%`;
}

function spawnLogic(dt) {
  if (!levelState.waveActive) return;
  if (levelState.enemiesRemainingToSpawn <= 0) return;

  levelState.spawnTimer -= dt;
  if (levelState.spawnTimer <= 0) {
    enemies.push(spawnEnemy(levelState.speed, levelState.enemyHp));
    levelState.enemiesRemainingToSpawn -= 1;
    levelState.spawnTimer = 0.55 + Math.random() * 0.35;
  }
}

function handleCollisions() {
  // bullets vs enemies
  for (const b of bullets) {
    if (!b.alive) continue;
    for (const e of enemies) {
      if (!e.alive || e.dying > 0) continue;
      if (dist(b.x, b.y, e.x, e.y) < b.radius + e.radius) {
        b.alive = false;
        const killed = hurtEnemy(e, particles);
        if (killed) {
          totalScore += 100;
          levelState.score = totalScore;
        }
        break;
      }
    }
  }

  // enemies vs player
  if (contactTimer > 0) return;
  for (const e of enemies) {
    if (!e.alive || e.dying > 0) continue;
    if (dist(player.x, player.y, e.x, e.y) < player.radius + e.radius - 2) {
      hurtPlayer(player, ENEMY_CONTACT_DAMAGE, particles);
      contactTimer = ENEMY_CONTACT_COOLDOWN;
      break;
    }
  }
}

function checkWaveClear() {
  if (levelState.enemiesRemainingToSpawn > 0) return;
  const living = enemies.some((e) => e.alive);
  if (living) return;

  const result = advanceWave(levelState);
  if (result === "levelClear") {
    // bonus for clearing level
    totalScore += 250 * (levelState.levelIndex + 1);
    if (levelState.levelIndex + 1 >= LEVELS.length) {
      endVictory();
    } else {
      endLevelClear();
    }
  }
}

function update(dt) {
  if (screen !== "playing") return;

  spawnLogic(dt);
  updatePlayer(player, dt, bullets, particles);
  bullets = updateBullets(bullets, dt);
  enemies = updateEnemies(enemies, player, dt);
  particles.update(dt);

  if (contactTimer > 0) contactTimer -= dt;
  handleCollisions();

  if (player.hp <= 0) {
    endGameOver();
    return;
  }

  checkWaveClear();
  updateHud();
}

function render() {
  drawArena(ctx);

  if (screen === "menu") {
    // idle preview shimmer
    ctx.fillStyle = "rgba(78, 205, 196, 0.08)";
    ctx.fillRect(0, 0, W, H);
    return;
  }

  for (const e of enemies) drawEnemy(ctx, e);
  for (const b of bullets) drawBullet(ctx, b);
  drawPlayer(ctx, player);
  particles.draw(ctx);

  if (screen === "playing" || screen === "paused") {
    drawAimReticle(ctx, getMouse());
  }
}

function handleGlobalKeys() {
  const esc = isDown("Escape");
  if (esc && !escWasDown) {
    if (screen === "playing") showScreen("paused");
    else if (screen === "paused") showScreen("playing");
  }
  escWasDown = esc;
}

function frame(time) {
  const dt = Math.min(0.05, (time - lastTime) / 1000 || 0);
  lastTime = time;
  handleGlobalKeys();
  update(dt);
  render();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
