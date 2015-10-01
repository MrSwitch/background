//
// Rectangle
//

import Shape from './shape';

export default class Circle extends Shape{

	constructor(cx, cy, r) {
		// Find the uppermost
		super(cx - r, cy - r, r, r);

		this.cx = cx;
		this.cy = cy;
		this.r = r;
	}
	get type() {return 'circle';}

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
