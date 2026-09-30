/** Procedural pixel sprite helpers + particle FX */

export function createPixelCanvas(w, h, drawFn) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  drawFn(ctx, w, h);
  return c;
}

function px(ctx, x, y, color, s = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, s, s);
}

/** Player body frames (facing right); gun drawn separately */
export function buildPlayerFrames() {
  const frames = [];
  for (let f = 0; f < 4; f++) {
    frames.push(
      createPixelCanvas(16, 16, (ctx) => {
        // body
        for (let y = 4; y < 13; y++) {
          for (let x = 4; x < 12; x++) {
            px(ctx, x, y, "#2a9d8f");
          }
        }
        // shading
        for (let y = 4; y < 13; y++) px(ctx, 4, y, "#1d7068");
        for (let x = 4; x < 12; x++) px(ctx, x, 12, "#1d7068");
        // head / visor
        for (let y = 2; y < 6; y++) {
          for (let x = 5; x < 11; x++) px(ctx, x, y, "#4ecdc4");
        }
        px(ctx, 6, 3, "#e8fffa");
        px(ctx, 7, 3, "#e8fffa");
        px(ctx, 8, 3, "#102018");
        px(ctx, 9, 3, "#102018");
        // legs animated
        const leg = f % 4;
        if (leg === 0) {
          px(ctx, 5, 13, "#1a3d38");
          px(ctx, 5, 14, "#1a3d38");
          px(ctx, 9, 13, "#1a3d38");
          px(ctx, 9, 14, "#1a3d38");
        } else if (leg === 1) {
          px(ctx, 4, 13, "#1a3d38");
          px(ctx, 5, 14, "#1a3d38");
          px(ctx, 10, 13, "#1a3d38");
          px(ctx, 9, 14, "#1a3d38");
        } else if (leg === 2) {
          px(ctx, 5, 13, "#1a3d38");
          px(ctx, 5, 14, "#1a3d38");
          px(ctx, 9, 13, "#1a3d38");
          px(ctx, 9, 14, "#1a3d38");
        } else {
          px(ctx, 6, 13, "#1a3d38");
          px(ctx, 5, 14, "#1a3d38");
          px(ctx, 8, 13, "#1a3d38");
          px(ctx, 10, 14, "#1a3d38");
        }
      })
    );
  }
  return frames;
}

export function buildGunSprite() {
  return createPixelCanvas(14, 6, (ctx) => {
    // grip
    for (let y = 2; y < 6; y++) {
      px(ctx, 0, y, "#5c4030");
      px(ctx, 1, y, "#5c4030");
    }
    // barrel
    for (let x = 2; x < 13; x++) {
      px(ctx, x, 1, "#c9c9c9");
      px(ctx, x, 2, "#9a9a9a");
      px(ctx, x, 3, "#c9c9c9");
    }
    px(ctx, 12, 0, "#888");
    px(ctx, 12, 4, "#888");
    // muzzle
    px(ctx, 13, 1, "#666");
    px(ctx, 13, 2, "#666");
    px(ctx, 13, 3, "#666");
  });
}

export function buildMuzzleFlash() {
  return createPixelCanvas(10, 10, (ctx) => {
    const mid = 5;
    px(ctx, mid, mid, "#fff8c0");
    px(ctx, mid - 1, mid, "#ffe066");
    px(ctx, mid + 1, mid, "#ffe066");
    px(ctx, mid, mid - 1, "#ffe066");
    px(ctx, mid, mid + 1, "#ffe066");
    px(ctx, mid - 2, mid, "#ff9f1c");
    px(ctx, mid + 2, mid, "#ff9f1c");
    px(ctx, mid, mid - 2, "#ff9f1c");
    px(ctx, mid, mid + 2, "#ff9f1c");
    px(ctx, mid - 1, mid - 1, "#fff");
  });
}

export function buildEnemyFrames() {
  const frames = [];
  for (let f = 0; f < 3; f++) {
    frames.push(
      createPixelCanvas(16, 16, (ctx) => {
        // body blob
        for (let y = 3; y < 13; y++) {
          for (let x = 3; x < 13; x++) {
            const dx = x - 7.5;
            const dy = y - 7.5;
            if (dx * dx + dy * dy < 28) px(ctx, x, y, "#c44536");
          }
        }
        for (let y = 4; y < 12; y++) {
          for (let x = 4; x < 12; x++) {
            const dx = x - 7.5;
            const dy = y - 7.5;
            if (dx * dx + dy * dy < 18) px(ctx, x, y, "#ff6b4a");
          }
        }
        // eyes
        px(ctx, 5, 6, "#1a0a08");
        px(ctx, 6, 6, "#ffe066");
        px(ctx, 9, 6, "#1a0a08");
        px(ctx, 10, 6, "#ffe066");
        // teeth
        px(ctx, 6, 10, "#fff");
        px(ctx, 8, 10, "#fff");
        px(ctx, 7, 11, "#1a0a08");
        // wobble legs
        const o = f - 1;
        px(ctx, 5 + o, 13, "#8b2e22");
        px(ctx, 5 + o, 14, "#8b2e22");
        px(ctx, 10 - o, 13, "#8b2e22");
        px(ctx, 10 - o, 14, "#8b2e22");
      })
    );
  }
  return frames;
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  burst(x, y, color, count = 10, speed = 80) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.4 + Math.random() * 0.8);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.3 + Math.random() * 0.35,
        maxLife: 0.45,
        color,
        size: 2 + Math.random() * 2,
      });
    }
  }

  dust(x, y) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + 10,
      vx: (Math.random() - 0.5) * 20,
      vy: -10 - Math.random() * 20,
      life: 0.25,
      maxLife: 0.25,
      color: "#5a6e62",
      size: 2,
    });
  }

  floatText(x, y, text, color = "#f0c75e") {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -40,
      life: 0.7,
      maxLife: 0.7,
      color,
      size: 0,
      text,
    });
  }

  update(dt) {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  draw(ctx) {
    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = a;
      if (p.text) {
        ctx.fillStyle = p.color;
        ctx.font = "8px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.globalAlpha = 1;
    }
  }

  clear() {
    this.particles = [];
  }
}
