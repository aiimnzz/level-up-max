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
  // Force portrait orientation for gameplay
  if (windowWidth > windowHeight) {
    background(0);
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(24);
    text("Please rotate your device to portrait", width / 2, height / 2);
    return;
  }

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
  textSize(60);
  fill(0);
  text("Max's Runner", width / 2, height / 2 - 100);
  textSize(24);
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
  textSize(24);
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 10);
}

function drawGameOverScreen() {
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255, 0, 0);
  text("Game Over", width / 2, height / 2);
  textSize(24);
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
  player.y = height - player.size - 50;
  player.vy = 0;  // Reset velocity to prevent falling through floor
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
    this.size = 200;
    this.x = width * 0.1;
    this.y = height - this.size - 50;
    this.vy = 0;
    this.gravity = 1;
    this.jumpForce = -27; // Can tweak based on device size if needed
  }

  update() {
    this.vy += this.gravity;
    this.y += this.vy;
    let groundY = height - this.size - 50;
    if (this.y > groundY) {
      this.y = groundY;
      this.vy = 0;
    }
  }

  display() {
    image(playerImg, this.x, this.y, this.size, this.size);
  }

  jump() {
    this.vy = this.jumpForce;
  }

  onGround() {
    return this.y >= height - this.size - 50;
  }
}

// Obstacle class
class Obstacle {
  constructor() {
    this.size = 150;
    this.x = width;
    this.y = height - this.size - 60;
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
    let padding = 20;
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
