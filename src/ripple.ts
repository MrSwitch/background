// TiledOfLife, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
import Canvas from './classes/canvas.js';
import Collection from './classes/collection.js';
import easeInOut from 'tricks/animation/timing.easeInOutCubic';

const MATH_PI2 = 2 * Math.PI;
const MAX = 500;
// Create a new tile
class Ripple {

	cx: number;
	cy: number;
	r: number;
	fillStyle: string;
	t: number;
	x = 0;
	y = 0;
	w = 0;
	h = 0;
	visible = true;
	dirty: boolean | 'pending' = false;

	constructor(cx: number, cy: number, r: number) {

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

	draw(ctx: CanvasRenderingContext2D) {
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
