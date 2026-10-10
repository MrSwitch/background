//
// Rectangle
//

import Shape from './shape';

export default class Rect extends Shape {

	_fillStyle?: string;

	get fillStyle() {
		return this._fillStyle;
	}
	set fillStyle(v: string | undefined) {
		if (this._fillStyle !== v) {
			this.dirty = true;
			this._fillStyle = v;
		}
	}

	get type() {
		return 'rect';
	}

	draw(ctx: CanvasRenderingContext2D) {

		ctx.save();

		if (this.dx || this.dy) {
			ctx.translate(this.dx, this.dy);
		}
		ctx.fillStyle = this.fillStyle ?? '#000';
		ctx.fillRect(this.x, this.y, this.w, this.h);
		ctx.restore();
	}
}
