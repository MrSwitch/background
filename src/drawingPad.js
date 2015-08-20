// mineField, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
import Canvas from './classes/canvas';
import Shape from './classes/shape';
import Text from './classes/text';

// Create a new scribble
// Arguments handled by parent
class Brush extends Shape{

	constructor(...args) {

		super(...args);

		// A collection of x, y points
		this.points = [];

		this.push(...args);
	}

	// Add
	// Add a new point to the brushes path
	push(x, y) {

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
	draw(canvas) {
		// Loop through all the points and draw the line
		var ctx = canvas.ctx;
		ctx.beginPath();
		var point = this.points[0];
		ctx.moveTo(point[0], point[1]);
		this.points.forEach((point) => ctx.lineTo(point[0], point[1]));
		ctx.stroke();
	}
}

var canvas = new Canvas();

var	text = new Text();
text.text = "Drawing Pad";
text.align = "center center";
text.fontSize = 150;
text.fillStyle = 'rgba(0,0,0,0.03)';
text.strokeStyle = 'rgba(255,255,255,0.03)';
text.calc(canvas);
text.frame = function(canvas) {

	// Has the user started?
	if (brush) {
		if (this.opacity > 0.1) {
			this.opacity *= 0.9;
		}
		else {
			this.opacity = 0;
		}
	}
};

canvas.push(text);

var brush = null,
	mousedown = false;

function pointStart(e) {

	brush = new Brush(e.clientX, e.clientY);
	canvas.push(brush);
	mousedown = true;

}

function pointEnd() {
	brush = null;
	mousedown = false;
}

canvas.addEventListener('touchstart', pointStart);
canvas.addEventListener('touchend', pointEnd);
canvas.addEventListener('touchmove', (e) => move(e.clientX, e.clientY));

canvas.addEventListener('mousedown', pointStart);
canvas.addEventListener('mouseup', pointEnd);
canvas.addEventListener('mousemove', (e) => move(e.clientX, e.clientY));

canvas.addEventListener('resize', () => canvas.clean(true) );

// Move
// Depending on the event
function move(x, y) {
	// is mousedown?
	if (brush) {
		brush.push(x, y);
	}
}