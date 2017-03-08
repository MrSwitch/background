// TiledOfLife, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
import Canvas from './classes/canvas';
import Collection from './classes/collection';
import easeInOut from 'tricks/animation/timing.easeInOutCubic.js';

const MATH_PI2 = 2 * Math.PI;
const MAX = 500;
// Create a new tile
class Ripple {

	constructor(cx, cy, r) {

		this.cx = cx;
		this.cy = cy;
		this.r = r;

		this.fillStyle = 'black';

		// T is the proportion of life
		this.t = 1;

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
		const opacity = this.t;
		ctx.fillStyle = `rgba(0,0,0,${opacity / 10})`;
		ctx.beginPath();
		ctx.arc(this.cx, this.cy, this.r, 0, MATH_PI2, false);
		ctx.fill();
	}

	frame() {

		this.t -= 0.01;

		if (this.t <= 0) {
			this.t = 0;
			this.visible = false;
		}
		else {
			this.visible = true;
			this.r = easeInOut(1 - this.t) * MAX;
			this.calc();
			this.dirty = true;
		}
	}
}

const canvas = new Canvas();
const collection = new Collection(canvas.target);
canvas.addEventListener('frame', () => {

	// Clear canvas
	canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw items
	collection.draw();
});

canvas.addEventListener('click', e => {
	const ripple = new Ripple(e.offsetX, e.offsetY, 1);
	collection.push(ripple);
});
