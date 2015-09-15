// TiledOfLife, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
import Canvas from './classes/canvas';
import Collection from './classes/collection';
import Circle from './classes/circle';


// Create a new tile
class Balloon extends Circle{

	constructor(...args) {

		super(...args);

		this.max_radius = max_radius;

		this.ascending = true;
	}

	frame(canvas) {

		if (this.r <= 0) {
			this.ascending = true;
		}
		else if (this.r >= this.max_radius) {
			this.ascending = false;
		}

		this.r += this.ascending ? 1 : -1;
	}
}


let canvas = new Canvas();
let collection = new Collection(canvas.target);
canvas.addEventListener('frame', () => {

	// Clear canvas
	canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw items
	collection.draw();
});

// draw variant background

var balloons = [];
var max_radius;

setup();

function setup() {

	var h, w;
	w = h = 100;

	var nx = Math.floor(canvas.width/w);
	var ny = Math.floor(canvas.height/h);

	w += Math.floor((canvas.width%(nx*w))/nx);
	h += Math.floor((canvas.height%(ny*h))/ny);

	max_radius = Math.max(w, h);

	for (var i = 0; i < nx; i++) {
		var r = ((i + 1) / nx) * w;
		for (var j = 0; j < ny; j++) {

			var cx = (i * w) + (w / 2);
			var cy = (j * h) + (h / 2);

			var balloon = balloons[((i*ny)+j)];

			// %100

			if(!balloon){
				balloon = new Balloon(cx, cy, r);
				collection.push(balloon);
				balloons.push(balloon);
			}
			else {
				balloon.position(cx, cy, r);
			}
		}
	}
}
