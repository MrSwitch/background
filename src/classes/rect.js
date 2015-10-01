//
// Rectangle
//

import Shape from './shape';

export default class Rect extends Shape{

	constructor(...args) {
		super(...args);
	}

	get fillStyle(){ return this._fillStyle;}
	set fillStyle(v){ if (this._fillStyle !== v) {this.dirty = true; this._fillStyle = v;}}

	get type() {return 'rect';}

	draw(ctx) {

		ctx.save();

		if (this.dx || this.dy) {
			ctx.translate(this.dx, this.dy);
		}
		ctx.fillStyle = this.fillStyle;
		ctx.fillRect(this.x, this.y, this.w, this.h);
		ctx.restore();
	}
}
