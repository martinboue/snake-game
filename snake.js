// Canvas
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

// Grid
const cellSize = 16;
const cellsCount = canvas.width / cellSize;

// Score
let score;
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');

// Pause
const pauseElement = document.getElementById('pause');

// High score
const HIGH_SCORE_KEY = "high-score";
const highScoreElement = document.getElementById('high-score');
let highScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || 0);

// Obstacles
const obstaclesCount = 5;
let obstacles = [];

// Snake
let snake = [];
let direction = "RIGHT";
let nextDirection = direction;

// Apple
const apple = { x: 0, y: 0 };

let game;
let isOver;
let paused = false;
const frameTimeout = 100;

function generateObstacles() {
	obstacles = [];
	for (let i = 0; i < obstaclesCount; i++) {
		obstacles.push({
			x: getRandomInt(0, cellsCount) * cellSize,
			y: getRandomInt(0, cellsCount) * cellSize
		});
	}
}

function checkCollision(head, array) {
	for (let element of array) {
		if (head.x === element.x && head.y === element.y) {
			return true;
		}
	}
	return false;
}

function gameLoop() {
	draw();

	// Move the snake head
	let snakeX = snake[0].x;
	let snakeY = snake[0].y;

	if (direction !== nextDirection) {
		direction = nextDirection;
	}
	if (direction === "RIGHT") snakeX += cellSize;
	if (direction === "LEFT") snakeX -= cellSize;
	if (direction === "UP") snakeY -= cellSize;
	if (direction === "DOWN") snakeY += cellSize;

	// Wrap the snake's position on the edge of the screen
	if (snakeX < 0) snakeX = canvas.width - cellSize;
	else if (snakeX >= canvas.width) snakeX = 0;
	if (snakeY < 0) snakeY = canvas.height - cellSize;
	else if (snakeY >= canvas.height) snakeY = 0;

	// Snake ate apple
	if (snakeX === apple.x && snakeY === apple.y) {
		eatApple();
	} else {
		// Remove snake tail
		snake.pop();
	}

	const newHead = { x: snakeX, y: snakeY };

	// Checks collisions
	if (
		checkCollision(newHead, snake) ||
		checkCollision(newHead, obstacles)
	) {
		gameOver();
	}

	// Add new head at the beginning of the snake
	snake.unshift(newHead);
}

function draw() {
	// Clear background
	context.fillStyle = "#090D18";
	context.fillRect(0, 0, canvas.width, canvas.height);

	// Draw snake head
	context.fillStyle = '#6FDB49';
	context.fillRect(snake[0].x, snake[0].y, cellSize, cellSize);

	// Draw the snake body
	context.fillStyle = '#4BAB53';
	for (let i = 1; i < snake.length; i++) {
		context.fillRect(snake[i].x, snake[i].y, cellSize, cellSize);
	}

	// Draw the apple
	context.fillStyle = '#EB3534';
	context.fillRect(apple.x, apple.y, cellSize, cellSize);

	// Draw obstacles
	context.fillStyle = '#F0F3F9';
	obstacles.forEach(obs => {
		context.fillRect(obs.x, obs.y, cellSize, cellSize);
	});
}

function eatApple() {
	score++;
	updateScore();
	createApple();
}

function updateScore() {
	scoreElement.innerText = "SCORE: " + score;
}

function updateHighScore() {
	localStorage.setItem(HIGH_SCORE_KEY, highScore);
	highScoreElement.innerText = "HIGH SCORE: " + highScore;
}

function gameOver() {
	isOver = true;
	clearInterval(game);
	gameOverElement.style.display = 'block';

	if (score > highScore) {
		highScore = score;
		updateHighScore();
	}
}

/** Get random whole number in specific range */
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function createApple() {
	// Spawn new apple
	apple.x = getRandomInt(0, cellsCount) * cellSize;
	apple.y = getRandomInt(0, cellsCount) * cellSize;

	// Make sure the apple is not colliding with any obstacle
	if (checkCollision(apple, obstacles)) {
		createApple();
	}
}

// Listen to keydown events
document.addEventListener('keydown', function(e) {
	// Prevent the snake from backtracking on itself by checking that it's
	// not already moving on the same axis (pressing left while moving
	// left won't do anything, and pressing right while moving left
	// shouldn't let you collide with your own body)

	// Left arrow key
	if (e.code === "ArrowLeft" && direction !== "RIGHT") {
		nextDirection = "LEFT";
	}
	// Up arrow key
	else if (e.code === "ArrowUp" &&	direction !== "DOWN") {
		nextDirection = "UP";
	}
	// Right arrow key
	else if (e.code === "ArrowRight" && direction !== "LEFT") {
		nextDirection = "RIGHT";
	}
	// Down arrow key
	else if (e.code === "ArrowDown" && direction !== "UP") {
		nextDirection = "DOWN";
	}

	// Game restart
	if ((e.code === "Enter" || e.code === "Space") && isOver) {
		start();
	}

	// Game pause and resume
	else if (e.code === "Space") {
		if (paused) {
			pauseElement.style.display = 'none';
			game = setInterval(gameLoop, frameTimeout);
		} else {
			pauseElement.style.display = 'block';
			clearInterval(game);
		}
		paused = !paused;
	}
});

function start() {
	game = setInterval(gameLoop, frameTimeout);
	score = 0;
	isOver = false;
	gameOverElement.style.display = 'none';
	paused = false;

	// Create snake
	snake = [{x: 10 * cellSize, y: 10 * cellSize}];
	direction = "RIGHT";
	nextDirection = direction;

	updateScore();
	updateHighScore();
	generateObstacles();
	createApple();
}

start();
