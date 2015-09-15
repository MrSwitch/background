// TiledOfLife, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
import Canvas from './classes/canvas';
import Collection from './classes/collection';
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

	frame(canvas) {

		var [i, j] = this.grid;

		var opacity = this.i;

		if (this.dx || this.dy) {
			this.dy *= 0.9;
			this.dx *= 0.9;
			if (Math.abs(this.dx) < 0.1) {
				this.dx = 0;
			}
			if (Math.abs(this.dy) < 0.1) {
				this.dy = 0;
			}
		}

		if (pointer) {

			var [mx, my] = [pointer.offsetX, pointer.offsetY];
			var dx = mx - this.x;
			var dy = my - this.y;

			if (Math.abs(dx) < radius &&
				Math.abs(dy) < radius &&
				(Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(radius, 2))) {


				dx = 0.3 * (Math.abs(dx) / dx) * -(radius - Math.abs(dx));
				dy = 0.3 * (Math.abs(dy) / dy) * -(radius - Math.abs(dy));

				// sometimes we get a NaN, catch and set those
				if (!dx) {
					dx = 0;
				}
				if (!dy) {
					dy = 0;
				}

				this.dx += (dx - this.dx) * 0.5;
				this.dy += (dy - this.dy) * 0.5;


				// If this is on the left, highlight
				// else, gray out if on the left
				if (mx > this.x) {
					opacity = (opacity / 2) + (this.n / 2);
				}
				if (mx < this.x) {
					opacity = opacity / 2;
				}
			}
		}

		this.fillStyle = `rgba(0, 0, 0, ${opacity? opacity / this.n : 0})`;

		if (this.i <= 0) {
			this.ascending = true;
		}
		else if (this.i >= this.n) {
			this.ascending = false;
		}

		this.i += this.ascending ? 1 : -1;
	}
}


let canvas = new Canvas();
let collection = new Collection(canvas.target);

canvas.addEventListener('mousemove', action);
canvas.addEventListener('touchmove', action);
canvas.addEventListener('resize', setup);

canvas.addEventListener('frame', () => {

	// Clear canvas
	canvas.ctx.clearRect(0, 0, canvas.width, canvas.height)

	// Draw items
	collection.draw();
});




// Canvas
var radius = 80;
var pointer;

// draw variant background

var tiles = [];

setup();

function setup() {

	var h, w;
	w = h = 40;

	var nx = Math.floor(canvas.width/w);
	var ny = Math.floor(canvas.height/h);

	w += Math.floor((canvas.width%(nx*w))/nx);
	h += Math.floor((canvas.height%(ny*h))/ny);

	for (var i = 0; i < nx; i++) {
		for (var j = 0; j < ny; j++) {

			var tile = tiles[((i*ny)+j)];

			// %100

			if(!tile){
				tile = new Tile((i*w) +1, (j*h) +1, w-1, h-1);
				collection.push(tile);
				tiles.push(tile);
			}
			else {
				tile.position((i*w) +1, (j*h) +1, w-1, h-1);
			}
			tile.grid = [i, j];
		}
	}
}

var timer;
function action(e) {
	pointer = e;

	if (timer) {
		clearTimeout(timer);
	}
	timer = setTimeout(() => {
		pointer = null;
	}, 1e2);
}
