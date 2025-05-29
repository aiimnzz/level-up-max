let bgImg;
let bgx = 0;
let playerImg;
let obstacleImgs = [];
let obstacles = [];
let score = 0;
let speedMultiplier = 1;
let highScore = 0;
let player;
let baseGameSpeed = 6;
let gameState = "start";

function preload() {
  bgImg = loadImage('background.png');
  playerImg = loadImage('player.png');
  obstacleImgs.push(loadImage('obstacle1.png'));
  obstacleImgs.push(loadImage('obstacle2.png'));
  obstacleImgs.push(loadImage('obstacle3.png'));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  player = new Player();
  player.x = width * 0.1;
}

function draw() {
  background(220);

  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "playing") {
    runGame();
  } else if (gameState === "gameover") {
    drawGameOverScreen();
  }
}

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  textSize(min(width, height) / 10);
  fill(0);
  text("Max's Runner", width / 2, height / 2 - 100);
  textSize(min(width, height) / 30);
  fill(50);
  text("Tap or Press SPACE to Start", width / 2, height / 2);
}

function runGame() {
  // Scroll background
  image(bgImg, bgx, 0, width, height);
  image(bgImg, bgx + width, 0, width, height);
  bgx -= baseGameSpeed + speedMultiplier * 5;
  if (bgx <= -width) {
    bgx = 0;
  }

  speedMultiplier += 0.001;
  let currentGameSpeed = baseGameSpeed + speedMultiplier * 5;

  // Update and display player
  player.update();
  player.display();

  // Spawn obstacles every 90 frames
  if (frameCount % 90 === 0) {
    obstacles.push(new Obstacle());
  }

  // Update obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.speed = currentGameSpeed + 3;  // Dynamically update speed
    obs.update();
    obs.display();

    if (obs.hits(player)) {
      gameState = "gameover";
      if (score > highScore) highScore = score;
    }

    if (obs.offscreen()) {
      obstacles.splice(i, 1);
      score++;
    }
  }

  // Draw score
  fill(0);
  textSize(min(width, height) / 25);
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 10);
}

function drawGameOverScreen() {
  textAlign(CENTER, CENTER);
  textSize(min(width, height) / 15);
  fill(255, 0, 0);
  text("Game Over", width / 2, height / 2);
  textSize(min(width, height) / 30);
  fill(0);
  text("High Score: " + highScore, width / 2, height / 2 + 40);
  text("Press R or Tap to Restart", width / 2, height / 2 + 80);
}

function keyPressed() {
  if (gameState === "start" && key === ' ') {
    gameState = "playing";
    return;
  }

  if (gameState === "playing" && key === ' ' && player.onGround()) {
    player.jump();
  }

  if (gameState === "gameover" && (key === 'r' || key === 'R')) {
    resetGame();
  }
}

function touchStarted() {
  if (gameState === "start") {
    gameState = "playing";
  } else if (gameState === "playing" && player.onGround()) {
    player.jump();
  } else if (gameState === "gameover") {
    resetGame();
  }
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  player.updateSizeAndPosition();
}

function resetGame() {
  obstacles = [];
  score = 0;
  speedMultiplier = 1;
  player = new Player();
  gameState = "start";
}

// Player class
class Player {
  constructor() {
    this.updateSizeAndPosition();
    this.vy = 0;
    this.gravity = 1;
    this.jumpForce = -27;
  }

  updateSizeAndPosition() {
    // Adjust player size relative to screen height
    this.size = height / 4; 
    this.x = width * 0.1;
    this.y = height - this.size - (height * 0.07); // Ground padding ~7% height
  }

  update() {
    this.vy += this.gravity;
    this.y += this.vy;
    let groundY = height - this.size - (height * 0.07);
    if (this.y > groundY) {
      this.y = groundY;
      this.vy = 0;
    }
  }

  display() {
    image(playerImg, this.x, this.y, this.size, this.size);
  }

  jump() {
    // Adjust jump force based on size, so jump feels right on different screen sizes
    this.vy = this.jumpForce * (this.size / 200);
  }

  onGround() {
    return this.y >= height - this.size - (height * 0.07);
  }
}

// Obstacle class
class Obstacle {
  constructor() {
    this.size = height / 6; // Relative size
    this.x = width;
    this.y = height - this.size - (height * 0.07);
    this.speed = baseGameSpeed;
    this.img = random(obstacleImgs);
  }

  update() {
    this.x -= this.speed;
  }

  display() {
    image(this.img, this.x, this.y, this.size, this.size);
  }

  hits(player) {
    let padding = this.size * 0.13; // ~20 px at base size
    return (
      player.x + padding < this.x + this.size - padding &&
      player.x + player.size - padding > this.x + padding &&
      player.y + padding < this.y + this.size - padding &&
      player.y + player.size - padding > this.y + padding
    );
  }

  offscreen() {
    return this.x + this.size < 0;
  }
}
