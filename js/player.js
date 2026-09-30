import {
  W,
  H,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  PLAYER_MAX_HP,
  SHOOT_COOLDOWN,
  BULLET_SPEED,
  angleTo,
  clamp,
} from "./constants.js";
import { getMoveVector, getMouse, consumeShoot } from "./input.js";
import { createBullet } from "./bullet.js";

export function createPlayer() {
  return {
    x: W / 2,
    y: H / 2,
    angle: 0,
    hp: PLAYER_MAX_HP,
    maxHp: PLAYER_MAX_HP,
    cooldown: 0,
    anim: 0,
    moving: false,
    muzzle: 0,
    invuln: 0,
    radius: PLAYER_RADIUS,
  };
}

export function resetPlayer(player) {
  player.x = W / 2;
  player.y = H / 2;
  player.angle = 0;
  player.hp = PLAYER_MAX_HP;
  player.cooldown = 0;
  player.anim = 0;
  player.moving = false;
  player.muzzle = 0;
  player.invuln = 0;
}

export function updatePlayer(player, dt, bullets, particles) {
  const move = getMoveVector();
  player.moving = move.x !== 0 || move.y !== 0;

  if (player.moving) {
    player.x += move.x * PLAYER_SPEED * dt;
    player.y += move.y * PLAYER_SPEED * dt;
    player.anim += dt * 10;
    if (Math.random() < dt * 8) particles.dust(player.x, player.y);
  }

  player.x = clamp(player.x, player.radius, W - player.radius);
  player.y = clamp(player.y, player.radius + 36, H - player.radius);

  const mouse = getMouse();
  player.angle = angleTo(player.x, player.y, mouse.x, mouse.y);

  if (player.cooldown > 0) player.cooldown -= dt;
  if (player.muzzle > 0) player.muzzle -= dt;
  if (player.invuln > 0) player.invuln -= dt;

  if (consumeShoot() && player.cooldown <= 0) {
    const muzzleDist = 22;
    const bx = player.x + Math.cos(player.angle) * muzzleDist;
    const by = player.y + Math.sin(player.angle) * muzzleDist;
    bullets.push(
      createBullet(bx, by, Math.cos(player.angle) * BULLET_SPEED, Math.sin(player.angle) * BULLET_SPEED)
    );
    player.cooldown = SHOOT_COOLDOWN;
    player.muzzle = 0.08;
    particles.burst(bx, by, "#ffe066", 4, 60);
  }
}

export function hurtPlayer(player, amount, particles) {
  if (player.invuln > 0) return false;
  player.hp = Math.max(0, player.hp - amount);
  player.invuln = 0.55;
  particles.burst(player.x, player.y, "#4ecdc4", 8, 100);
  return true;
}
