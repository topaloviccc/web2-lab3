const canvas = document.getElementById("mycanvas");
const ctx = canvas.getContext("2d");

const paddleHeight = 15;
const paddleWidth = 270;
const PADDLE_SPEED = 10;
const BRICKS_TOTAL = 50;
const BRICKS_IN_ROW = 10;
const START_BALL_SPEED = 3;

const brickWidth = 60;
const brickHeigth = 20;

const ballDim = 20;

var paddleX = canvas.width / 2 - paddleWidth / 2;
var paddleY = canvas.height - 30;

var ballSpeedX = START_BALL_SPEED;
var ballSpeedY = START_BALL_SPEED;
var bricks = [];

var ballX = paddleX + paddleWidth / 2;
var ballY = paddleY - ballDim;
var ballSpeed = START_BALL_SPEED;

var pressedSpace = false;
var pressedLeft = false;
var pressedRight = false;

var currScore = 0;
if (localStorage.getItem("highScore") === null) {
	localStorage.setItem("highScore", 0);
}

function drawPaddle() {
	ctx.fillStyle = "white";
	ctx.shadowBlur = 20;
	ctx.shadowColor = "white";
	ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
}

function drawBall() {
	ctx.fillStyle = "lightgray";
	ctx.shadowBlur = 10;
	ctx.shadowColor = "white";
	ctx.fillRect(ballX, ballY, ballDim, ballDim);
}

function createBricks() {
	const rows = BRICKS_TOTAL / BRICKS_IN_ROW;
	const fillColors = [
		"rgb(153, 51, 0)",
		"rgb(255, 0, 0)",
		"rgb(255, 153, 204)",
		"rgb(0, 255, 0)",
		"rgb( 255, 255, 153)",
	];
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < BRICKS_IN_ROW; j++) {
			let brickX = 60 + j * (brickWidth + 50);
			let brickY = 80 + i * (brickHeigth + 30);
			let isVisible = true;
			let color = fillColors[i];

			bricks.push([brickX, brickY, color, isVisible]);
		}
	}
}

createBricks();

function drawBricks() {
	for (brick of bricks) {
		if (brick[3] == true) {
			ctx.shadowBlur = 50;
			ctx.shadowColor = "white";
			ctx.fillStyle = brick[2];
			ctx.fillRect(brick[0], brick[1], brickWidth, brickHeigth);
		}
	}
}

function moveBall() {
	ballX += ballSpeedX;
	ballY -= ballSpeedY;
	detectEdgesColision();
	detectPaddleColision();
	detectBrickCollision();
}

function movePaddle() {
	if (paddleX > 0 && pressedLeft) {
		paddleX -= PADDLE_SPEED;
	}
	if (pressedRight && paddleX + paddleWidth < canvas.width) {
		paddleX += PADDLE_SPEED;
	}
}

function detectEdgesColision() {
	if (ballX + ballDim >= canvas.width || ballX < 0) {
		ballSpeedX = -ballSpeedX;
	}
	if (ballY <= 0) {
		ballSpeedY = -ballSpeedY;
	}
	if (ballY + ballDim >= canvas.height) {
		gameOver();
	}
}

function detectPaddleColision() {
	if (
		ballX + ballDim >= paddleX &&
		ballX <= paddleX + paddleWidth &&
		ballY + ballDim === paddleY
	) {
		ballSpeedY = -ballSpeedY;
	}
}

function detectBrickCollision() {
	for (brick of bricks) {
		let brickX = brick[0];
		let brickY = brick[1];
		if (brick[3] == true) {
			if (
				ballX + ballDim >= brickX &&
				ballX <= brickX + brickWidth &&
				ballY <= brickY + brickHeigth &&
				ballY + ballDim >= brickY
			) {
				ballSpeedY = -ballSpeedY;
				brick[3] = false;
				currScore++;
			}
		}
	}
}

function gameOver() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "bold 40px Verdana";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "yellow";
	ctx.shadowBlur = 0;
	ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
	saveBestScore();
}

function wonGame() {
	if (currScore == BRICKS_TOTAL) {
		ctx.font = "bold 40px Verdana";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "yellow";
		ctx.shadowBlur = 0;
		ctx.fillText("CONGRATS, YOU WON!", canvas.width / 2, canvas.height / 2);
		saveBestScore();
		return true;
	} else {
		return false;
	}
}

function displayCurrScore() {
	ctx.font = "16px Verdana";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "yellow";
	ctx.textAlign = "left";
	ctx.shadowBlur = 0;
	ctx.fillText("Trenutni broj bodova: " + currScore, 20, 20);
}

function saveBestScore() {
	if (currScore > localStorage.getItem("highScore")) {
		localStorage.setItem("highScore", currScore);
	}
}

function displayBestScore() {
	const highScore = localStorage.getItem("highScore");
	ctx.font = "16px Verdana";
	ctx.textBaseline = "middle";
	ctx.textAlign = "right";
	ctx.fillStyle = "yellow";
	ctx.shadowBlur = 0;
	ctx.fillText(
		"Maksimalni broj bodova: " + highScore,
		canvas.width - 100,
		20
	);
}

function drawStartScreen() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "bold 36px Verdana";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "white";
	ctx.fillText("BREAKOUT", canvas.width / 2, canvas.height / 2);
	ctx.font = "bold italic 18px Verdana";
	ctx.fillText(
		"Press SPACE to begin",
		canvas.width / 2,
		canvas.height / 2 + 36 / 2 + 10
	);
}

function startGame(e) {
	let key = e.key.toLowerCase();
	switch (key) {
		case " ":
			pressedSpace = true;
	}
}

function keyIsDown(e) {
	let key = e.key.toLowerCase();
	switch (key) {
		case "a":
			pressedLeft = true;
			break;
		case "d":
			pressedRight = true;
			break;
	}
}

function keyIsUp(e) {
	let key = e.key.toLowerCase();
	switch (key) {
		case "a":
			pressedLeft = false;
			break;
		case "d":
			pressedRight = false;
			break;
	}
}

function refreshPage() {
	drawStartScreen();
	if (pressedSpace) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		moveBall();
		movePaddle();
		drawBall();
		drawPaddle();
		drawBricks();
		displayCurrScore();
		displayBestScore();
	}
	if (wonGame()) {
		displayCurrScore();
		displayBestScore();
		return;
	}
	requestAnimationFrame(refreshPage);
}

refreshPage();
document.addEventListener("keydown", keyIsDown);
document.addEventListener("keydown", startGame);
document.addEventListener("keyup", keyIsUp);
