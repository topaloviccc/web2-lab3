const canvas = document.getElementById("mycanvas");
const ctx = canvas.getContext("2d");

// parametri za palicu
const paddleHeight = 15;
const paddleWidth = 270;
const PADDLE_SPEED = 10;
var paddleX = canvas.width / 2 - paddleWidth / 2;
var paddleY = canvas.height - 30;

// parametri za cigle
const BRICKS_TOTAL = 50;
const BRICKS_IN_ROW = 10;
const START_BALL_SPEED = 3;
const brickWidth = 60;
const brickHeigth = 20;
var bricks = [];

// parametri za lopticu
const ballDim = 20;
var ballSpeedX = START_BALL_SPEED;
var ballSpeedY = START_BALL_SPEED;
var ballX = paddleX + paddleWidth / 2;
var ballY = paddleY - ballDim;

// određuje početni smjer loptice
if (Math.random() < 0.5) {
	ballSpeedX *= -1;
}

// stanja za tipke na tipkovnici
var pressedSpace = false;
var pressedLeft = false;
var pressedRight = false;

// početni rezultati (trenutni i najbolji)
var currScore = 0;
if (localStorage.getItem("highScore") === null) {
	localStorage.setItem("highScore", 0);
}

// funkcije crtanja za palicu, lopticu i cigle
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

// cigle se stvaraju po redovima i svaka cigla se sprema u listu bricks kao [x, y, isVisible, color]
function createBricks() {
	const rows = BRICKS_TOTAL / BRICKS_IN_ROW;
	const fillColors = [
		"rgb(153, 51, 0)",
		"rgb(255, 0, 0)",
		"rgb(255, 153, 204)",
		"rgb(0, 255, 0)",
		"rgb( 255, 255, 153)",
	]; // lista boja po retcima
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

// iscrtavaju se samo one cigle za koje vrijedi da je parametar isVisible == true
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

// pomicanje loptice uz detekciju kolizija
function moveBall() {
	ballX += ballSpeedX;
	ballY -= ballSpeedY;
	detectEdgesColision();
	detectPaddleColision();
	detectBrickCollision();
}

// pomicanje palice
function movePaddle() {
	// pomicanje palice lijevo do ruba okvira
	if (paddleX > 0 && pressedLeft) {
		paddleX -= PADDLE_SPEED;
	}
	// pomicanje palice desno do ruba okvira
	if (pressedRight && paddleX + paddleWidth < canvas.width) {
		paddleX += PADDLE_SPEED;
	}
}

// kolizija s rubovima okvira
function detectEdgesColision() {
	// kolizija s desnim ili lijevim rubom
	if (ballX + ballDim >= canvas.width || ballX < 0) {
		ballSpeedX = -ballSpeedX;
	}
	// kolizija s gornjim rubom
	if (ballY <= 0) {
		ballSpeedY = -ballSpeedY;
	}
	// ako loptica padne ispod donjeg ruba, igra završava i ispisuje se game over - to se provjerava u gameOver() funkciji
}

// kolizija s palicom (x koordinate loptice moraju biti unutar x koordinata palice a donji rub loptice mora se poklapati s gornjim rubom palice)
function detectPaddleColision() {
	if (
		ballX + ballDim >= paddleX &&
		ballX <= paddleX + paddleWidth &&
		ballY + ballDim === paddleY
	) {
		ballSpeedY = -ballSpeedY;
	}
}

// kolizija s ciglama
function detectBrickCollision() {
	// provjera kolizije za svaku vidljivu ciglu iz liste bricks[]
	for (brick of bricks) {
		let brickX = brick[0];
		let brickY = brick[1];
		if (brick[3] == true) {
			// ako je pogođena cigla, rezultat se povećava i mijenja se brzina i smjer loptice te cigla postaje nevidljiva
			if (
				ballX + ballDim >= brickX &&
				ballX <= brickX + brickWidth &&
				ballY <= brickY + brickHeigth &&
				ballY + ballDim >= brickY
			) {
				ballSpeedY = -ballSpeedY;
				ballSpeedX += (Math.random() - 0.4) * 0.5;
				brick[3] = false;
				currScore++;
			}
		}
	}
}

// funkcije za završetak igre, spremaju najbolji rezultat
function gameOver() {
	// prikazuje poruku kad je igra izgubljena, ako loptica padne ispod donjeg ruba, igra završava i ispisuje se game over
	if (ballY + ballDim >= canvas.height) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.font = "bold 40px Verdana";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "yellow";
		ctx.shadowBlur = 0;
		ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
		saveBestScore();
		return true;
	} else {
		return false;
	}
}

function wonGame() {
	// prikazuje poruku kada je igra pobijeđena i sve su cigle uništene
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

// prikaz trenutnog rezultata
function displayCurrScore() {
	ctx.font = "16px Verdana";
	ctx.textBaseline = "top";
	ctx.fillStyle = "yellow";
	ctx.textAlign = "left";
	ctx.shadowBlur = 0;
	ctx.fillText("Trenutni broj bodova: " + currScore, 20, 20);
}

// sprema rezultat trenutne igre ako je bolji od svih prethodnih rezultata
function saveBestScore() {
	if (currScore > localStorage.getItem("highScore")) {
		localStorage.setItem("highScore", currScore);
	}
}

// prikaz najboljeg rezultata iz localStoragea
function displayBestScore() {
	ctx.clearRect(canvas.width - 150, 0, 150, 40);
	const highScore = localStorage.getItem("highScore");
	ctx.font = "16px Verdana";
	ctx.textBaseline = "top";
	ctx.textAlign = "right";
	ctx.fillStyle = "yellow";
	ctx.shadowBlur = 0;
	ctx.fillText(
		"Maksimalni broj bodova: " + highScore,
		canvas.width - 100,
		20
	);
}

// početni ekran
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

// funkcije za detekciju tipki na tipkovnici - space započinje igru, A i D pomiču palicu
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

// glavna funkcija
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
	} else if (gameOver()) {
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
