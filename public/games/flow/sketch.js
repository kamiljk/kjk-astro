// === Flow State Simulator ===
// Requires face SVG at path: 'face_trimmed.png'

let faceImg;
let skill = 50; // x-axis
let challenge = 50; // y-axis

let originX;
let originY;
let axisLength;

function preload() {
  faceImg = loadImage("face.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  calculateLayout();
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  textFont('Courier New');
  textStyle(BOLD);
  imageMode(CENTER);
  noStroke();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateLayout();
}

function calculateLayout() {
  axisLength = min(windowWidth, windowHeight) * 0.6;
  originX = windowWidth * 0.125;
  originY = windowHeight * 0.875;
}

function draw() {
  background(255);
  drawAxes();
  drawFlowZone();
  drawFace(skill, challenge);
  drawDynamicLabels();
  drawStaticLabels();
}

function drawAxes() {
  push();
  translate(originX, originY);
  stroke(150, 0, 0);
  strokeWeight(3);
  line(0, 0, 0, -axisLength);
  line(0, 0, axisLength, 0);
  fill(150, 0, 0);
  noStroke();
  textSize(axisLength * 0.035);
  push();
  translate(-60, -axisLength / 2);
  rotate(-90);
  text("CHALLENGE", 0, 0);
  pop();
  text("SKILLS", axisLength / 2, 50);
  pop();
}

function drawFlowZone() {
  push();
  translate(originX, originY);
  rotate(-45);
  fill(150, 0, 0, 30);
  noStroke();
  rect(axisLength * 0.4, -50, axisLength, 100);
  pop();
}

function drawDynamicLabels() {
  push();
  translate(originX, originY);
  fill(150, 0, 0);

  textSize(axisLength * 0.04);
  push();
  translate(axisLength * 0.7, -axisLength * 0.6);
  rotate(-45);
  text("FLOW STATE", 0, 0);
  pop();

  textSize(axisLength * 0.03);
  text("ANXIETY", axisLength * 0.15, -axisLength * 0.88);
  text("BOREDOM", axisLength * 0.75, -axisLength * 0.18);
  text("FEAR\nOF\nFAILURE", axisLength * 0.28, -axisLength * 0.95);
  text("LOSS\nOF\nINTEREST", axisLength * 0.87, -axisLength * 0.35);
  pop();
}

function drawStaticLabels() {
  push();
  translate(originX, originY);
  fill(150, 0, 0);
  textSize(axisLength * 0.025);
  text("DOUBT", -50, -axisLength * 0.33);

  push();
  translate(-50, 50);
  rotate(-45);
  text("APATHY", 0, 0);
  pop();

  text("NOSTALGIA", axisLength * 0.2, 40);
  pop();
}

function drawFace(skill, challenge) {
  push();
  translate(originX, originY);
  let x = skillToX(skill);
  let y = -challengeToY(challenge);
  image(faceImg, x, y, axisLength * 0.2, axisLength * 0.2);
  pop();
}

function skillToX(val) {
  return map(val, 0, 100, 0, axisLength);
}

function challengeToY(val) {
  return map(val, 0, 100, 0, axisLength);
}

function keyPressed() {
  if (key === 'A') skill = max(0, skill - 5);
  if (key === 'D') skill = min(100, skill + 5);
  if (key === 'W') challenge = min(100, challenge + 5);
  if (key === 'S') challenge = max(0, challenge - 5);
}
