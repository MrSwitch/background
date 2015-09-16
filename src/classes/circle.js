//
// Rectangle
//

import Shape from './shape';

export default class Circle extends Shape{

	constructor(cx, cy, r) {
		// Find the uppermost
		super(cx - r, cy - r, r, r);

		// Set property listeners
		['fillStyle'].forEach(this._watchProperty.bind(this));

		// Recalculate the x and y when dimensions canges
		['cx', 'cy', 'r'].forEach(watchCircleProperties.bind(this));

		this.cx = cx;
		this.cy = cy;
		this.r = r;

		this.type = 'circle';
	}

	draw(ctx) {

		if (this.r <= 0) {
			this.r = 0;
			return;
		}

		ctx.fillStyle = this.fillStyle;
		ctx.beginPath();
		ctx.arc(this.cx, this.cy, this.r, 0, 2 * Math.PI, false);
		ctx.fill();
	}
}

// Assign getters and setters to default properties
function watchCircleProperties(propName) {
	Object.defineProperty(this, propName, {
		get: _getter.bind(this, propName),
		set: _setter.bind(this, propName)
	});
}

function _getter(propName) {
	return this['_' + propName];
}

function _setter(propName, v) {
	if (this['_' + propName] !== v) {
		this['_' + propName] = v;

		// Update the dimensions
		this.x = this.cx - this.r;
		this.y = this.cy - this.r;
		this.w = this.r;
		this.h = this.r;
	}
}
