/*
	Made by Kyle Spurlock
*/

var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");
ctx.font = "30px Arial";
document.addEventListener("keydown", keyDown, false);
document.addEventListener("keyup", keyUp, false);

//constants
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const GROUND_Y = HEIGHT - 100;

const PLAYER_SIZE_X = 50;
const PLAYER_SIZE_Y = 100;
const PLAYER_START_X = 150;
const PLAYER_START_Y = GROUND_Y - PLAYER_SIZE_Y;
const PLAYER_VEL_DECAY_X = 1;
const PLAYER_VEL_DECAY_Y = 1;
const PLAYER_JUMP_VEL = 20;
const PLAYER_JUMP_COOLDOWN = 100;

const ENEMY_SIZE_X = 25;
const ENEMY_SIZE_Y = 50;
const ENEMY_START_X = WIDTH;
const ENEMY_START_Y = GROUND_Y - ENEMY_SIZE_Y;
const ENEMY_SPEED_X = -5;
const ENEMY_DAMAGE = 10;
const ENEMY_POINTS = 1;

//classes
class Player {
	constructor() {
		this.sizeX = PLAYER_SIZE_X;
		this.sizeY = PLAYER_SIZE_Y;
		this.locX = PLAYER_START_X;
		this.locY = PLAYER_START_Y;
		this.velX = 0;
		this.velY = 0;
		
		this.health = 100;
		this.points = 0;
	}
}

class Enemy {
	constructor() {
		this.sizeX = ENEMY_SIZE_X;
		this.sizeY = ENEMY_SIZE_Y;
		this.locX = ENEMY_START_X;
		this.locY = ENEMY_START_Y;
		this.velX = ENEMY_SPEED_X;
		this.velY = 0;
		
		this.hurtPlayer = false;
		this.damage = ENEMY_DAMAGE;
		this.points = ENEMY_POINTS;
	}
}

//variables
var leftPressed = false;
var upPressed = false;
var rightPressed = false;
var startJumpTime = (new Date()).getTime();

var player = new Player();
var enemy = new Enemy();

//run game loop
var intervalID = setInterval(game, 10);

//functions
function game() {
	//update
	playerUpdate();
	enemyUpdate();
	
	//check for collision
	checkCollision();
	
	//draw to canvas
	draw();
}

function draw() {
	//clear screen
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	
	//ground
	ctx.fillStyle = "#00FF00";
	ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT);
	
	//player
	ctx.fillStyle = "#0000FF";
	ctx.fillRect(player.locX, player.locY, player.sizeX, player.sizeY);
	
	//enemy
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(enemy.locX, enemy.locY, enemy.sizeX, enemy.sizeY);
	
	//draw text
	ctx.fillStyle = "#000000";
	ctx.fillText("Player Health: " + player.health, WIDTH - 250, HEIGHT - 10);
	
	ctx.fillText("Points: " + player.points, WIDTH - 250, HEIGHT - 50);
	
	if (player.health <= 0) {
		ctx.fillStyle = "#FF0000";
		ctx.fillText("GAME OVER", 5, HEIGHT - 10);
		clearInterval(intervalID);
	}
}

function playerUpdate() {
	//movement velocity
	if (!(leftPressed && rightPressed)) {
		if (leftPressed) {
			player.velX -= 1.5;
		} else if (rightPressed) {
			player.velX += 1.5;
		}
	}
	
	if (upPressed) {
		player.velY -= PLAYER_JUMP_VEL;
		upPressed = false;
	}
	
	//movement location
	player.locX += player.velX;
	player.locY += player.velY;
	
	//don't fall through ground
	if (player.locY > GROUND_Y - PLAYER_SIZE_Y) {
		player.velY = 0;
		player.locY = GROUND_Y - PLAYER_SIZE_Y;
	}
	
	//movement speed decay
	if (player.velX != 0) {
		if (player.velX > 0) {
			//going right
			player.velX -= PLAYER_VEL_DECAY_X;
			if (player.velX < 0) {
				player.velX = 0;
			}
		} else {
			//going left
			player.velX += PLAYER_VEL_DECAY_X;
			if (player.velX > 0) {
				player.velX = 0;
			}
		}
	}
	
	player.velY += PLAYER_VEL_DECAY_Y;
}

function enemyUpdate() {
	enemy.locX += enemy.velX;
	enemy.locY += enemy.velY;
	
	if (enemy.locX < -enemy.sizeX) {
		enemy.locX = ENEMY_START_X;
		
		if (!enemy.hurtPlayer) {
			player.points += enemy.points;
		}
		
		enemy.hurtPlayer = false;
		
		enemy.velX -= 0.1;
		
		//enemy.sizeY += 1;
		//enemy.locY -= 1;
	}
}

function checkCollision() {
	var pRightSide = player.locX + player.sizeX;
	var pTopSide = player.locY;
	var pLeftSide = player.locX;
	var pBottomSide = player.locY + player.sizeY;
	
	var eRightSide = enemy.locX + enemy.sizeX;
	var eTopSide = enemy.locY;
	var eLeftSide = enemy.locX;
	var eBottomSide = enemy.locY + enemy.sizeY;
	
	if ((eLeftSide <= pRightSide && eLeftSide >= pLeftSide) || (eRightSide <= pRightSide && eRightSide >= pLeftSide)) {
		if (eTopSide <= pBottomSide && !enemy.hurtPlayer) {
			player.health -= enemy.damage;
			enemy.hurtPlayer = true;
		}
	}
}

function keyDown(evt) {
	if (evt.keyCode == 37 || evt.keyCode == 65) {
		//left arrow or a
		//leftPressed = true;
	} else if (evt.keyCode == 38 || evt.keyCode == 87 || evt.keyCode == 32) {
		//up arrow or w or spacebar
		if (player.locY == GROUND_Y - PLAYER_SIZE_Y && startJumpTime + PLAYER_JUMP_COOLDOWN <= (new Date()).getTime()) {
			upPressed = true;
			startJumpTime = (new Date()).getTime();
		}
	} else if (evt.keyCode == 39 || evt.keyCode == 68) {
		//right arrow or d
		//rightPressed = true;
	} else if (evt.keyCode == 40 || evt.keyCode == 83) {
		//down arrow or s
	}
}

function keyUp(evt) {
	if (evt.keyCode == 37 || evt.keyCode == 65) {
		//left arrow or a
		leftPressed = false;
	} else if (evt.keyCode == 38 || evt.keyCode == 87 || evt.keyCode == 32) {
		//up arrow or w
		upPressed = false;
	} else if (evt.keyCode == 39 || evt.keyCode == 68) {
		//right arrow or d
		rightPressed = false;
	} else if (evt.keyCode == 40 || evt.keyCode == 83) {
		//down arrow or s
	}
}