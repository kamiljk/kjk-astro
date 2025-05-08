const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Ensure consistent font usage for all text rendering
ctx.font = '16px "Press Start 2P", monospace'; // FIXED SIZE FONT
ctx.fillStyle = '#FFF';
ctx.textAlign = 'left';

// Fixed canvas size
let CANVAS_WIDTH = 480;
let CANVAS_HEIGHT = 640;

// Adjust canvas size dynamically to fill the viewport
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  CANVAS_WIDTH = canvas.width;
  CANVAS_HEIGHT = canvas.height;
}

// Add event listener to resize canvas on window resize
window.addEventListener('resize', resizeCanvas);

// Call resizeCanvas initially to set the canvas size
resizeCanvas();

// --- Loading State ---
let assetsLoading = true;
let assetsLoaded = 0;
let totalAssets = 6; // Font, ghost sprite, background texture, 3 fun sprites
let loadingStartTime = Date.now();

// --- Load Custom Font ---
const font = new FontFace('PressStart2P', 'url(../../fonts/PressStart2P-Regular.ttf)');

// --- Game Constants ---
// REMOVED ALL SCALING VARIABLES
const SPRITE_FRAME_SIZE = 400;

// FIXED SIZE CONSTANTS - NO SCALING
const GHOST_WIDTH = 40; // Fixed width regardless of screen size
const GHOST_HEIGHT = 40; // Fixed height regardless of screen size
const GRAVITY = 0.25; // Fixed gravity
const FLAP_STRENGTH = -6; // Fixed flap strength
const FUN_SPRITE_CHANCE = 0.1;
const COLOR_ACCENT = '#FF0000';
const FRAME_ROWS = 2;
const FRAME_COLS = 2;

// --- Game State ---
let ghost;
let gameActive;
let animationFrameId;
let ghostSprite = new Image();
let funSprites = [];
let frameIndex = 0;
let lastFrameTime = 0;
const FRAME_DURATION = 150; // ms between animation frames
let score = 0; // Initialize score

// --- Particle System ---
const particles = [];

// --- Background Texture ---
let brickTexture = new Image();
// Track loading state
brickTexture.onload = () => {
  assetsLoaded++;
  updateBackgroundPattern();
  checkAllAssetsLoaded();
};
brickTexture.onerror = () => {
  console.error('Failed to load brick texture, using fallback');
  assetsLoaded++; // Count as loaded even if failed
  checkAllAssetsLoaded();
};
brickTexture.src = './assets/bricks-texture.png';
let backgroundPattern = null; // Variable to hold the pattern
let patternCanvas = null; // Canvas for creating the scaled pattern
const PATTERN_SCALE = 0.25; // Scale factor for the background texture - REDUCED

// Function to create/update the background pattern
function updateBackgroundPattern() {
  if (!brickTexture.complete || brickTexture.naturalWidth === 0) return;

  if (!patternCanvas) {
    patternCanvas = document.createElement('canvas');
  }
  const patternCtx = patternCanvas.getContext('2d');

  const scaledWidth = brickTexture.naturalWidth * PATTERN_SCALE;
  const scaledHeight = brickTexture.naturalHeight * PATTERN_SCALE;

  patternCanvas.width = scaledWidth;
  patternCanvas.height = scaledHeight;

  patternCtx.drawImage(brickTexture, 0, 0, scaledWidth, scaledHeight);
  backgroundPattern = ctx.createPattern(patternCanvas, 'repeat');
}

// --- Adjusted Particle System for Grainy Effect ---
function getRandomParticleColor() {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = SPRITE_FRAME_SIZE;
  tempCanvas.height = SPRITE_FRAME_SIZE;
  const col = frameIndex % FRAME_COLS;
  const row = Math.floor(frameIndex / FRAME_COLS);
  const sx = col * SPRITE_FRAME_SIZE;
  const sy = row * SPRITE_FRAME_SIZE;
  tempCtx.drawImage(
    ghost.sprite,
    sx, sy, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
    0, 0, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE
  );
  const margin = SPRITE_FRAME_SIZE * 0.2;
  const px = Math.floor(margin + Math.random() * (SPRITE_FRAME_SIZE - margin * 2));
  const py = Math.floor(margin + Math.random() * (SPRITE_FRAME_SIZE - margin * 2));
  const data = tempCtx.getImageData(px, py, 1, 1).data;
  return `rgba(${data[0]}, ${data[1]}, ${data[2]}, 0.8)`;
}

// --- Sandy Particle Palette ---
const SAND_COLORS = ['#C2B280', '#C2A878', '#D2B48C', '#DEB887', '#EDC9AF'];
function getSandColor() {
  return SAND_COLORS[Math.floor(Math.random() * SAND_COLORS.length)];
}

// --- Adjusted Particle System for Sandy Pixels ---
function createParticle(x, y) {
  const baseSize = Math.ceil(Math.random() * 2);
  particles.push({
    x: Math.round(x),
    y: Math.round(y),
    size: baseSize, // Fixed size
    alpha: 1,
    velocityX: (Math.random() - 0.5) * 2,
    velocityY: (Math.random() * 1 + 0.5),
    color: getRandomParticleColor()
  });
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.x += particle.velocityX;
    particle.y += particle.velocityY;
    particle.velocityY += 0.1;
    particle.alpha -= 0.02;

    if (particle.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  ctx.imageSmoothingEnabled = false;
  for (const p of particles) {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  ctx.globalAlpha = 1.0;
}

// --- Load Sprites ---
function loadSprites() {
  const funSpritePaths = [
    './assets/fun/burrito-ghost.png',
    './assets/fun/pizza-ghost.png',
    './assets/fun/slime-ghost.png'
  ];

  for (const path of funSpritePaths) {
    const img = new Image();
    img.onload = () => {
      assetsLoaded++;
      checkAllAssetsLoaded();
    };
    img.onerror = () => {
      console.error(`Failed to load fun sprite: ${path}`);
      assetsLoaded++;
      checkAllAssetsLoaded();
    };
    img.src = path;
    funSprites.push(img);
  }
}

// Function to check if all assets are loaded
function checkAllAssetsLoaded() {
  if (assetsLoaded >= totalAssets) {
    console.log('All assets loaded successfully!');
    assetsLoading = false;
    if (document.fonts.check('16px "Press Start 2P"') || Date.now() - loadingStartTime > 3000) {
      initializeGame();
    }
  }
}

// --- Draw Loading Screen ---
function drawLoadingScreen() {
  const progress = Math.min(assetsLoaded / totalAssets, 1);

  ctx.fillStyle = '#444444';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LOADING BAD GHOST...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

  ctx.fillStyle = '#222222';
  const barWidth = CANVAS_WIDTH * 0.7;
  const barHeight = 20;
  const barX = (CANVAS_WIDTH - barWidth) / 2;
  const barY = CANVAS_HEIGHT / 2;
  ctx.fillRect(barX, barY, barWidth, barHeight);

  ctx.fillStyle = '#88CCFF';
  ctx.fillRect(barX, barY, barWidth * progress, barHeight);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`${Math.floor(progress * 100)}%`, CANVAS_WIDTH / 2, barY + 40);

  if (Date.now() - loadingStartTime > 5000) {
    ctx.fillText('Taking a while... click/tap to start anyway', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
  }

  if (assetsLoading) {
    requestAnimationFrame(drawLoadingScreen);
  }
}

// --- Initialize Game ---
function initializeGame() {
  resetGame();

  canvas.addEventListener('click', flap);
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    flap(e);
  }, { passive: false });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      flap({ clientX: CANVAS_WIDTH / 2 });
    }
  });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (gameActive) invertGravity();
  });

  gameLoop();
}

// --- Reset Game ---
function resetGame() {
  ghost = {
    x: CANVAS_WIDTH / 2 - GHOST_WIDTH / 2,
    y: CANVAS_HEIGHT / 2 - GHOST_HEIGHT / 2,
    velocity: 0,
    sprite: Math.random() < FUN_SPRITE_CHANCE ? getRandomFunSprite() : ghostSprite
  };
  gameActive = true;
  score = 0;
  console.log('Game reset!');
}

// --- Get Random Fun Sprite ---
function getRandomFunSprite() {
  return funSprites[Math.floor(Math.random() * funSprites.length)];
}

// --- Flap ---
function flap(event) {
  if (gameActive) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;    
    const clickX = (event.clientX - rect.left) * scaleX;

    const ghostCenterX = ghost.x + GHOST_WIDTH / 2;
    const repulsionStrength = 10; // Fixed repulsion strength

    if (clickX < ghostCenterX) {
      ghost.x += repulsionStrength;
    } else if (clickX > ghostCenterX) {
      ghost.x -= repulsionStrength;
    }

    ghost.velocity = FLAP_STRENGTH;
    score++;
  }
}

// --- Gravity Inversion Power-up ---
let _originalGravity = null;
let _gravityInverted = false;
function invertGravity() {
  if (_gravityInverted) return;
  _gravityInverted = true;
  _originalGravity = GRAVITY;
  GRAVITY = -_originalGravity;
  for (let i = 0; i < 20; i++) {
    createParticle(
      ghost.x + GHOST_WIDTH / 2,
      ghost.y + GHOST_HEIGHT / 2
    );
  }
  setTimeout(() => {
    GRAVITY = _originalGravity;
    _gravityInverted = false;
  }, 3000);
}

// --- Update Game ---
function updateGame() {
  if (!gameActive) return;

  ghost.velocity += GRAVITY;
  ghost.y += ghost.velocity;

  if (ghost.velocity > 0) {
    score += ghost.velocity * 0.1;
  }

  for (let i = 0; i < 4; i++) {
    createParticle(
      ghost.x + GHOST_WIDTH / 2 + (Math.random() - 0.5) * GHOST_WIDTH,
      ghost.y + GHOST_HEIGHT * 0.8
    );
  }

  if (ghost.y > CANVAS_HEIGHT + GHOST_HEIGHT) {
    gameActive = false;
    console.log('Game over! Waiting for player input to restart.');
  }

  // Fixed side movement amplitude
  const sideAmplitude = 15;
  const sideFrequency = 0.002;
  const time = Date.now();
  ghost.x = CANVAS_WIDTH / 2 - GHOST_WIDTH / 2 + Math.sin(time * sideFrequency) * sideAmplitude;

  const now = Date.now();
  if (now - lastFrameTime >= FRAME_DURATION) {
    frameIndex = (frameIndex + 1) % (FRAME_ROWS * FRAME_COLS);
    lastFrameTime = now;
  }
}

// --- Draw Game ---
function drawGame() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (backgroundPattern) {
    ctx.fillStyle = backgroundPattern;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  } else {
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawParticles();

  const col = frameIndex % FRAME_COLS;
  const row = Math.floor(frameIndex / FRAME_COLS);
  const spriteX = col * SPRITE_FRAME_SIZE;
  const spriteY = row * SPRITE_FRAME_SIZE;

  const glowOffset = 1;
  const glowAlpha = 0.5;
  ctx.globalAlpha = glowAlpha;

  // Draw ghost glow effect - fixed sizes
  ctx.drawImage(
    ghost.sprite, spriteX, spriteY, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
    ghost.x - glowOffset, ghost.y, GHOST_WIDTH, GHOST_HEIGHT
  );
  ctx.drawImage(
    ghost.sprite, spriteX, spriteY, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
    ghost.x + glowOffset, ghost.y, GHOST_WIDTH, GHOST_HEIGHT
  );
  ctx.drawImage(
    ghost.sprite, spriteX, spriteY, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
    ghost.x, ghost.y - glowOffset, GHOST_WIDTH, GHOST_HEIGHT
  );
  ctx.drawImage(
    ghost.sprite, spriteX, spriteY, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
    ghost.x, ghost.y + glowOffset, GHOST_WIDTH, GHOST_HEIGHT
  );
  ctx.drawImage(
    ghost.sprite, spriteX, spriteY, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
    ghost.x - glowOffset, ghost.y - glowOffset, GHOST_WIDTH, GHOST_HEIGHT
  );
  ctx.drawImage(
    ghost.sprite, spriteX, spriteY, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
    ghost.x + glowOffset, ghost.y - glowOffset, GHOST_WIDTH, GHOST_HEIGHT
  );
  ctx.drawImage(
    ghost.sprite, spriteX, spriteY, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
    ghost.x - glowOffset, ghost.y + glowOffset, GHOST_WIDTH, GHOST_HEIGHT
  );
  ctx.drawImage(
    ghost.sprite, spriteX, spriteY, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
    ghost.x + glowOffset, ghost.y + glowOffset, GHOST_WIDTH, GHOST_HEIGHT
  );

  ctx.globalAlpha = 1.0;

  // Draw main ghost - fixed size
  ctx.drawImage(
    ghost.sprite, 
    spriteX, spriteY,
    SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
    ghost.x, ghost.y,
    GHOST_WIDTH, GHOST_HEIGHT
  );
}

// --- Draw Score ---
function drawScore() {
  ctx.font = '16px "Press Start 2P", monospace';
  ctx.fillStyle = '#FFF';
  ctx.textAlign = 'center';
  const scoreX = CANVAS_WIDTH / 2;
  const scoreY = 50;
  ctx.fillText(`Score: ${Math.floor(score)}`, scoreX, scoreY); 
}

// --- Adjusted Game Over Screen Layout ---
function drawGameOverScreen() {
  ctx.fillStyle = 'rgba(255, 0, 0, 0.75)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Fixed-size game over box
  const boxWidth = 300;
  const boxHeight = 150;
  const boxX = (CANVAS_WIDTH - boxWidth) / 2;
  const boxY = (CANVAS_HEIGHT - boxHeight) / 2;
  const padding = 4;

  ctx.fillStyle = '#FFF';
  ctx.font = '24px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`Score: ${Math.floor(score)}`, CANVAS_WIDTH / 2, boxY - 20);

  ctx.fillStyle = '#000';
  ctx.fillRect(boxX - padding, boxY - padding, boxWidth + padding * 2, boxHeight + padding * 2);

  ctx.fillStyle = '#FFF';
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  ctx.fillStyle = '#000';
  ctx.font = '16px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BAD GHOST', CANVAS_WIDTH / 2, boxY + 50);
  ctx.fillText("DON'T DIE", CANVAS_WIDTH / 2, boxY + 80);
  ctx.fillText('AGAIN', CANVAS_WIDTH / 2, boxY + 110);
}

// --- Game Loop ---
function gameLoop() {
  if (gameActive) {
    updateGame();
    updateParticles();
    drawGame();
    drawScore();
    animationFrameId = requestAnimationFrame(gameLoop);
  } else {
    drawGameOverScreen();
    cancelAnimationFrame(animationFrameId);
  }
}

canvas.addEventListener('click', () => {
  if (assetsLoading && Date.now() - loadingStartTime > 3000) {
    assetsLoading = false;
    initializeGame();
  } else if (!gameActive) {
    resetGame();
    gameLoop();
  }
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (assetsLoading && Date.now() - loadingStartTime > 3000) {
    assetsLoading = false;
    initializeGame();
  } else if (!gameActive) {
    resetGame();
    gameLoop();
  }
}, { passive: false });

// --- Start Game ---
Promise.all([
  font.load().catch((err) => {
    console.error('Failed to load font:', err);
    assetsLoaded++;
    return Promise.resolve();
  }),
  new Promise((resolve) => {
    ghostSprite.onload = () => {
      console.log('Ghost sprite loaded successfully');
      assetsLoaded++;
      resolve();
    };

    ghostSprite.onerror = (err) => {
      console.error('Failed to load ghost sprite:', err);
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = SPRITE_FRAME_SIZE * 2;
      tempCanvas.height = SPRITE_FRAME_SIZE * 2;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const x = i * SPRITE_FRAME_SIZE;
          const y = j * SPRITE_FRAME_SIZE;
          tempCtx.fillRect(x + SPRITE_FRAME_SIZE/4, y + SPRITE_FRAME_SIZE/4, 
                         SPRITE_FRAME_SIZE/2, SPRITE_FRAME_SIZE/2);
        }
      }
      ghostSprite.src = tempCanvas.toDataURL();
      assetsLoaded++;
      resolve();
    };

    ghostSprite.src = './assets/ghost-sprite4.png';
  })
]).then(() => {
  document.fonts.add(font);
  try {
    ctx.font = '16px "Press Start 2P"';
  } catch (e) {
    console.error('Error setting font:', e);
    ctx.font = '16px monospace';
  }
  
  loadSprites();
  drawLoadingScreen();
});