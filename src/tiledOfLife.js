// TiledOfLife, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
import Canvas from './classes/canvas';
import Rect from './classes/rect';


// Create a new tile
class Tile extends Rect{
	
	constructor(...args) {
		super(...args);

		this.n = 100;
		this.i = Math.round(Math.random()*this.n);
		this.ascending = !Math.round(Math.random());
		this.dx = 0;
		this.dy = 0;
		this.grid = [];
	}
	
	translate(dx,dy) {
		// sometimes we get a NaN, catch and set those
		if(!dx) {
			dx = 0;
		}
		if(!dy) {
			dy = 0;
		}
		this.dx += (dx-this.dx)*0.5;
		this.dy += (dy-this.dy)*0.5;
	};

	opacity() {
		return this.i ? this.i/this.n : 0;
	};

	getNew() {

		if (this.i <= 0) {
			this.ascending = true;
		}
		else if (this.i >= this.n) {
			this.ascending = false;
		}
		this.i += this.ascending ? 1 : -1;
	}

	frame(canvas) {

		this.dirty = true;

		var i = this.grid[0],
			j = this.grid[1];

		if(this.dx||this.dy){
			this.dy *= 0.9;
			this.dx *= 0.9;
			if(Math.abs(this.dx)<0.1){
				this.dx = 0;
			}
			if(Math.abs(this.dy)<0.1){
				this.dy = 0;
			}
		}

		if( mouse &&
			Math.abs(mouse.clientX-(i*w)) < radius &&
			Math.abs(mouse.clientY-(j*h)) < radius &&
			(Math.pow(mouse.clientX-(i*w),2)+Math.pow(mouse.clientY-(j*h),2) < Math.pow(radius,2) ) ){

			var dx = mouse.clientX-(i*w);
			var dy = mouse.clientY-(j*h);

			this.translate(0.3 * (Math.abs(dx)/dx) * -( radius - Math.abs(dx) ),
							0.3 * (Math.abs(dy)/dy) * -( radius - Math.abs(dy) ) );
		}

		this.fillStyle="rgba(0,0,0,"+this.opacity()+")";

		this.getNew();
	}
}


let canvas = new Canvas();
canvas.addEventListener('mousemove', (e) => mouse = e);
canvas.addEventListener('touchmove', (e) => mouse = e);


// Canvas
canvas.frame = function() {
	canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
};

var radius = 80;
var mouse;

// draw variant background
var h,w;
w = h = 40;

var tiles = [];
canvas.onresize = function(){


	var nx = Math.floor(canvas.width/w);
	var ny = Math.floor(canvas.height/h);

	w += Math.floor((canvas.width%(nx*w))/nx);
	h += Math.floor((canvas.height%(ny*h))/ny);

	for (var i = 0; i < nx; i++) {
		for (var j = 0; j < ny; j++) {

			var tile = tiles[((i*nx)+j)];

			// %100

			if(!tile){
				tile = new Tile((i*w) +1, (j*h) +1, w-1, h-1);
				canvas.push(tile);
				tiles.push(tile);
			}
			else {
				tile.position((i*w) +1, (j*h) +1, w-1, h-1);
			}
			tile.grid = [i,j];
		}
	}
};

canvas.onresize();