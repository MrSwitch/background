// mineField, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
import Canvas from './classes/canvas.js';
import type {CanvasEvent} from './classes/canvas.js';
import Collection from './classes/collection.js';
import Shape from './classes/shape.js';
import Text from './classes/text.js';

// Create a new scribble
// Arguments handled by parent
class Brush extends Shape {

	// A collection of x, y points
	points: Array<[number, number]> = [];

	constructor(x: number, y: number) {

		super(x, y);

		this.push(x, y);
	}

	// Add
	// Add a new point to the brushes path
	push(x: number, y: number) {

		this.dirty = true;
		this.points.push([x, y]);

		// width
		if (x < this.x) {
			this.w = this.w + (this.x - x);
			this.x = x;
		}
		else if (x > (this.x + this.w)) {
			this.w = x - this.x;
		}
		// height
		if (y < this.y) {
			this.h = this.h + (this.y - y);
			this.y = y;
		}
		else if (y > (this.y + this.h)) {
			this.h = y - this.y;
		}
	}

	// Draw the line
	draw(ctx: CanvasRenderingContext2D) {
		// Loop through all the points and draw the line
		ctx.beginPath();
		const point = this.points[0];
		ctx.moveTo(point[0], point[1]);
		this.points.forEach(point => ctx.lineTo(point[0], point[1]));
		ctx.stroke();
	}
}

let brush: Brush | null = null;

const canvas = new Canvas();

const collection = new Collection(canvas.target);

const text = new Text();
text.text = 'Drawing Pad';
text.align = 'center center';
text.fontSize = 150;
text.fillStyle = 'rgba(0,0,0,0.03)';
text.strokeStyle = 'rgba(255,255,255,0.03)';
text.calc(canvas);

canvas.addEventListener('frame', () => {
	hideText();

	// Draw
	collection.prepare();

	// Draw
	collection.draw();
});

function hideText() {

	// Has the user started?
	if (brush) {
		if (text.opacity > 0.1) {
			text.opacity *= 0.9;
		}
		else {
			text.opacity = 0;
		}
	}
}

collection.push(text);


function pointStart(e: CanvasEvent) {

	brush = new Brush(e.offsetX, e.offsetY);
	collection.push(brush);

}

function pointEnd() {
	brush = null;
}

canvas.addEventListener('touchstart', pointStart);
canvas.addEventListener('touchend', pointEnd);
canvas.addEventListener('touchmove', move);

canvas.addEventListener('mousedown', pointStart);
canvas.addEventListener('mouseup', pointEnd);
canvas.addEventListener('mousemove', move);

canvas.addEventListener('resize', () => canvas.clear());

// Move
// Depending on the event
function move(e: CanvasEvent) {
	// is mousedown?
	if (brush) {
		brush.push(e.offsetX, e.offsetY);
	}
}
