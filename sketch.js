let bgImg;
let bgx = 0;
let playerImg;
let obstacleImgs = [];
let obstacles = [];
let score = 0;
let speedMultiplier = 1;
let gameSpeed = 6;
let highScore = 0;
let player;
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
}

function draw() {
  background(220);

  // Scrolling background
  image(bgImg, bgx, 0, width, height);
  image(bgImg, bgx + width, 0, width, height);
  bgx -= gameSpeed;
  if (bgx <= -width) {
    bgx = 0;
  }

  if (gameState === "start") {
    drawStartScreen();
    return;
  }

  if (gameState === "playing") {
    runGame();
  }

  if (gameState === "gameOver") {
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
  text("Press SPACE or TAP to Start", width / 2, height / 2);
}

function drawGameOverScreen() {
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255, 0, 0);
  text("Game Over", width / 2, height / 2 - 40);
  textSize(24);
  fill(0);
  text("High Score: " + highScore, width / 2, height / 2 + 10);
  text("Press R or TAP to Restart", width / 2, height / 2 + 50);
}

function runGame() {
  speedMultiplier += 0.001;
  gameSpeed = 6 + speedMultiplier * 5;

  player.update();
  player.display();

  if (frameCount % 90 === 0) {
    obstacles.push(new Obstacle());
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update();
    obstacles[i].display();

    if (obstacles[i].hits(player)) {
      gameState = "gameOver";
      if (score > highScore) {
        highScore = score;
      }
    }

    if (obstacles[i].offscreen()) {
      obstacles.splice(i, 1);
      score++;
    }
  }

  fill(0);
  textSize(24);
  text("Score: " + score, 10, 30);
}

function keyPressed() {
  if (gameState === "start" && key === ' ') {
    gameState = "playing";
  } else if (gameState === "playing" && key === ' ' && player.onGround()) {
    player.jump();
  } else if (gameState === "gameOver" && (key === 'r' || key === 'R')) {
    resetGame();
  }
}

function touchStarted() {
  if (gameState === "start") {
    gameState = "playing";
  } else if (gameState === "gameOver") {
    resetGame();
  } else if (gameState === "playing" && player.onGround()) {
    player.jump();
  }
  return false; // Prevent default behavior
}

function resetGame() {
  obstacles = [];
  score = 0;
  speedMultiplier = 1;
  gameSpeed = 6;
  player = new Player();
  gameState = "playing";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Player class
class Player {
  constructor() {
    this.x = 50;
    this.y = height - 100;
    this.vy = 0;
    this.size = 200;
  }

  update() {
    this.vy += 1; // gravity
    this.y += this.vy;
    if (this.y > height - this.size - 50) {
      this.y = height - this.size - 50;
      this.vy = 0;
    }
  }

  display() {
    image(playerImg, this.x, this.y, this.size, this.size);
  }

  jump() {
    this.vy = -27;
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
    this.speed = 9 * speedMultiplier;
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
