/** Shared game constants */
export const W = 800;
export const H = 600;
export const PLAYER_RADIUS = 14;
export const ENEMY_RADIUS = 13;
export const BULLET_RADIUS = 3;
export const PLAYER_SPEED = 180;
export const BULLET_SPEED = 420;
export const SHOOT_COOLDOWN = 0.22;
export const PLAYER_MAX_HP = 100;
export const ENEMY_CONTACT_DAMAGE = 18;
export const ENEMY_CONTACT_COOLDOWN = 0.55;
export const HI_SCORE_KEY = "pixel-strike-hi";

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function dist(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.hypot(dx, dy);
}

export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}
