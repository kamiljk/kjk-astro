const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Ensure consistent font usage for all text rendering
ctx.font = '1em "Press Start 2P", monospace';
ctx.fillStyle = '#FFF'; // Default text color
ctx.textAlign = 'left'; // Default text alignment

// --- Load Custom Font ---
// Use the correct relative path to the font file in /public/fonts/
const font = new FontFace('PressStart2P', 'url(../../fonts/PressStart2P-Regular.ttf)');

// --- Game Constants ---
const BASE_HEIGHT = 800; // Define a base height for scaling calculations
const BASE_WIDTH = 600; // Define a base width for scaling calculations
let scaleFactor = 1;
let widthScaleFactor = 1;

const SPRITE_FRAME_SIZE = 400;
const BASE_GHOST_SCALE = 0.1;
let GHOST_WIDTH = SPRITE_FRAME_SIZE * BASE_GHOST_SCALE;
let GHOST_HEIGHT = SPRITE_FRAME_SIZE * BASE_GHOST_SCALE;
const BASE_GRAVITY = 0.2;
let GRAVITY = BASE_GRAVITY;
const BASE_FLAP_STRENGTH = -5;
let FLAP_STRENGTH = BASE_FLAP_STRENGTH;
const FUN_SPRITE_CHANCE = 0.1; // 10% chance for fun sprite
const COLOR_ACCENT = '#FF0000'; // Red accent color for "AGAIN"
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
// Use the correct filename provided by the user
brickTexture.src = './assets/bricks-texture.png';
let backgroundPattern = null; // Variable to hold the pattern
let patternCanvas = null; // Canvas for creating the scaled pattern
const PATTERN_SCALE = 0.5; // Scale factor for the background texture

// Function to create/update the background pattern
function updateBackgroundPattern() {
  if (!brickTexture.complete || brickTexture.naturalWidth === 0) return; // Ensure texture is loaded

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

// Update pattern when texture loads
brickTexture.onload = updateBackgroundPattern;

// --- Adjusted Particle System for Grainy Effect ---
function getRandomParticleColor() {
  // Sample a random pixel from the current ghost sprite frame
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
  // Sample from center region (avoid transparent edges)
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
  // Pixelated sand particle
  const baseSize = Math.ceil(Math.random() * 2); // 1 or 2 pixels
  particles.push({
    x: Math.round(x),
    y: Math.round(y),
    size: baseSize * Math.ceil(scaleFactor), // Scale to nearest pixel count
    alpha: 1, // no fade transparency for crisp look
    velocityX: (Math.random() - 0.5) * 2 * scaleFactor, // wider spread
    velocityY: (Math.random() * 1 + 0.5) * scaleFactor, // downward motion
    color: getRandomParticleColor()
  });
}

// Adjust particle gravity to make them fall quicker
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.x += particle.velocityX;
    particle.y += particle.velocityY;
    particle.velocityY += 0.1 * scaleFactor; // Scale gravity effect
    particle.alpha -= 0.02; // Fade out

    // Remove particle if it becomes invisible
    if (particle.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  // Draw each sand particle as a block
  ctx.imageSmoothingEnabled = false;
  for (const p of particles) {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
}

// --- Load Sprites ---
function loadSprites() {
  // Load fun sprites from the "fun" folder
  const funSpritePaths = [
    './assets/fun/burrito-ghost.png',
    './assets/fun/pizza-ghost.png',
    './assets/fun/slime-ghost.png'
    // REMOVED: './assets/fun/toast-ghost.png'
  ];

  for (const path of funSpritePaths) {
    const img = new Image();
    img.src = path;
    funSprites.push(img);
  }
}

// --- Calculate Scaling Factors ---
function calculateScaling() {
  scaleFactor = canvas.height / BASE_HEIGHT;
  widthScaleFactor = canvas.width / BASE_WIDTH;

  // Update scaled constants
  GHOST_WIDTH = (SPRITE_FRAME_SIZE * BASE_GHOST_SCALE) * scaleFactor;
  GHOST_HEIGHT = (SPRITE_FRAME_SIZE * BASE_GHOST_SCALE) * scaleFactor;
  GRAVITY = BASE_GRAVITY * scaleFactor;
  FLAP_STRENGTH = BASE_FLAP_STRENGTH * scaleFactor;

  // Update font size based on scaling
  ctx.font = `${1 * scaleFactor}em "Press Start 2P", monospace`;
}

// --- Initialize Game ---
function initializeGame() {
  // Simple full-screen canvas resizing
  function resizeCanvas() {
    // Match buffer to viewport size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Match CSS display size to viewport
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    calculateScaling();
    updateBackgroundPattern();
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  resetGame();

  // Add input listeners
  canvas.addEventListener('click', flap);
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    flap(e);
  }, { passive: false });
  // Map space bar as backup flap control
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      flap({ clientX: canvas.width / 2 });
    }
  });

  // Right-click triggers temporary gravity inversion
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (gameActive) invertGravity();
  });

  // Start the game loop
  gameLoop();
}

// --- Reset Game ---
function resetGame() {
  ghost = {
    x: canvas.width / 2 - GHOST_WIDTH / 2,
    y: canvas.height / 2 - GHOST_HEIGHT / 2,
    velocity: 0,
    sprite: Math.random() < FUN_SPRITE_CHANCE ? getRandomFunSprite() : ghostSprite
  };
  gameActive = true; // Reactivate the game
  score = 0; // Reset score
  console.log('Game reset!'); // Debug log to confirm reset
}

// --- Get Random Fun Sprite ---
function getRandomFunSprite() {
  return funSprites[Math.floor(Math.random() * funSprites.length)];
}

// --- Flap ---
function flap(event) {
  if (gameActive) {
    const clickX = event.clientX;
    const ghostCenterX = ghost.x + GHOST_WIDTH / 2;
    const repulsionStrength = 20 * widthScaleFactor; // Scale repulsion

    // Determine direction of repulsion
    if (clickX < ghostCenterX) {
      ghost.x += repulsionStrength;
    } else if (clickX > ghostCenterX) {
      ghost.x -= repulsionStrength;
    }

    ghost.velocity = FLAP_STRENGTH; // Use scaled flap strength
    score++; // Increment score on flap
  }
}

// --- Gravity Inversion Power-up ---
let _originalGravity = null;
let _gravityInverted = false;
function invertGravity() {
  if (_gravityInverted) return; // Already active
  _gravityInverted = true;
  _originalGravity = GRAVITY;
  // Invert gravity for a short duration
  GRAVITY = -_originalGravity;
  // Optional visual effect: burst of particles
  for (let i = 0; i < 20; i++) {
    createParticle(
      ghost.x + GHOST_WIDTH / 2,
      ghost.y + GHOST_HEIGHT / 2
    );
  }
  // Restore after 3 seconds (temporary inversion)
  setTimeout(() => {
    GRAVITY = _originalGravity;
    _gravityInverted = false;
  }, 3000);
}

// --- Update Game ---
function updateGame() {
  if (!gameActive) return;

  // Apply scaled gravity
  ghost.velocity += GRAVITY;
  ghost.y += ghost.velocity;

  // Increment score while falling
  if (ghost.velocity > 0) {
    score += ghost.velocity * 0.1; // Increase score faster when falling faster
  }

  // Create multiple particles with horizontal spread and higher spawn
  for (let i = 0; i < 4; i++) {
    createParticle(
      ghost.x + GHOST_WIDTH / 2 + (Math.random() - 0.5) * GHOST_WIDTH,
      ghost.y + GHOST_HEIGHT * 0.8 // Spawn lower, behind middle of the ghost
    );
  }

  // Check if ghost falls off the screen
  if (ghost.y > canvas.height + GHOST_HEIGHT) {
    gameActive = false;
    console.log('Game over! Waiting for player input to restart.');
  }

  // Update horizontal drift based on static wiggle
  const sideAmplitude = 25 * widthScaleFactor; // Scale wiggle amplitude based on width
  const sideFrequency = 0.002; // wiggle speed
  const time = Date.now();
  ghost.x = canvas.width / 2 - GHOST_WIDTH / 2 + Math.sin(time * sideFrequency) * sideAmplitude;

  // Update frame index for animation
  const now = Date.now();
  if (now - lastFrameTime >= FRAME_DURATION) {
    frameIndex = (frameIndex + 1) % (FRAME_ROWS * FRAME_COLS);
    lastFrameTime = now;
  }
}

// --- Draw Game ---
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing

  // Draw the scaled and repeating background pattern
  if (backgroundPattern) {
    ctx.fillStyle = backgroundPattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw a semi-transparent black overlay to darken the background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw particles behind the sprite
    drawParticles();
  } else {
    // Fallback if pattern hasn't loaded yet
    ctx.fillStyle = '#111111'; // Even darker fallback background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw ghost with animation and edge glow
  const col = frameIndex % FRAME_COLS;
  const row = Math.floor(frameIndex / FRAME_COLS);
  const spriteX = col * SPRITE_FRAME_SIZE;
  const spriteY = row * SPRITE_FRAME_SIZE;

  // --- Glow Effect using multiple draws ---
  const glowOffset = 1; // Increased offset for a wider spread
  const glowAlpha = 0.5; // Decreased alpha for a softer effect
  ctx.globalAlpha = glowAlpha;

  // Draw semi-transparent copies slightly offset
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
  // Diagonal offsets
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

  // Reset alpha for the main sprite
  ctx.globalAlpha = 1.0;
  // --- End Glow Effect ---

  // Draw the main ghost sprite (on top of the glow layers)
  ctx.drawImage(
    ghost.sprite, 
    spriteX, spriteY, // Source x and y in the sprite sheet
    SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE, // Source width and height
    ghost.x, ghost.y, // Destination x and y on the canvas
    GHOST_WIDTH, GHOST_HEIGHT // Destination width and height on the canvas
  );
}

// --- Draw Score ---
function drawScore() {
  ctx.font = `${1 * scaleFactor}em "Press Start 2P", monospace`; // Ensure font is scaled
  ctx.fillStyle = '#FFF'; // White text color
  ctx.textAlign = 'center'; // Center score
  // Draw score centered near the top during play
  const scoreX = canvas.width / 2;
  const scoreY = 80 * scaleFactor; // Lower normal score further down for visibility
  ctx.fillText(`Score: ${Math.floor(score)}`, scoreX, scoreY); 
}

// --- Adjusted Game Over Screen Layout ---
function drawGameOverScreen() {
  // Dark overlay for game over
  ctx.fillStyle = 'rgba(255, 0, 0, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Scale box dimensions and positions
  const boxWidth = 300 * widthScaleFactor;
  const boxHeight = 150 * scaleFactor;
  const boxX = (canvas.width - boxWidth) / 2;
  const boxY = (canvas.height - boxHeight) / 2;
  const padding = 4 * scaleFactor; // Scale padding
  const fontSize = 1 * scaleFactor; // Base font size scaled

  // Draw large final score above the game-over box
  ctx.fillStyle = '#FFF';
  ctx.font = `${2 * scaleFactor}em "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`Score: ${Math.floor(score)}`, canvas.width / 2, boxY - (20 * scaleFactor));

  // Draw black frame
  ctx.fillStyle = '#000';
  ctx.fillRect(boxX - padding, boxY - padding, boxWidth + padding * 2, boxHeight + padding * 2);

  // Draw white box
  ctx.fillStyle = '#FFF';
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  // Draw text - scale font size and positions
  ctx.fillStyle = '#000';
  ctx.font = `${fontSize}em "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  // Scale vertical offsets for text
  ctx.fillText('BAD GHOST', canvas.width / 2, boxY + 50 * scaleFactor);
  ctx.fillText("DON'T DIE", canvas.width / 2, boxY + 80 * scaleFactor);
  ctx.fillText('AGAIN', canvas.width / 2, boxY + 110 * scaleFactor);
}

// --- Game Loop ---
function gameLoop() {
  if (gameActive) {
    updateGame();
    updateParticles(); // Update particles
    drawGame();
    drawScore();
    animationFrameId = requestAnimationFrame(gameLoop);
  } else {
    drawGameOverScreen();
    cancelAnimationFrame(animationFrameId);
  }
}

// Ensure resetGame is only called on user input
canvas.addEventListener('click', () => {
  if (!gameActive) {
    resetGame();
    gameLoop();
  }
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (!gameActive) {
    resetGame();
    gameLoop();
  }
}, { passive: false });

// --- Start Game ---
Promise.all([
  font.load().catch((err) => {
    console.error('Failed to load font:', err);
  }),
  new Promise((resolve, reject) => {
    ghostSprite.onload = () => {
      console.log('Ghost sprite loaded successfully');
      resolve();
    };

    ghostSprite.onerror = (err) => {
      console.error('Failed to load ghost sprite:', err);
      reject(err);
    };

    ghostSprite.src = './assets/ghost-sprite4.png';
  })
]).then(() => {
  document.fonts.add(font);
  ctx.font = '1em PressStart2P'; // Set default font for the canvas
  initializeGame(); // Start the game only after the font and sprite are loaded
}).catch((err) => {
  console.error('Game initialization failed:', err);
});

loadSprites();