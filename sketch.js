let bgImg;
let playerImg;
let obstacleImgs = [];
let obstacles = [];
let score = 0;
let speedMultiplier = 1;
let gameState = "start";
let highScore = 0;
let player;
let bgx = 0;
let baseSpeed = 6;

function preload() {
  bgImg = loadImage('images/background.png');
  playerImg = loadImage('images/player.png');
  obstacleImgs.push(loadImage('images/obstacle1.png'));
  obstacleImgs.push(loadImage('images/obstacle2.png'));
  obstacleImgs.push(loadImage('images/obstacle3.png'));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  player = new Player();
}

function draw() {
  background(220);

  if (gameState === "start") {
    drawStartScreen();
    return;
  }

  drawBackground();

  if (gameState === "playing") {
    runGame();
  } else if (gameState === "gameover") {
    drawGameOver();
  }
}

function drawBackground() {
  image(bgImg, bgx, 0, width, height);
  image(bgImg, bgx + width, 0, width, height);
  bgx -= baseSpeed + speedMultiplier * 5;
  if (bgx <= -width) bgx = 0;
}

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  fill(0);
  textSize(width / 10);
  text("Max's Runner", width / 2, height / 2 - 100);
  textSize(width / 25);
  text("Tap or Press SPACE to Start", width / 2, height / 2);
}

function runGame() {
  player.update();
  player.display();

  speedMultiplier += 0.001;
  let currentSpeed = baseSpeed + speedMultiplier * 5;

  if (frameCount % 90 === 0) {
    obstacles.push(new Obstacle(currentSpeed));
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update();
    obstacles[i].display();

    if (obstacles[i].hits(player)) {
      gameState = "gameover";
      if (score > highScore) highScore = score;
    }

    if (obstacles[i].offscreen()) {
      obstacles.splice(i, 1);
      score++;
    }
  }

  fill(0);
  textAlign(LEFT, TOP);
  textSize(width / 30);
  text("Score: " + score, 10, 10);
}

function drawGameOver() {
  textAlign(CENTER, CENTER);
  textSize(width / 12);
  fill(255, 0, 0);
  text("Game Over", width / 2, height / 2);
  textSize(width / 30);
  fill(0);
  text("High Score: " + highScore, width / 2, height / 2 + 50);
  text("Press R or Tap to Restart", width / 2, height / 2 + 100);
}

function keyPressed() {
  if (gameState === "start" && key === ' ') {
    gameState = "playing";
  } else if (gameState === "playing" && key === ' ' && player.onGround()) {
    player.jump();
  } else if (gameState === "gameover" && (key === 'r' || key === 'R')) {
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
  return true;
}

function mousePressed() {
  // fallback for devices that don’t trigger touchStarted
  touchStarted();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (player) player.resize();
}

function resetGame() {
  score = 0;
  speedMultiplier = 1;
  obstacles = [];
  player = new Player();
  gameState = "start";
}

// ----------------------------
// Classes
// ----------------------------
class Player {
  constructor() {
    this.resize();
    this.vy = 0;
    this.gravity = 1;
    this.jumpForce = -27;
  }

  resize() {
    this.size = height / 4;
    this.x = width * 0.1;
    this.y = height - this.size - height * 0.07;
  }

  update() {
    this.vy += this.gravity;
    this.y += this.vy;

    let ground = height - this.size - height * 0.07;
    if (this.y > ground) {
      this.y = ground;
      this.vy = 0;
    }
  }

  display() {
    image(playerImg, this.x, this.y, this.size, this.size);
  }

  jump() {
    this.vy = this.jumpForce * (this.size / 200);
  }

  onGround() {
    return this.y >= height - this.size - height * 0.07;
  }
}

class Obstacle {
  constructor(speed) {
    this.size = height / 6;
    this.x = width;
    this.y = height - this.size - height * 0.07;
    this.speed = speed;
    this.img = random(obstacleImgs);
  }

  update() {
    this.x -= this.speed;
  }

  display() {
    image(this.img, this.x, this.y, this.size, this.size);
  }

  hits(player) {
    let padding = this.size * 0.15;
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
