// sketch.js
// Ensure p5.js functions are available
let cubes = [];
let numCubes;
let hueOffset = 0;
let groupRot;
let rotSpeedFactor;
let singularityScale;
let backgroundColor;
let jitterFactor = 0; // global jitter factor for chaotic movement
let glowingCubeIndex = -1; // Index of the currently glowing cube
let glowTimer = 0; // Timer to control glow duration
let glowIntensity = 0; // Intensity of the glow effect

// define harmonious HDR neon and neutral palette
const palette = [];

function setup() {
  rotSpeedFactor = random(-2, 2); // Initialize after p5.js is ready
  singularityScale = random(0.5, 5); // Initialize after p5.js is ready
  numCubes = int(random(50, 200)); // Initialize after p5.js is ready
  createCanvas(windowWidth, windowHeight, WEBGL);
  groupRot = createVector(0, 0, 0);
  colorMode(HSB, 360, 100, 100);

  // Pure monochrome with a single accent color (darker tones, reduced saturation and brightness)
  const monochrome = [
    color(0, 0, 3),   // very dark gray
    color(0, 0, 6),   // darker gray
    color(0, 0, 12),  // dark gray
    color(0, 0, 18),  // medium gray
    color(0, 0, 24),  // light gray
    color(0, 0, 30)   // very light gray
  ];
  const accent = [
    color(30, 50, 20) // very muted golden yellow
  ];

  // Expanded harmonic combinations: split-complementary, triadic, and tetradic schemes
  const splitComplementary = [
    color(30, 50, 20), // muted golden yellow
    color(210, 50, 20), // muted blue
    color(150, 50, 20)  // muted green
  ];
  const triadic = [
    color(0, 50, 20),   // muted red
    color(120, 50, 20), // muted green
    color(240, 50, 20)  // muted blue
  ];
  const tetradic = [
    color(0, 50, 20),   // muted red
    color(90, 50, 20),  // muted yellow-green
    color(180, 50, 20), // muted cyan
    color(270, 50, 20)  // muted purple
  ];

  // Shuffle themes to randomize starting color combination
  const themes = [monochrome, accent, splitComplementary, triadic, tetradic];
  shuffle(themes, true); // Shuffle themes array in place

  // Blend palettes dynamically with a random starting theme
  palette.length = 0;
  for (let theme of themes) {
    for (let col of theme) {
      palette.push(col);
    }
  }

  // Set initial background color to harmonize with the palette
  const randomIndex = int(random(palette.length)); // Pick a truly random index
  const randomColor = palette[randomIndex];
  backgroundColor = color(hue(randomColor), saturation(randomColor) * 0.5, brightness(randomColor) * 0.2); // Harmonize background

  for (let i = 0; i < numCubes; i++) {
    cubes.push(new Cube());
  }
}

function draw() {
  // faster continuous bracket volume control
  if (keyIsDown(219)) {  // '[' key
    let removeCount = min(volumeStep, cubes.length - 1);
    for (let i = 0; i < removeCount; i++) cubes.pop();
  }
  if (keyIsDown(221)) {  // ']' key
    for (let i = 0; i < volumeStep; i++) cubes.push(new Cube());
  }

  // handle singularity effects
  if (keyIsDown(90)) { // 'z' key for explosion
    singularityScale = min(singularityScale + 0.1, 50); // max scale
  }
  if (keyIsDown(67)) { // 'c' key for compression
    singularityScale = max(singularityScale - 0.1, 0.1); // min scale
  }

  // Handle jitter control with 'A' and 'D'
  if (keyIsDown(65)) { // 'A' key for stability
    jitterFactor = max(0, jitterFactor - 0.01); // decrease jitter
  }
  if (keyIsDown(68)) { // 'D' key for chaos
    jitterFactor = min(1, jitterFactor + 0.01); // increase jitter
  }

  // Update background color dynamically to harmonize with hueOffset
  const baseColor = palette[0];
  backgroundColor = color((hue(baseColor) + hueOffset + 180) % 360, saturation(baseColor) * 0.5, brightness(baseColor) * 0.2);
  background(backgroundColor);

  directionalLight(255, 255, 255, 0.5, 1, -1);
  ambientLight(60);

  // Handle random glow effect with easing
  if (glowTimer <= 0) {
    glowingCubeIndex = int(random(cubes.length)); // Pick a random cube
    glowTimer = int(random(30, 60)); // Set glow duration (frames)
  } else {
    glowTimer--;
  }

  // Ease the glow intensity in and out
  if (glowTimer > 30) {
    glowIntensity = lerp(glowIntensity, 1, 0.1); // Ease in
  } else {
    glowIntensity = lerp(glowIntensity, 0, 0.1); // Ease out
  }

  // apply group rotation from horizontal scroll
  push();
  rotateX(groupRot.x);
  rotateY(groupRot.y);
  rotateZ(groupRot.z);
  for (let i = 0; i < cubes.length; i++) {
    let c = cubes[i];
    c.update(jitterFactor);
    c.show(singularityScale, true, i === glowingCubeIndex, glowIntensity); // Pass glow intensity
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function doubleClicked() {
  for (let i = cubes.length - 1; i >= 0; i--) {
    let c = cubes[i];

    // Calculate screen-space position of the cube using p5.js's screenX and screenY
    let sx = screenX(c.pos.x, c.pos.y, c.pos.z);
    let sy = screenY(c.pos.x, c.pos.y, c.pos.z);

    // approximate on-screen radius by projecting offset point
    let edge = max(c.sizeX, c.sizeY, c.sizeZ) / 2; // use the largest dimension for radius
    let sxEdge = screenX(c.pos.x + edge, c.pos.y, c.pos.z);
    let syEdge = screenY(c.pos.x + edge, c.pos.y, c.pos.z);
    let r = dist(sx, sy, sxEdge, syEdge);

    if (dist(mouseX, mouseY, sx, sy) < r) {
      cubes.splice(i, 1);
      break;
    }
  }
}

function mouseWheel(event) {
  // horizontal scroll => adjust rotation speed (allow backwards)
  if (event.deltaX) {
    rotSpeedFactor += event.deltaX * 0.001;
  }
  // vertical scroll => enhance color dynamics
  if (event.deltaY) {
    hueOffset = (hueOffset + event.deltaY * 0.1) % 360; // increase hueOffset effect
    for (let c of cubes) {
      c.s = constrain(c.s + event.deltaY * 0.01, 0, 100); // adjust saturation
      c.b = constrain(c.b + event.deltaY * 0.01, 0, 100); // adjust brightness
    }
  }
  return false; // prevent default scrolling/zooming
}

function keyPressed() {}

class Cube {
  constructor() {
    this.pos = p5.Vector.random3D().mult(random(100, 300));
    this.sizeX = random(20, 100); // vary width
    this.sizeY = random(20, 100); // vary height
    this.sizeZ = random(20, 100); // vary depth
    this.rot = createVector(random(TWO_PI), random(TWO_PI), random(TWO_PI));
    this.speed = createVector(random(0.005, 0.02), random(0.005, 0.02), random(0.005, 0.02));
    // Assign a color from the refined palette
    this.col = random(palette);
    this.h = hue(this.col);
    this.s = saturation(this.col);
    this.b = brightness(this.col);
  }
  update(jitterFactor) {
    // apply global speed multiplier to rotation
    this.rot.add(p5.Vector.mult(this.speed, rotSpeedFactor));

    // Add jittery movement based on jitterFactor
    if (jitterFactor > 0) {
      this.pos.add(p5.Vector.random3D().mult(jitterFactor * 2));
    }
  }
  show(scaleFactor = 1, scalePositionOnly = false, isGlowing = false, glowIntensity = 0) {
    push();
    if (scalePositionOnly) {
      translate(this.pos.copy().mult(scaleFactor)); // scale position only
    } else {
      translate(this.pos);
    }
    rotateX(this.rot.x);
    rotateY(this.rot.y);
    rotateZ(this.rot.z);
    // dynamic hue
    let dynCol = color((this.h + hueOffset + 360) % 360, this.s * 0.5, this.b * 0.5);
    if (isGlowing) {
      dynCol = color((this.h + hueOffset + 360) % 360, 100, 100 * glowIntensity); // Adjust brightness by glow intensity
    }
    ambientMaterial(dynCol);
    noStroke();
    shininess(isGlowing ? 100 : 50); // Increase shininess for glowing cube
    box(this.sizeX, this.sizeY, this.sizeZ); // use varied dimensions
    pop();
  }
}
