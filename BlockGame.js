//Paddle class
 class Paddle{
	constructor(game){
		this.gameWidth = game.gameWidth;
		this.gameHeight = game.gameHeight;
		this.width = 150;
		this.height = 20;
		
		this.maxSpeed = 7;
		this.speed = 0;
		//Paddle needs to be in centre of screen.
		this.position = {
			//x is width, gets drawn from top left (0) to top right (game height of 600 in this case).  Need to find half that to get dead centre.  The block itself is drawn from top left to top right, so need to find half the block width to shift paddle over.
			x: this.gameWidth / 2 - this.width / 2,
			y: this.gameHeight-this.height - 10,
		}
	}
	
	draw(ctx){
		//Drawing the size of the paddle
		ctx.fillStyle ='#0ff';
		ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
	}
	
	update(deltaTime){
		//Ensure we don't have a crash
		if(!deltaTime) return;
		this.position.x += this.speed;
		//Don't let paddle go over edge of screen
		if(this.position.x < 0) this.position.x = 0;
		if(this.position.x + this.width > this.gameWidth) this.position.x = this.gameWidth-this.width;
	}
	
	moveLeft()
	{
		this.speed = -this.maxSpeed;
	}
	moveRight()
	{
		this.speed = this.maxSpeed;
	}
	stop()
	{
		this.speed = 0;
	}
}

//Input class to handle input
class InputHandler{
	constructor(paddle,game){
		document.addEventListener("keydown", event => {
		switch(event.keyCode)
		{
			case 37: paddle.moveLeft();
			break;
			
			case 39:
			paddle.moveRight();
			break;
			
			case 27:
			game.togglePause();
			break; 
			case 32:
			game.start();
			break;
		}
		});
		//Stop movement
		document.addEventListener("keyup", event => {
		switch(event.keyCode)
		{
			case 37:
			if(paddle.speed < 0)
			paddle.stop();
			break;
			
			case 39:
			if(paddle.speed > 0)
			paddle.stop();
			break;
		}
		});
	}
}

//Crown class to control the crown
class Crown{
	constructor(game)
	{
		this.image = document.getElementById('img_crown');
		this.reset();
		this.size = 30;
		this.gameWidth = game.gameWidth;
		this.gameHeight = game.gameHeight;
		
		this.game = game;
	}
	draw(ctx)
	{
		//draw image with it's new position and size.  position is set in update.
		ctx.drawImage(this.image,this.position.x,this.position.y,this.size,this.size);
	}
	
	update(deltaTime)
	{
		//console.log(this.game.crown.position.x);
		this.position.x += this.speed.x;
		this.position.y += this.speed.y;
		
		//Check if hitting wall on left or right or top or bottom
		if(this.position.x + this.size > this.gameWidth || this.position.x < 0)
		{
			this.speed.x = -this.speed.x;
		}
		//Wall on top
		if(this.position.y < 0)
		{
			this.speed.y = -this.speed.y;
		}
		
		if(this.position.y + this.size > this.gameHeight)
		{
			this.game.lives--;
			this.reset();
		}
		
		if(detectCollision(this, this.game.paddle))
		{
			this.speed.y = -this.speed.y;
			this.position.y = this.game.paddle.position.y - this.size;
		}
	}
	
	reset()
	{
		this.position = {x:10, y:400};
		this.speed = {x: 4, y:-2};
	}
	
}

class Coin
{
	constructor(game, position)
	{
		this.image = document.getElementById('img_coin');
		this.position = position;
		this.width = 40;
		this.height = 40;
		
		this.gameWidth = game.gameWidth;
		this.gameHeight = game.gameHeight;
		this.markedForDeletion = false;
		this.game = game;
	}
	
	update(deltaTime){
		
		if(detectCollision(this.game.crown, this))
		{

			this.game.crown.speed.y = -this.game.crown.speed.y;
			
			this.markedForDeletion = true;
		}
	
	}
	
	draw(ctx)
	{
		ctx.drawImage(this.image,this.position.x,this.position.y,this.width,this.height)
	}
}

//Levels
const level1 = [
	[0,0,0,0,0,0,1,0,0],
	

]

const level2 = [
	[1,0,1,0,1,0,1,0,1],
	[1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1],

]

function buildLevel(game,level)
{
	let coins = [];
	level.forEach((row,rowIndex) => {
		row.forEach((coin,coinIndex) => {
			if(coin === 1)
			{
				
				let position = {
					x: ((game.gameWidth/row.length)*coinIndex)+24,
					y: 75+40*rowIndex
				};
				
				coins.push(new Coin(game,position));
			};
			
		
		
		
		
		
		});
		
		
	});
	return coins;
}
//Detect collision between crown and object.
function detectCollision(crown,gameObject)
{
	
	//check collision with the paddle.
		//Image is drawn from top left corner to bottom right corner.  Position therefor is based on top left, and is thus going to be 0,0 in the top most left corner.  Adding the size gets the lowest underpoint point.
		let bottomOfCrown = crown.position.y + crown.size;
		let topOfCrown = crown.position.y;
		//Top of object is drawn from top left to bottom right, therefor the y (height/up) position will give the top, we wouldn't need to adjust underneath.  
		let topOfObject = gameObject.position.y;
		//Get left side
		let leftSideOfObject = gameObject.position.x;
		//Get right side
		let rightSideOfObjet = gameObject.position.x + gameObject.width;
		
		let bottomOfObject = gameObject.position.y + gameObject.height;
		//Do not have the crown (moving object) larger than the object it is hitting.  Else it will not detect a hit 
		if(bottomOfCrown >= topOfObject && topOfCrown <= bottomOfObject && crown.position.x >= leftSideOfObject && crown.position.x + crown.size <= rightSideOfObjet)
		{
			return true;
		}
		else{
			return false
			}
			
		

}

//Game manager class
class Game{
	constructor(gameWidth,gameHeight)
	{
		this.gameWidth = gameWidth;
		this.gameHeight = gameHeight;
		
		this.gamestate = GAMESTATE.MENU;
		
		this.paddle = new Paddle(this);
		this.crown = new Crown(this);
		
		this.gameObjects = [];
		this.lives = 1;
		this.coins = [];
		this.levels = [level1,level2];
		this.currentlevel = 0;

		new InputHandler(this.paddle,this);
	
		
	
	}
	start()
	{
		console.log("gonna start");
		//Only start the game from the menu.
		if(this.gamestate === GAMESTATE.GAMEOVER)
		{
			console.log(this.gamestate);
			this.lives = 1;
			this.gamestate = GAMESTATE.MENU;
			return;
		}
		//Weird convoluted way of doing things, but works for making new levels start.
		if(this.gamestate !== GAMESTATE.MENU && this.gamestate !== GAMESTATE.NEWEVEL)
		{
			if(this.gamestate === GAMESTATE.NEWLEVEL)
			{
				
			}
			else
			{
				return;
			}
			
			
		}			
		
		
		console.log("starting game");
		
		console.log(this.gamestate);
		this.coins = buildLevel(this,this.levels[this.currentlevel]);
		this.crown.reset();
		
		
		//For all new objects, add to this array and it will auto update in the game class update and draw.
		this.gameObjects = [
			this.crown, this.paddle
		]
		
		this.gamestate = GAMESTATE.RUNNING;
	}
	
	update(deltaTime)
	{
		if(this.lives === 0) this.gamestate = GAMESTATE.GAMEOVER;
		if(this.gamestate === GAMESTATE.PAUSED || this.gamestate === GAMESTATE.MENU || this.gamestate.GAMEOVER) return;
		console.log(this.currentlevel);
		if(this.coins.length === 0)
		{
			
			this.currentlevel++;
			this.gamestate = GAMESTATE.NEWLEVEL;
			this.start();
		}
		
		[...this.gameObjects,...this.coins].forEach((object) => object.update(deltaTime));
		
		
		//!object used to lop through all objects in array to hunt for specified variable.
		//this.gameObjects = this.gameObjects.filter (object => !object.markedForDeletion);
		this.coins = this.coins.filter (Coin => !Coin.markedForDeletion);
	}
	
	draw(ctx)
	{
		
		[...this.gameObjects, ...this.coins].forEach((object) => object.draw(ctx));
		
		if(this.gamestate === GAMESTATE.PAUSED)
		{
		ctx.rect(0,0,this.gameWidth,this.gameHeight);
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.fill();
		
		ctx.font = "30px Arial";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.fillText("Paused", this.gameWidth/2,this.gameHeight/2);
		
		}
		
		if(this.gamestate === GAMESTATE.MENU)
		{
		ctx.rect(0,0,this.gameWidth,this.gameHeight);
		ctx.fillStyle = "rgba(0,0,0,1)";
		ctx.fill();
		
		ctx.font = "30px Arial";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.fillText("Press spacebar to start", this.gameWidth/2,this.gameHeight/2);
		
		}
		
		if(this.gamestate === GAMESTATE.GAMEOVER)
		{
		ctx.rect(0,0,this.gameWidth,this.gameHeight);
		ctx.fillStyle = "rgba(0,0,0,1)";
		ctx.fill();
		
		ctx.font = "30px Arial";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.fillText("GAME OVER", this.gameWidth/2,this.gameHeight/2);
		ctx.fillText("Press space to return to menu", this.gameWidth/2,this.gameHeight/2 + 60);
		
		}
	}
	
	togglePause()
	{
		if(this.gamestate == GAMESTATE.PAUSED)
		{
			this.gamestate = GAMESTATE.RUNNING;
		}
		else
		{
			//Only pause game if running
			if(this.gamestate == GAMESTATE.RUNNING)
			{
				this.gamestate = GAMESTATE.PAUSED;
			}
			
		}
	}
}

//Main game code

let canvas = document.getElementById("gameScreen");

let ctx = canvas.getContext('2d');
//Game height and width to easily change
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GAMESTATE = {
	PAUSED: 0,
	RUNNING: 1,
	MENU: 2,
	GAMEOVER: 3,
	NEWLEVEL: 4
	
	
}

// controller class Game to make functions easier
let game = new Game(GAME_WIDTH,GAME_HEIGHT)



ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);




let lastTime = 0;

//images


function gameLoop(timestamp){
//Runs every frame.  Calculate time that has passed
	let deltaTime = timestamp - lastTime;
	lastTime = timestamp;
//Clear screen to update with new data.
	ctx.clearRect(0,0, GAME_WIDTH, GAME_HEIGHT);
	
	
	game.update(deltaTime);
	game.draw(ctx);
	
	//Calls the game loop again with the next frames timestamp.  starts at 0, then goes up.
	requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
/* block creationg test
 ctx.fillStyle = '#f00';
ctx.fillRect(20,20, 100, 100);
ctx.fillStyle='#00f';
ctx.fillRect(370,200,50,50);
*/
