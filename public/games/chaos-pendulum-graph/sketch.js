let g = 0.2;
let a1, a2, a3;
let a1_v = 0, a2_v = 0, a3_v = 0;
let a1_a = 0, a2_a = 0, a3_a = 0;
let a3_scroll_v = 0;
let m1Base = 30, m2Base = 25, m3Base = 20;
let m1, m2, m3;
let r1, r2, r3;
let max_v = 0.25;
let weightFactor = 1.0;
let targetWeightFactor = 1.0;

let centerX, centerY;
let canvasSize;
let frameRadius;
let pendulumColor;
let bgColor;

let specialColorsActive = false;
let specialColor1, specialColor2, specialColor3;
let colorModeIndex = 0;
const colorHarmonies = ['triadic', 'analogous', 'splitComplementary', 'monochromatic', 'complementary'];
let baseHue;

let trailHistories = [[], [], []];
const MAX_TRAIL_FRAMES = 2400; // Increased from 1200 to keep trails even longer
const TRAIL_LINE_ALPHA = 150; // Increased from 80 for better visibility
const TRAIL_LINE_WEIGHT = 2.0; // Increased from 1.2 for better visibility

const WOBBLE_AMPLITUDE = 5;
const WOBBLE_SPEED = 0.05;

// Cursor Repulsion Constants
const REPULSION_RADIUS = 100; // Pixel radius around joints for repulsion effect
const REPULSION_STRENGTH = 0.008; // How strongly the cursor pushes the joints

let myceliumLayer;
const MYCELIUM_ALPHA = 4; // Unused, kept for reference
const MYCELIUM_FADE_ALPHA = 0; // Unused

let scrollMomentum = 0;
let momentumDecay = .99; // Reintroduced for scrollMomentum decay
let damping = .997; // Reintroduced for velocity decay
let isMouseHolding = false;
let isTouchHolding = false; // Added for touch hold state
let lastTouchX = null, lastTouchY = null; // Added for touch tracking
let touchStartTime; // Added for tap/long press detection
let touchStartX, touchStartY; // Added for tap/long press detection
const TAP_THRESHOLD_TIME = 250; // Milliseconds for tap detection
const TAP_THRESHOLD_DIST = 15; // Max pixels moved for tap/long press
const LONG_PRESS_THRESHOLD = 400; // Milliseconds for long press detection

let isDarkMode = false;
let pixelRatio;
let rightPressTime = 0;

let trailsLayer;

function setup() {
    console.log('Setup started');
    pixelRatio = window.devicePixelRatio || 1;
    try {
        createCanvas(windowWidth * pixelRatio, windowHeight * pixelRatio);
        canvas.style.width = windowWidth + 'px';
        canvas.style.height = windowHeight + 'px';
        pixelDensity(1);
        smooth();
        strokeCap(ROUND);
        console.log('Canvas created:', windowWidth, windowHeight, pixelRatio);
    } catch (e) {
        console.error('Error creating canvas:', e);
    }

    angleMode(RADIANS);
    colorMode(RGB);

    // Initialize theme from main site or system
    let savedTheme = localStorage.getItem('theme');
    if (savedTheme) document.body.dataset.theme = savedTheme;
    else if (!document.body.dataset.theme) {
        document.body.dataset.theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
            ? 'dark' : 'light';
    }
    updateThemeColors(); // Initial theme setup

    a1 = PI / 1.5;
    a2 = PI / 1.8;
    a3 = PI / 2;

    windowResized();
    baseHue = random(360);
    generateSpecialColors();

    canvas.oncontextmenu = function(e) { e.preventDefault(); };
    // Add initial random momentum for outermost arm on load
    a3_scroll_v = random(-max_v, max_v);
    // Also add slight random initial scroll momentum
    scrollMomentum = random(-max_v * 0.5, max_v * 0.5);

    // Initialize trails buffer
    trailsLayer = createGraphics(width, height);
    trailsLayer.pixelDensity(1);
    trailsLayer.clear();

    console.log('Setup completed');
}

function draw() {
    weightFactor = lerp(weightFactor, targetWeightFactor, 0.08);
    m1 = m1Base * weightFactor; m2 = m2Base * weightFactor; m3 = m3Base * weightFactor;

    calculatePhysics();

    // Apply cursor repulsion before updating velocities
    applyCursorRepulsion();

    a1_v += scrollMomentum * 0.0015;
    scrollMomentum *= momentumDecay;
    if (abs(scrollMomentum) < 0.0001) scrollMomentum = 0;
    a1_v += a1_a; a2_v += a2_a;
    // Use isTouchHolding OR isMouseHolding for increased damping
    let currentDamping = (isMouseHolding || isTouchHolding) ? 0.92 : damping;
    a1_v *= currentDamping; a2_v *= currentDamping; a3_scroll_v *= currentDamping;
    a1_v = constrain(a1_v, -max_v, max_v); a2_v = constrain(a2_v, -max_v, max_v); a3_scroll_v = constrain(a3_scroll_v, -max_v, max_v);
    a1 += a1_v; a2 += a2_v; a3 += a3_scroll_v;

    // clear main canvas
    background(bgColor);

    // fade trails buffer by drawing a transparent rect
    trailsLayer.noStroke();
    // gently fade previous trails
    trailsLayer.fill(red(bgColor), green(bgColor), blue(bgColor), 20);
    trailsLayer.rect(0, 0, width, height);

    // draw historical trails into buffer
    drawHistoricalTrailsToLayer(trailsLayer);

    // render trails buffer beneath arms
    image(trailsLayer, 0, 0);

    // reset main canvas alpha so arms draw at full opacity
    drawingContext.globalAlpha = 1;
    // draw arms at full opacity
    push();
    translate(centerX, centerY);
    drawSinglePendulum(0, specialColorsActive ? specialColor1 : pendulumColor, 0);
    drawSinglePendulum(TWO_PI / 3, specialColorsActive ? specialColor2 : pendulumColor, 1);
    drawSinglePendulum(2 * TWO_PI / 3, specialColorsActive ? specialColor3 : pendulumColor, 2);
    pop();
}

// New function to apply cursor repulsion
function applyCursorRepulsion() {
    // Only apply when mouse is not down and no touches, and mouse is inside canvas
    if (!mouseIsPressed && touches.length === 0 && 
        mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        let mx = mouseX - centerX;
        let my = mouseY - centerY;
        let mousePos = createVector(mx, my);

        // Loop through the three pendulums
        for (let i = 0; i < 3; i++) {
            let rotationOffset = i * TWO_PI / 3;
            let cosR = cos(rotationOffset);
            let sinR = sin(rotationOffset);

            // Calculate current joint positions relative to center (needed for repulsion check)
            let x1_rel = r1 * sin(a1);
            let y1_rel = r1 * cos(a1);
            let x2_rel = x1_rel + r2 * sin(a2);
            let y2_rel = y1_rel + r2 * cos(a2);
            let x3_rel = x2_rel + r3 * sin(a3);
            let y3_rel = y2_rel + r3 * cos(a3);

            // Rotate these relative positions by the pendulum's offset to get absolute coords
            let absX1 = x1_rel * cosR - y1_rel * sinR; let absY1 = x1_rel * sinR + y1_rel * cosR;
            let absX2 = x2_rel * cosR - y2_rel * sinR; let absY2 = x2_rel * sinR + y2_rel * cosR;
            let absX3 = x3_rel * cosR - y3_rel * sinR; let absY3 = x3_rel * sinR + y3_rel * cosR;

            let joint1Pos = createVector(absX1, absY1);
            let joint2Pos = createVector(absX2, absY2);
            let joint3Pos = createVector(absX3, absY3);
            let centerPos = createVector(0, 0);

            // Calculate repulsion for each joint of this pendulum
            applyRepulsionToJoint(mousePos, joint1Pos, centerPos, r1, 1); // Affects a1_v
            applyRepulsionToJoint(mousePos, joint2Pos, joint1Pos, r2, 2); // Affects a2_v
            applyRepulsionToJoint(mousePos, joint3Pos, joint2Pos, r3, 3); // Affects a3_scroll_v
        }
    }
}

// Helper function to calculate and apply repulsion to a specific joint's velocity
function applyRepulsionToJoint(mouseVec, jointVec, prevJointVec, armLength, jointIndex) {
    let distSq = p5.Vector.sub(jointVec, mouseVec).magSq();

    if (distSq < REPULSION_RADIUS * REPULSION_RADIUS && distSq > 1e-4) { // Check radius and avoid near-zero distance
        let distance = sqrt(distSq);
        let repulsionForceVec = p5.Vector.sub(jointVec, mouseVec);
        repulsionForceVec.normalize();

        // Calculate arm vector and tangent vector
        let armVec = p5.Vector.sub(jointVec, prevJointVec);
        // Ensure armVec is not zero length before creating tangent
        if (armVec.magSq() < 1e-6) return; 
        let tangentVec = createVector(-armVec.y, armVec.x).normalize(); // Perpendicular to arm

        // Project repulsion force onto the tangent vector
        let tangentialForceMag = repulsionForceVec.dot(tangentVec);

        // Scale force by distance (stronger when closer) and base strength
        let forceScale = REPULSION_STRENGTH * (1 - distance / REPULSION_RADIUS);

        // Apply tangential impulse to the corresponding angular velocity
        // Simplified conversion from linear impulse to angular impulse
        // Added small value to denominator to prevent division by zero/instability with very short arms
        let angularImpulse = (tangentialForceMag * forceScale) / (armLength * 0.1 + 1); 

        // Apply to the correct angular velocity based on joint index
        // Note: Since a1, a2, a3 are shared, we apply the impulse directly.
        // This means repulsion on one pendulum affects the shared angles.
        if (jointIndex === 1) {
            a1_v += angularImpulse;
        } else if (jointIndex === 2) {
            a2_v += angularImpulse;
        } else if (jointIndex === 3) {
            a3_scroll_v += angularImpulse;
        }
    }
}

function drawHistoricalTrailsToLayer(layer) {
    layer.push();
    layer.strokeWeight(TRAIL_LINE_WEIGHT / pixelRatio);
    layer.noFill();
    for (let i = 0; i < 3; i++) {
        let history = trailHistories[i];
        let baseColor = specialColorsActive ? [specialColor1, specialColor2, specialColor3][i] : pendulumColor;
        for (let j = 0; j < history.length; j++) {
            let state = history[j];
            let col = color(baseColor);
            col.setAlpha(map(j, 0, history.length, TRAIL_LINE_ALPHA, 0));
            layer.stroke(col);
            let { x1, y1, x2, y2, x3, y3 } = state;
            // Draw trail for the middle arm (first joint to second joint)
            layer.line(x1 + centerX, y1 + centerY, x2 + centerX, y2 + centerY);
            // Draw trail for the outer arm (second joint to third joint)
            layer.line(x2 + centerX, y2 + centerY, x3 + centerX, y3 + centerY);
        }
    }
    layer.pop();
}

function calculatePhysics() {
    let m1_ = m1; let m2_ = m2; let r1_ = r1; let r2_ = r2; let g_ = g;
    let num1 = -g_ * (m1_ + m2_) * sin(a1);
    let num2 = -m2_ * g_ * sin(a1 - 2 * a2);
    let num3 = -2 * sin(a1 - a2) * m2_;
    let num4 = a2_v * a2_v * r2_ + a1_v * a1_v * r1_ * cos(a1 - a2);
    let den = r1_ * (m1_ + m2_ * sin(a1 - a2) * sin(a1 - a2));
    if (abs(den) > 1e-6) { a1_a = (num1 + num2 + num3 * num4) / den; } else { a1_a = 0; }
    num1 = (m1_ + m2_) * (a1_v * a1_v * r1_ + g_ * cos(a1));
    num2 = m2_ * a2_v * a2_v * r2_ * cos(a1 - a2);
    den = r2_ * (m1_ + m2_ * sin(a1 - a2) * sin(a1 - a2));
    if (abs(den) > 1e-6) { a2_a = (sin(a1 - a2) * (num1 + num2)) / den; } else { a2_a = 0; }
    a3_a = 0;
}

function drawSinglePendulum(rotationOffset, baseColor, pendulumIndex) {
    // ensure arms draw at full alpha
    drawingContext.globalAlpha = 1;
    strokeCap(ROUND);
    let x0 = 0, y0 = 0;
    let x1 = x0 + r1 * sin(a1);
    let y1 = y0 + r1 * cos(a1);
    let x2 = x1 + r2 * sin(a2);
    let y2 = y1 + r2 * cos(a2);
    let x3 = x2 + r3 * sin(a3);
    let y3 = y2 + r3 * cos(a3);

    let cosR = cos(rotationOffset);
    let sinR = sin(rotationOffset);
    let absX1 = (x1 * cosR - y1 * sinR); let absY1 = (x1 * sinR + y1 * cosR);
    let absX2 = (x2 * cosR - y2 * sinR); let absY2 = (x2 * sinR + y2 * cosR);
    let absX3 = (x3 * cosR - y3 * sinR); let absY3 = (x3 * sinR + y3 * cosR);

    let currentFrameData = {
        x1: absX1, y1: absY1,
        x2: absX2, y2: absY2,
        x3: absX3, y3: absY3
    };
    trailHistories[pendulumIndex].unshift(currentFrameData);
    // limit length to avoid unbounded memory growth
    if (trailHistories[pendulumIndex].length > MAX_TRAIL_FRAMES) {
        trailHistories[pendulumIndex].pop();
    }

    push();
    rotate(rotationOffset);

    // Ensure the stroke color is fully opaque, especially in monochrome mode
    let finalStrokeColor = color(baseColor); // Create a copy to modify
    if (!specialColorsActive) {
        finalStrokeColor.setAlpha(255); // Force full alpha
    }
    stroke(finalStrokeColor); // Use the potentially adjusted color

    // Draw arms
    strokeWeight(map(m1Base, 10, 50, 2 / pixelRatio, 8 / pixelRatio, true) * 3); line(x0, y0, x1, y1); // Innermost arm
    strokeWeight(map(m2Base, 10, 50, 2 / pixelRatio, 6 / pixelRatio, true) * 3); line(x1, y1, x2, y2); // Middle arm
    strokeWeight(map(m3Base, 10, 50, 1 / pixelRatio, 5 / pixelRatio, true) * 3); line(x2, y2, x3, y3); // Outer arm
    pop();
}

function mouseWheel(event) {
    if (abs(event.deltaY) > abs(event.deltaX)) {
        scrollMomentum -= event.deltaY * 0.06;
    } else {
        a3_scroll_v += event.deltaX * 0.005;
        a3_scroll_v = constrain(a3_scroll_v, -max_v, max_v);
    }
    return false;
}

function mousePressed() {
    if (mouseButton === RIGHT) {
        rightPressTime = millis();
    } else if (mouseButton === LEFT) {
        isMouseHolding = true;
    }
}

function mouseReleased() {
    if (mouseButton === RIGHT) {
        let duration = millis() - rightPressTime;
        if (duration >= LONG_PRESS_THRESHOLD) {
            // long right-click toggles theme
            const current = document.body.dataset.theme || (isDarkMode ? 'dark' : 'light');
            const next = current === 'light' ? 'dark' : 'light';
            document.body.dataset.theme = next;
            localStorage.setItem('theme', next);
            updateThemeColors(); // Update colors on theme change
        } else {
            // short right-click cycles pendulum colors
            cycleColors();
        }
    } else if (mouseButton === LEFT) {
        isMouseHolding = false;
    }
}

function touchStarted() {
    if (touches.length === 1) { // Only handle single touch for now
        lastTouchX = touchStartX = mouseX; // Use p5's mouseX/Y for touch
        lastTouchY = touchStartY = mouseY;
        touchStartTime = millis();
        isTouchHolding = true; // Set holding state
    }
    return false; // Prevent default browser actions like scrolling
}

function touchMoved() {
    if (lastTouchX === null || touches.length !== 1) return false; // Only handle single touch drag

    let dx = mouseX - lastTouchX;
    let dy = mouseY - lastTouchY;

    // Apply drag consistently regardless of hold duration
    // Map vertical drag to scrollMomentum (like vertical wheel)
    scrollMomentum -= dy * 0.4; // Adjust multiplier for sensitivity
    // Map horizontal drag to a3_scroll_v (like horizontal wheel)
    a3_scroll_v += dx * 0.01;   // Adjust multiplier for sensitivity
    a3_scroll_v = constrain(a3_scroll_v, -max_v, max_v);

    lastTouchX = mouseX;
    lastTouchY = mouseY;
    return false; // Prevent default browser actions
}

function touchEnded() {
    if (lastTouchX !== null) { // Ensure this corresponds to a started touch
        let timeElapsed = millis() - touchStartTime;
        let distMoved = dist(touchStartX, touchStartY, mouseX, mouseY);

        if (timeElapsed < TAP_THRESHOLD_TIME && distMoved < TAP_THRESHOLD_DIST) {
            // Short tap: Cycle colors (like short right-click)
            cycleColors();
        } else if (timeElapsed >= LONG_PRESS_THRESHOLD && distMoved < TAP_THRESHOLD_DIST) {
            // Long press without significant movement: Toggle theme (like long right-click)
            const current = document.body.dataset.theme || (isDarkMode ? 'dark' : 'light');
            const next = current === 'light' ? 'dark' : 'light';
            document.body.dataset.theme = next;
            localStorage.setItem('theme', next);
            updateThemeColors(); // Update colors on theme change
        }
        // Any other touch end (drag, multi-touch ending) simply stops the interaction
    }

    // Reset touch state variables regardless of what happened
    lastTouchX = null;
    lastTouchY = null;
    touchStartTime = null;
    touchStartX = null;
    touchStartY = null;
    isTouchHolding = false; // Reset holding state
    return false; // Prevent default browser actions
}

function windowResized() {
    pixelRatio = window.devicePixelRatio || 1;
    resizeCanvas(windowWidth * pixelRatio, windowHeight * pixelRatio);
    canvas.style.width = windowWidth + 'px';
    canvas.style.height = windowHeight + 'px';
    centerX = width / 2; centerY = height / 2;
    canvasSize = min(width, height); frameRadius = canvasSize * 0.46;
    let totalBase = m1Base + m2Base + m3Base; let desiredTotalLength = frameRadius * 0.85;
    r1 = desiredTotalLength * (m1Base / totalBase); r2 = desiredTotalLength * (m2Base / totalBase); r3 = desiredTotalLength * (m3Base / totalBase);

    if (myceliumLayer) myceliumLayer.remove(); myceliumLayer = createGraphics(width, height); myceliumLayer.clear();
    trailHistories = [[], [], []];

    // Recreate trails buffer on resize
    if (trailsLayer) trailsLayer.remove();
    trailsLayer = createGraphics(width, height);
    trailsLayer.pixelDensity(1);
    trailsLayer.clear();

    updateThemeColors(); // Update colors on resize
    console.log('Window resized:', windowWidth, windowHeight);
}

function updateThemeColors() {
    const theme = document.body.dataset.theme || 'light';
    isDarkMode = (theme === 'dark');
    // Set background color based on theme
    bgColor = isDarkMode ? color('hsl(0, 0%, 5%)') : color('hsl(0, 0%, 95%)');

    // Set the default pendulum color ONLY if special colors are NOT active
    if (!specialColorsActive) {
        pendulumColor = isDarkMode ? color(250) : color(0); // Explicit black for light mode
    }

    // Update body style and ensure dataset matches
    document.body.style.backgroundColor = isDarkMode ? 'hsl(0, 0%, 5%)' : 'hsl(0, 0%, 95%)';
    document.body.dataset.theme = theme;

    // console.log(`Theme updated: ${theme}, Special Active: ${specialColorsActive}`); // Optional debug log
}

function generateSpecialColors() {
    let S = isDarkMode ? 80 : 90;
    let B = isDarkMode ? 95 : 85;
    colorMode(HSB, 360, 100, 100);
    let h = baseHue;
    let harmony = colorHarmonies[colorModeIndex];
    if (harmony === 'triadic') {
        specialColor1 = color(h, S, B);
        specialColor2 = color((h + 120) % 360, S, B);
        specialColor3 = color((h + 240) % 360, S, B);
    } else if (harmony === 'analogous') {
        specialColor1 = color(h, S, B);
        specialColor2 = color((h + 35) % 360, S, B);
        specialColor3 = color((h - 35 + 360) % 360, S, B);
    } else if (harmony === 'splitComplementary') {
        specialColor1 = color(h, S, B);
        specialColor2 = color((h + 150) % 360, S, B);
        specialColor3 = color((h + 210) % 360, S, B);
    } else if (harmony === 'monochromatic') {
        specialColor1 = color(h, S, B);
        specialColor2 = color(h, S * 0.75, B * 0.85);
        specialColor3 = color(h, S * 0.55, B * 0.70);
    } else if (harmony === 'complementary') {
        specialColor1 = color(h, S, B);
        specialColor2 = color((h + 180) % 360, S, B);
        specialColor3 = color(h, S * 0.4, B);
    }
    colorMode(RGB);
    console.log('Special colors generated:', colorHarmonies[colorModeIndex]);
}

function cycleColors() {
    a1 = PI / 1.5;
    a2 = PI / 1.8;
    a3 = PI / 2;
    a1_v = 0; a2_v = 0; a3_v = 0;
    a1_a = 0; a2_a = 0; a3_a = 0;
    a3_scroll_v = 0;
    scrollMomentum = 0;
    // Add initial random momentum on reset
    a3_scroll_v = random(-max_v, max_v);
    scrollMomentum = random(-max_v * 0.5, max_v * 0.5);
    weightFactor = 1.0;
    targetWeightFactor = 1.0;
    trailHistories = [[], [], []];

    // Explicitly clear the trails buffer
    if (trailsLayer) {
        trailsLayer.clear();
        // Redraw the background onto the cleared trails layer immediately
        // to avoid a flicker if the background isn't drawn first thing
        // in the main draw loop.
        trailsLayer.background(bgColor);
    }

    specialColorsActive = !specialColorsActive;
    if (specialColorsActive) {
        colorModeIndex = (colorModeIndex + 1) % colorHarmonies.length;
        baseHue = random(360);
        generateSpecialColors();
        console.log("Special Colors ON. Mode:", colorHarmonies[colorModeIndex]);
    } else {
        console.log("Special Colors OFF");
        // When turning OFF, ensure the default pendulumColor is set based on the current theme.
        updateThemeColors(); // Sets pendulumColor correctly
    }
}