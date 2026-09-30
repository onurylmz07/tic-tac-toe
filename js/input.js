import { W, H } from "./constants.js";

const keys = new Set();
let mouseX = W / 2;
let mouseY = H / 2;
let mouseDown = false;
let shootQueued = false;

export function initInput(canvas) {
  window.addEventListener("keydown", (e) => {
    keys.add(e.code);
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
      e.preventDefault();
    }
  });

  window.addEventListener("keyup", (e) => {
    keys.delete(e.code);
  });

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouseX = (e.clientX - rect.left) * scaleX;
    mouseY = (e.clientY - rect.top) * scaleY;
  });

  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      mouseDown = true;
      shootQueued = true;
    }
  });

  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) mouseDown = false;
  });

  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
}

export function isDown(code) {
  return keys.has(code);
}

export function getMoveVector() {
  let x = 0;
  let y = 0;
  if (isDown("ArrowLeft") || isDown("KeyA")) x -= 1;
  if (isDown("ArrowRight") || isDown("KeyD")) x += 1;
  if (isDown("ArrowUp") || isDown("KeyW")) y -= 1;
  if (isDown("ArrowDown") || isDown("KeyS")) y += 1;
  if (x !== 0 || y !== 0) {
    const len = Math.hypot(x, y);
    x /= len;
    y /= len;
  }
  return { x, y };
}

export function getMouse() {
  return { x: mouseX, y: mouseY };
}

export function consumeShoot() {
  if (shootQueued || mouseDown) {
    shootQueued = false;
    return true;
  }
  return false;
}

export function clearShootQueue() {
  shootQueued = false;
}
