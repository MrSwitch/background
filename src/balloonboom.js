// TiledOfLife, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
import Canvas from './classes/canvas.js';
import Collection from './classes/collection.js';

const MATH_PI2 = 2 * Math.PI;

const sprites = [];

// Create a new tile
class Balloon {

	constructor(cx, cy, r) {

		this.cx = cx;
		this.cy = cy;
		this.r = r;

		this.fillStyle = 'black';

		this.calc();
	}

	calc() {
		const r = this.r;
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
		const key = this.fillStyle + this.r;
		if (!(key in sprites)) {
			const _canvas = document.createElement('canvas');
			_canvas.width = Math.ceil(this.w) + 2;
			_canvas.height = Math.ceil(this.h) + 2;
			const _ctx = _canvas.getContext('2d');
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
		if (this.r >= max_radius) {
			// reset the radius
			this.r = 0;

			// Swap the color
			this.fillStyle = toggle(this.fillStyle, 'white', 'black');
		}

		this.r += (max_radius / 200);
		this.calc();
		this.dirty = true;
	}
}


function toggle(value, ...args) {
	const index = args.indexOf(value);
	let next = args[index + 1];
	if (next === undefined) {
		next = args[0];
	}
	return next;
}


const canvas = new Canvas();
const collection = new Collection(canvas.target);
canvas.addEventListener('resize', setup);
canvas.addEventListener('frame', () => {

	// // Clear canvas
	// canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw items
	collection.draw();
});

// draw variant background

const balloons = [];
let max_radius;

setup();

function setup() {

	// There are 100 balloons
	const n = 1000;

	// To fill the rectangular screen area
	const W = canvas.width;
	const H = canvas.height;
	const A = H * W;

	// Each would have to fill an area about.
	const a = A / n;

	// And since they must fill a square we can sqrt to find width and height of the balloons
	let w = Math.sqrt(a);
	let h = w;

	// Find the number that would be needed to fill the axis
	const nx = Math.floor(W / w) || 1;
	const ny = Math.floor(H / h) || 1;

	// Adjust the width and height to uniformly spread them out
	w = W / nx;
	h = H / ny;

	// Capture max-radius
	let r = Math.max(w, h) / 2;
	max_radius = r * 1.5;

	for (let i = 0; i < nx; i++) {
		r = (((i + 1) / nx) * w) / 2;
		for (let j = 0; j < ny; j++) {

			const cx = parseInt((i * w) + (w / 2), 10);
			const cy = parseInt((j * h) + (h / 2), 10);

			let balloon = balloons[((i * ny) + j)];

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
				balloon.fillStyle = null;
			}
		}
	}

	// Crop the collection array to nx * ny
	collection.length = (nx * ny);
}
