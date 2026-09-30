import { W, H, BULLET_RADIUS } from "./constants.js";

export function createBullet(x, y, vx, vy) {
  return { x, y, vx, vy, radius: BULLET_RADIUS, alive: true };
}

export function updateBullets(bullets, dt) {
  for (const b of bullets) {
    if (!b.alive) continue;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x < -10 || b.x > W + 10 || b.y < -10 || b.y > H + 10) {
      b.alive = false;
    }
  }
  return bullets.filter((b) => b.alive);
}
