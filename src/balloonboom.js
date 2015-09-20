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

		this.fillStyle = "black";
	}

	frame(canvas) {

		// Is this expanding or shrinking?
		if (this.r >= max_radius) {
			// reset the radius
			this.r = 0;

			// Swap the color
			this.fillStyle = toggle(this.fillStyle, "white", "black");
		}

		this.r += (max_radius/200);
	}
}

function toggle(value, ...args) {
	var index = args.indexOf(value);
	var next = args[index + 1];
	if (next === undefined) {
		next = args[0];
	}
	return next;
}


let canvas = new Canvas();
let collection = new Collection(canvas.target);
canvas.addEventListener('resize', setup);
canvas.addEventListener('frame', () => {

	// // Clear canvas
	// canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw items
	collection.draw();
});

// draw variant background

var balloons = [];
var max_radius;

setup();

function setup() {

	// There are 100 balloons
	var n = 100;

	// To fill the rectangular screen area
	var W = canvas.width;
	var H = canvas.height;
	var A = H * W;

	// Each would have to fill an area about.
	var a = A / n;

	// And since they must fill a square we can sqrt to find width and height of the balloons
	var w = Math.sqrt(a);
	var h = w;

	// Find the number that would be needed to fill the axis
	var nx = Math.floor(W / w) || 1;
	var ny = Math.floor(H / h) || 1;

	// Adjust the width and height to uniformly spread them out
	w = W / nx;
	h = H / ny;

	// Capture max-radius
	var r = Math.max(w, h) / 2;
	max_radius = r * 1.5;

	for (var i = 0; i < nx; i++) {
		r = (((i + 1) / nx) * w) / 2;
		for (var j = 0; j < ny; j++) {

			var cx = parseInt((i * w) + (w / 2), 10);
			var cy = parseInt((j * h) + (h / 2), 10);

			var balloon = balloons[((i * ny) + j)];

			// %100

			if(!balloon){
				balloon = new Balloon(cx, cy, r);
				collection.push(balloon);
				balloons.push(balloon);
			}
			else {
				// Insert into a collection
				collection.push(balloon);

				// Update its position
				balloon.cx = cx;
				balloon.cy = cy;
				balloon.r = r;
				balloon.fillStyle = null;
			}
		}
	}

	// Crop the collection array to nx * ny
	collection.length = (nx * ny);
}
