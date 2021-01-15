export default class Paddle{
	constructor(gameWidth, gameHeight){
		this.width = 150;
		this.height = 30;
		//Paddle needs to be in centre of screen.
		this.position = {
			gameWidth / 2 - this.width / 2,
			gameHeight-this.height - 10,
		}
	}
	
	draw(ctx){
		//Drawing the size of the paddle
		ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
	}
	
	
	
}