import { W, H, ENEMY_RADIUS, dist } from "./constants.js";

export function spawnEnemy(speed, hp = 1) {
  const side = Math.floor(Math.random() * 4);
  let x;
  let y;
  const margin = 28;
  if (side === 0) {
    x = Math.random() * W;
    y = -margin;
  } else if (side === 1) {
    x = W + margin;
    y = Math.random() * H;
  } else if (side === 2) {
    x = Math.random() * W;
    y = H + margin;
  } else {
    x = -margin;
    y = Math.random() * H;
  }

  return {
    x,
    y,
    speed,
    hp,
    maxHp: hp,
    radius: ENEMY_RADIUS,
    anim: Math.random() * 3,
    hitFlash: 0,
    dying: 0,
    alive: true,
  };
}

export function updateEnemies(enemies, player, dt) {
  for (const e of enemies) {
    if (!e.alive) continue;

    if (e.dying > 0) {
      e.dying -= dt;
      if (e.dying <= 0) e.alive = false;
      continue;
    }

    const d = dist(e.x, e.y, player.x, player.y);
    if (d > 1) {
      e.x += ((player.x - e.x) / d) * e.speed * dt;
      e.y += ((player.y - e.y) / d) * e.speed * dt;
    }
    e.anim += dt * 6;
    if (e.hitFlash > 0) e.hitFlash -= dt;
  }
  return enemies.filter((e) => e.alive);
}

export function hurtEnemy(enemy, particles) {
  enemy.hp -= 1;
  enemy.hitFlash = 0.12;
  if (enemy.hp <= 0) {
    enemy.dying = 0.25;
    particles.burst(enemy.x, enemy.y, "#ff6b4a", 14, 120);
    particles.floatText(enemy.x, enemy.y - 10, "+100");
    return true;
  }
  particles.burst(enemy.x, enemy.y, "#ffaa88", 5, 70);
  return false;
}
