const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function loadImg(src) {
  const img = new Image();
  img.src = src;
  return img;
}

const basePath = '../assets/png/personajes/estrellita/';

const sprites = {
  front: {
    idle: loadImg(basePath + 'estrellita_front_idle.png'),
    walk: [
      loadImg(basePath + 'estrellita_front_walk_1.png'),
      loadImg(basePath + 'estrellita_front_walk_2.png'),
      loadImg(basePath + 'estrellita_front_walk_3.png'),
      loadImg(basePath + 'estrellita_front_walk_4.png'),
    ],
  },
  back: {
    idle: loadImg(basePath + 'estrellita_back_idle.png'),
    walk: [
      loadImg(basePath + 'estrellita_back_walk_1.png'),
      loadImg(basePath + 'estrellita_back_walk_2.png'),
      loadImg(basePath + 'estrellita_back_walk_3.png'),
      loadImg(basePath + 'estrellita_back_walk_4.png'),
    ],
  },
  right: {
    idle: loadImg(basePath + 'estrellita_derecha_idle.png'),
    walk: [
      loadImg(basePath + 'estrellita_derecha_walk_1.png'),
      loadImg(basePath + 'estrellita_derecha_walk_2.png'),
      loadImg(basePath + 'estrellita_derecha_walk_3.png'),
      loadImg(basePath + 'estrellita_derecha_walk_4.png'),
    ],
  },
  left: {
    idle: loadImg(basePath + 'estrellita_izquierda_idle.png'),
    walk: [
      loadImg(basePath + 'estrellita_izquierda_walk_1.png'),
      loadImg(basePath + 'estrellita_izquierda_walk_2.png'),
      loadImg(basePath + 'estrellita_izquierda_walk_3.png'),
      loadImg(basePath + 'estrellita_izquierda_walk_4.png'),
    ],
  },
};

let pos = { x: canvas.width / 2, y: canvas.height / 2 };
let direction = 'front';
let walking = false;
let path = null;

let lastTime = 0;
let walkFrame = 0;
let walkFrameTimer = 0;
const walkFrameDuration = 0.12;
const speed = 180;

function setTarget(x, y) {
  const start = { x: pos.x, y: pos.y };
  const end = { x, y };
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy) || 1; // straight line distance, || 1 to avoid division by 0 if dx==0 and dy==0

  if (Math.abs(dx) > Math.abs(dy)) {
    direction = dx > 0 ? 'right' : 'left';
  } else {
    direction = dy > 0 ? 'front' : 'back';
  }

  // Store certain points to be used to calculate movement (using Bezier for example)
  
  // midpoint between the start and end, used as the center of the curve
  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;
  
  // perpendicular unit vector to the movement direction that allows "bending"
  const nx = -dy / dist;
  const ny = dx / dist;

  // limit how strong the curve can be, offset is random between -maxCurve and +maxCurve
  const maxCurve = Math.min(120, dist * 0.35);
  const offset = (Math.random() * 2 - 1) * maxCurve;

  // "the curve’s bend. The control point “pulls” the curve toward itself, creating a gentle arc."
  const ctrl = { x: mx + nx * offset, y: my + ny * offset }; 

  const duration = dist / speed;

  path = { start, ctrl, end, startTime: performance.now() / 1000, duration };
  walking = true;
}

canvas.addEventListener('click', (e) => setTarget(e.clientX, e.clientY));
canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  setTarget(t.clientX, t.clientY);
});

function bezier(p0, p1, p2, t) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  return {
    x: uu * p0.x + 2 * u * t * p1.x + tt * p2.x,
    y: uu * p0.y + 2 * u * t * p1.y + tt * p2.y,
  };
}

function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  update(dt, timestamp / 1000);
  draw();
  requestAnimationFrame(loop);
}

function update(dt, now) {
  if (walking && path) {
    const t = (now - path.startTime) / path.duration;

    // If the walk is finished then stop, otherwise compute the next point using Bezier
    if (t >= 1) {
      pos = { ...path.end };
      walking = false;
      path = null;
    } else {
      const oldPos = { ...pos };
      pos = bezier(path.start, path.ctrl, path.end, t);

      // Dynamically update the direction to face with the movement
      const vx = pos.x - oldPos.x;
      const vy = pos.y - oldPos.y;
      if (Math.abs(vx) > Math.abs(vy)) {
        direction = vx > 0 ? 'right' : 'left';
      } else {
        direction = vy > 0 ? 'front' : 'back';
      }
    }
  }

  if (walking) {
    walkFrameTimer += dt;
    if (walkFrameTimer >= walkFrameDuration) {
      walkFrameTimer -= walkFrameDuration;
      walkFrame = (walkFrame + 1) % sprites[direction].walk.length;
    }
  } else {
    walkFrame = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const set = sprites[direction];
  const img = walking ? set.walk[walkFrame] : set.idle;
  if (!img.width || !img.height) return;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, pos.x - img.width / 2, pos.y - img.height / 2);
  ctx.restore();
}

requestAnimationFrame(loop);

// ANIMAR TEXTO
const statusEl = document.querySelectorAll('.texto');

const statusFonts = [
  "'Loop4ever1'",
  "'Loop4ever2'",
  "'Loop4ever3'",
];

let statusFontIndex = 0;
const statusInterval = 220; // ms between font switches

if (statusEl.length > 0) {
  console.log(statusEl);
  statusEl.forEach(e => {
    setInterval(() => {
      statusFontIndex = (statusFontIndex + 1) % statusFonts.length;
      e.style.fontFamily = statusFonts[statusFontIndex];
    }, statusInterval);
  })
}

// LOGICA LINK INSTAGRAM
const instagramLink = document.querySelector('.instagram');

if (instagramLink) {
  instagramLink.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Get center link position
    const rect = instagramLink.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;
    
    setTarget(targetX, targetY);
    
    // Wait the time it takes to finish the path to open the link
    if (path && path.duration) {
      setTimeout(() => {
        window.location.href = instagramLink.href;
      }, path.duration * 1000);
    }
  });
}
