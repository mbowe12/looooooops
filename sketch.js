let palettes = [
  ['#564787', '#DBCBD8', '#F2FDFF', '#9AD4D6', '#101935'],
  ['#E55934', '#5BC0EB', '#404E4D', '#C3BF6D', '#B7B868'],
  ['#26547C', '#FFF8E8', '#FCD581', '#D52941', '#990D35'],
  ['#0E131F', '#38405F', '#59546C', '#8B939C', '#FF0035'],
  ['#080708', '#3772FF', '#DF2935', '#FDCA40', '#E6E8E6'],
  ['#0C0F0A', '#FF206E', '#FBFF12', '#41EAD4', '#FFFFFF'],
  ['#E8AEB7', '#B8E1FF', '#A9FFF7', '#94FBAB', '#82ABA1'],
  ['#ACBEA3', '#40476D', '#826754', '#AD5D4E', '#EB6534'],
  ['#313628', '#595358', '#857F74', '#A4AC96', '#CADF9E'],
  ['#EDD4B2', '#D0A98F', '#4D243D', '#CAC2B5', '#E0C9C9'],
  ['#FABC3C', '#463F3A', '#F19143', '#37505C', '#F55536'],
  ['#1A1F16', '#1E3F20', '#75B8C8', '#53FF45', '#CDD3D5'],
  ['#000000', '#3D2645', '#832161', '#DA4167', '#F0EFF4'],
  ['#161032', '#FAFF81', '#FFC53A', '#E06D06', '#B26700'],
  ['#3A4F41', '#B9314F', '#D5A18E', '#DEC3BE', '#E1DEE3'],
  ['#2B303A', '#92DCE5', '#EEEE59', '#7C7C7C', '#D64933']
];

let chosenPalette;
let margin = 50;
let cols, rows, cellSize;
let canvas;
let num1, num2, num3, num4;
let textures = [];
let chosenTexture;

let steps = 16;
let currentStep = 0;
let sounds = [];
let sequence = Array(steps).fill().map(() => Array(4).fill(false));
let isPlaying = false;
let bpm = 360;
let lastStepTime = 0;

let gKeyPressed = false;
let hKeyPressed = false;
let bothKeysStartTime = 0;
const RESET_HOLD_DURATION = 3000; // 3 seconds in milliseconds

//some images by kues1 on Freepik
function preload() {
  for (let i = 1; i <= 8; i++) {
    textures[i - 1] = loadImage(`textures/Texture${i}-8K.jpg`);
  }
  
  // Load drum sounds
  sounds[0] = loadSound('samples/Kick.wav');
  sounds[1] = loadSound('samples/Clap.wav');
  sounds[2] = loadSound('samples/HiHat.wav');
  sounds[3] = loadSound('samples/Snare.wav');
}

function setup() {
  let canvasWidth = windowWidth - 2 * margin;
  let canvasHeight = windowHeight - 2 * margin;
  canvas = createCanvas(canvasWidth, canvasHeight);
  noLoop();

  let x = (windowWidth - canvasWidth) / 2;
  let y = (windowHeight - canvasHeight) / 2;
  canvas.position(x, y);

  textAlign(CENTER, CENTER);
  textSize(20);
}

// function mousePressed() {
//   if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
//     let fs = fullscreen();
//     fullscreen(!fs);
//   }
// }

function draw() {
  background(0);
  
  if (!isPlaying) {
    drawDrumMachineUI();
  } else {
    drawGenerativeArt();
    drawDrumMachineUI();
  }
  
  // Play sequence
  if (isPlaying) {
    let stepDuration = 60000 / bpm;
    let currentTime = millis();
    if (currentTime - lastStepTime >= stepDuration) {
      playStep();
      currentStep = (currentStep + 1) % steps;
      lastStepTime = currentTime;
    }
  }
}

function drawDrumMachineUI() {
  let radius = min(width, height) * 0.4;
  let centerX = width / 2;
  let centerY = height / 2;
  
  // push();
  // stroke(0);
  // strokeWeight(20);
  // noFill();
  // circle(width/2, height/2, radius*2);
  // pop();

  for (let i = 0; i < steps; i++) {
    let angle = map(i, 0, steps, 0, TWO_PI) - HALF_PI;
    let x = centerX + cos(angle) * radius;
    let y = centerY + sin(angle) * radius;
    
    // Draw colored circles for active sounds with offset
    let circleSize = 30;
    let colors = [color(50, 50, 200, 200),
                  color(200, 200, 50, 200), 
                  color(200, 50, 50, 200), 
                  color(50, 200, 50, 200)];
    let offsets = [
      {x: -10, y: -10},
      {x: 10, y: -10},
      {x: -10, y: 10},
      {x: 10, y: 10}
    ];  // Add this closing bracket
    
    for (let j = 0; j < 4; j++) {
      if (sequence[i][j]) {
        fill(colors[j]);
        noStroke();
        ellipse(x + offsets[j].x, y + offsets[j].y, circleSize, circleSize);
      }
    }
    
    // Draw step numbers
    noStroke();
    if (i === currentStep) {
      fill(255);
      textStyle(BOLD);
      text(`[${i + 1}]`, x, y);
    } else {
      fill(150);
      textStyle(NORMAL);
      text(i + 1, x, y);
    }
  }
}

function drawGenerativeArt() {
  // Calculate num variables based on sequence
  num1 = countActiveSounds(0) + 1;
  num2 = countActiveSounds(1) + 1;
  num3 = countActiveSounds(2) + 1;
  num4 = countActiveSounds(3) + 1;

  // Set up for generative art
  calculateGridParameters();
  chosenPalette = palettes[Math.floor((num1 * 1.1 + num2 * 1.2 + num3 * 0.9 + num4 * 1.3) % palettes.length)];
  chosenTexture = textures[Math.floor((num1 * 0.8 + num2 * 1.1 + num3 * 1.0 + num4 * 0.9) % textures.length)];

  // Draw generative art
  background(chosenPalette[0]);

  if (num4 >= 1 && num4 <= 4) {
    drawRegularGrid();
  } else if (num4 >= 5 && num4 <= 8) {
    drawRadialPattern();
  } else if (num4 >= 9 && num4 <= 12) {
    drawCheckerboardPattern();
  } else if (num4 >= 13 && num4 <= 17) {
    drawMultipleRadialGrid(); 
  }

  // Draw textures
  blendMode(OVERLAY); // Use a blending mode that blends well with dark textures
  let aspectRatio = chosenTexture.width / chosenTexture.height;
  let drawWidth, drawHeight;

  if (width / height > aspectRatio) {
    drawWidth = width;
    drawHeight = width / aspectRatio;
  } else {
    drawHeight = height;
    drawWidth = height * aspectRatio;
  }

  image(chosenTexture, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);

  // Optionally, apply opacity by drawing a semi-transparent overlay
  blendMode(BLEND);
  fill(0, 0, 0, 50); //alpha value for opacity
  rect(0, 0, width, height);
}

function drawRegularGrid() {
  let noiseScale = 0.6;

  for (let y = 0; y < rows + 1; y++) {
    for (let x = 0; x < cols + 1; x++) {
      let xPos = x * cellSize;
      let yPos = y * cellSize;
      let shapeIndex = int(random(0, 4));
      let shapeSize = cellSize * (num2 / 16);
      let colorIndex = int(random(0, 5));
      let c = color(chosenPalette[colorIndex]);

      let noiseValue = noise(x * noiseScale, y * noiseScale);
      let offsetX = (noiseValue - 0.5) * cellSize * (num3 / 10);
      let offsetY = (noiseValue - 0.5) * cellSize * (num3 / 10);

      if (random() < 0.5) {
        fill(c);
      } else {
        noFill();
      }

      stroke(c);
      strokeWeight(2);

      push();
      translate(xPos + cellSize / 2 + offsetX, yPos + cellSize / 2 + offsetY);
      drawShape(shapeIndex, shapeSize);
      pop();
    }
  }
}

function drawRadialPattern() {
  let noiseScale = 0.2;
  let centerX = width / 2;
  let centerY = height / 2;
  let maxRadius = min(centerX, centerY);

  for (let r = 0; r < maxRadius; r += cellSize) {
    let circumference = TWO_PI * r;
    let numShapes = floor(circumference / cellSize);
    for (let i = 0; i < numShapes; i++) {
      let angle = i * TWO_PI / numShapes;
      let xPos = centerX + cos(angle) * r;
      let yPos = centerY + sin(angle) * r;
      let shapeIndex = int(random(0, 4));
      let shapeSize = cellSize * (num2 / 16);
      let colorIndex = int(random(0, 5));
      let c = color(chosenPalette[colorIndex]);

      let noiseValue = noise(r * noiseScale, i * noiseScale);
      let offsetX = (noiseValue - 0.5) * shapeSize * (num3 / 10);
      let offsetY = (noiseValue - 0.5) * shapeSize * (num3 / 10);

      if (random() < 0.5) {
        fill(c);
      } else {
        noFill();
      }

      stroke(c);
      strokeWeight(2);

      push();
      translate(xPos + offsetX, yPos + offsetY);
      drawShape(shapeIndex, shapeSize);
      pop();
    }
  }
}

function drawCheckerboardPattern() {
  let noiseScale = 0.1;
  let checkerSize = floor(map(num4, 9, 12, 10, 50));

  for (let y = 0; y < height; y += checkerSize) {
    for (let x = 0; x < width; x += checkerSize) {
      //calc shapes that are blank and filled
      let isShapeCell = (x / checkerSize + y / checkerSize) % 2 === 0;

      if (isShapeCell) {
        let shapeIndex = int(random(0, 4));
        let shapeSize = checkerSize * (num2 / 16);
        let colorIndex = int(random(0, 5));
        let c = color(chosenPalette[colorIndex]);

        let noiseValue = noise(x * noiseScale, y * noiseScale);
        let offsetX = (noiseValue - 0.5) * shapeSize * (num3 / 10);
        let offsetY = (noiseValue - 0.5) * shapeSize * (num3 / 10);

        fill(c);
        noStroke();

        push();
        translate(x + checkerSize / 2 + offsetX, y + checkerSize / 2 + offsetY);
        drawShape(shapeIndex, shapeSize);
        pop();
      } else {
      //space left intentionally blank :3
      }
    }
  }
}


function drawMultipleRadialGrid() {
  let noiseScale = 0.7;
  let numCenters = map(num4, 13, 17, 2, 8); // number of radial centers
  let centerRadius = min(width, height) / (2 * sqrt(numCenters));

  for (let n = 0; n < numCenters; n++) {
    let angle = n * TWO_PI / numCenters;
    let centerX = width / 2 + cos(angle) * centerRadius;
    let centerY = height / 2 + sin(angle) * centerRadius;
    let maxRadius = min(centerX, centerY, width - centerX, height - centerY);

    for (let r = 0; r < maxRadius; r += cellSize) {
      let circumference = TWO_PI * r;
      let numShapes = floor(circumference / cellSize);
      for (let i = 0; i < numShapes; i++) {
        let angle = i * TWO_PI / numShapes;
        let xPos = centerX + cos(angle) * r;
        let yPos = centerY + sin(angle) * r;
        let shapeIndex = int(random(0, 4));
        let shapeSize = cellSize * (num2 / 16);
        let colorIndex = int(random(0, 5));
        let c = color(chosenPalette[colorIndex]);

        let noiseValue = noise(r * noiseScale, i * noiseScale);
        let offsetX = (noiseValue - 0.5) * shapeSize * (num3 / 10);
        let offsetY = (noiseValue - 0.5) * shapeSize * (num3 / 10);

        if (random(0,1) < 1) {
          fill(c);
        } else {
          noFill();
        }

        stroke(c);
        strokeWeight(2);

        push();
        translate(xPos + offsetX, yPos + offsetY);
        drawShape(shapeIndex, shapeSize);
        pop();
      }
    }
  }
}

function calculateGridParameters() {
  let availableWidth = width;
  let availableHeight = height;

  let maxCells = num1 * 10; // Total number of cells in one dimension
  cellSize = min(availableWidth / maxCells, availableHeight / maxCells);

  cols = floor(availableWidth / cellSize);
  rows = floor(availableHeight / cellSize);
}

function drawShape(index, size) {
  switch(index) {
    case 0:
      rectMode(CENTER);
      rect(0, 0, size, size);
      break;
    case 1:
      ellipse(0, 0, size, size);
      break;
    case 2:
      triangle(-size / 2, size / 2, 0, -size / 2, size / 2, size / 2);
      break;
    case 3:
      drawStar(0, 0, size / 3, size / 2, 5);
      break;
  }
}

function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function windowResized() {
  let canvasWidth = windowWidth - 2 * margin;
  let canvasHeight = windowHeight - 2 * margin;
  resizeCanvas(canvasWidth, canvasHeight);
  let x = (windowWidth - canvasWidth) / 2;
  let y = (windowHeight - canvasHeight) / 2;
  canvas.position(x, y);
  calculateGridParameters();
  redraw();
}

function clearSequence() {
  sequence = Array(steps).fill().map(() => Array(4).fill(false));
}

function keyPressed() {
  let soundKeys = ['f', 'j', 'v', 'n'];
  if (soundKeys.includes(key.toLowerCase())) {
    let soundIndex = soundKeys.indexOf(key.toLowerCase());
    sequence[currentStep][soundIndex] = !sequence[currentStep][soundIndex];
    sounds[soundIndex].play();
  } else if (key === 'h') {
    hKeyPressed = true;
    if (gKeyPressed && bothKeysStartTime === 0) {
      bothKeysStartTime = millis();
    } else {
      currentStep = (currentStep + 1) % steps;
    }
  } else if (key === 'g') {
    gKeyPressed = true;
    if (hKeyPressed && bothKeysStartTime === 0) {
      bothKeysStartTime = millis();
    } else {
      currentStep = (currentStep - 1 + steps) % steps;
    }
  } else if (key === ' ') {
    isPlaying = !isPlaying;
    if (isPlaying) {
      lastStepTime = millis();
      currentStep = 0;
      playStep(); // Play the first step immediately
      loop(); // Start the draw loop
    } else {
      noLoop(); // Stop the draw loop
    }
  }
  redraw(); // Redraw the canvas to update the UI
}

function keyReleased() {
  if (key === 'g') {
    gKeyPressed = false;
  } else if (key === 'h') {
    hKeyPressed = false;
  }
  
  if (!gKeyPressed || !hKeyPressed) {
    if (bothKeysStartTime !== 0) {
      let pressDuration = millis() - bothKeysStartTime;
      if (pressDuration >= RESET_HOLD_DURATION) {
        clearSequence();
        redraw();
      }
      bothKeysStartTime = 0;
    }
  }
}

function playStep() {
  for (let i = 0; i < 4; i++) {
    if (sequence[currentStep][i]) {
      sounds[i].play();
    }
  }
}

function countActiveSounds(soundIndex) {
  return sequence.reduce((count, step) => count + (step[soundIndex] ? 1 : 0), 0);
}