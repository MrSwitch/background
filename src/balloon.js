// TiledOfLife, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
import Canvas from './classes/canvas';
import Collection from './classes/collection';

const MATH_PI2 = 2 * Math.PI;

const sprites = [];

// Create a new tile
class Balloon {

	constructor(cx, cy, r) {

		this.cx = cx;
		this.cy = cy;
		this.r = r;

		this.ascending = true;
		this.fillStyle = 'black';

		this.calc();
	}

	calc() {
		let r = this.r;
		this.x = this.cx - r;
		this.y = this.cy - r;
		this.w = r * 2;
		this.h = r * 2;
	}

	draw(ctx) {

		if (this.r <= 0) {
			this.r = 0;
			return;
		}

		// Does this exist as a sprite?
		var key = this.fillStyle + this.r;
		if (!(key in sprites)) {
			var _canvas = document.createElement('canvas');
			_canvas.width = Math.ceil(this.w) + 2;
			_canvas.height = Math.ceil(this.h) + 2;
			var _ctx = _canvas.getContext('2d');
			_ctx.fillStyle = this.fillStyle;
			_ctx.beginPath();
			_ctx.arc(this.r + 1, this.r + 1, this.r, 0, MATH_PI2, false);
			_ctx.fill();

			sprites[key] = _canvas;
		}

		ctx.drawImage(sprites[key], this.x - 1, this.y - 1);
	}

	frame() {

		// Is this expanding or shrinking?
		if (this.r <= 0) {
			this.ascending = true;
		}
		else if (this.r >= max_radius) {
			this.ascending = false;
		}

		this.r += (this.ascending ? 1 : -1) * (max_radius / 200);
		this.calc();
		this.dirty = true;
	}
}

let canvas = new Canvas();
let collection = new Collection(canvas.target);
canvas.addEventListener('resize', setup);
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

			if (!balloon) {
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
				balloon.ascending = true;
			}
		}
	}

	// Crop the collection array to nx * ny
	collection.length = (nx * ny);
}
