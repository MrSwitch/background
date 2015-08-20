//
// Rectangle
//

import Shape from './shape';

export default class Rect extends Shape{

	constructor(...args) {
		super(...args);

		// Set property listeners
		['fillStyle'].forEach(this._watchProperty.bind(this));


		this.type = 'rect';
	}

	draw(canvas) {

		var ctx = canvas.ctx;
		ctx.save();

		if (this.dx || this.dy) {
			ctx.translate(this.dx, this.dy);
		}
		ctx.fillStyle = this.fillStyle;
		ctx.fillRect(this.x, this.y, this.w, this.h);
		ctx.restore();
	}
}