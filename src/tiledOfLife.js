// TiledOfLife, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
import Canvas from './classes/canvas.js';
import Collection from './classes/collection.js';
import Background from './classes/Background.js';

// Create a new tile
class Tile {

	constructor(...args) {

		this.i = Math.round(Math.random() * this.n);
		this.ascending = !Math.round(Math.random());
		this.dx = 0;
		this.dy = 0;
		this.grid = [];
		this.position(...args);
	}

	get n() {
		return 100;
	}

	position(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	draw(ctx) {

		if (this.dx || this.dy) {
			ctx.translate(this.dx, this.dy);
		}

		ctx.fillStyle = this.fillStyle;
		ctx.fillRect(this.x, this.y, this.w, this.h);

		if (this.dx || this.dy) {
			// reset
			ctx.setTransform(1, 0, 0, 1, 0, 0);
		}
	}
	setup() {}
	frame() {

		this.dirty = true;

		let opacity = this.i;

		if (this.dx || this.dy) {
			this.dy *= 0.9;
			this.dx *= 0.9;
			if (Math.abs(this.dx) < 0.1) {
				this.dx = 0;
			}
			if (Math.abs(this.dy) < 0.1) {
				this.dy = 0;
			}
		}

		if (pointer) {

			const [mx, my] = [pointer.offsetX, pointer.offsetY];
			let dx = mx - this.x;
			let dy = my - this.y;

			if (Math.abs(dx) < radius &&
				Math.abs(dy) < radius &&
				(Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(radius, 2))) {


				dx = 0.3 * (Math.abs(dx) / dx) * -(radius - Math.abs(dx));
				dy = 0.3 * (Math.abs(dy) / dy) * -(radius - Math.abs(dy));

				// sometimes we get a NaN, catch and set those
				if (!dx) {
					dx = 0;
				}
				if (!dy) {
					dy = 0;
				}

				this.dx += (dx - this.dx) * 0.5;
				this.dy += (dy - this.dy) * 0.5;


				// If this is on the left, highlight
				// else, gray out if on the left
				if (mx > this.x) {
					opacity = (opacity / 2) + (this.n / 2);
				}
				if (mx < this.x) {
					opacity = opacity / 2;
				}
			}
		}

		this.fillStyle = `rgba(0, 0, 0, ${opacity ? opacity / this.n : 0})`;

		if (this.i <= 0) {
			this.ascending = true;
		}
		else if (this.i >= this.n) {
			this.ascending = false;
		}

		this.i += this.ascending ? 1 : -1;
	}
}

class Stage {
	constructor(target) {

		const canvas = new Canvas(target);
		const collection = new Collection(canvas.target);

		this.canvas = canvas;
		this.collection = collection;

		canvas.addEventListener('mousemove', action.bind(this));
		canvas.addEventListener('touchmove', action.bind(this));
		canvas.addEventListener('resize', setup.bind(this));

		canvas.addEventListener('frame', () => {

			// Clear canvas
			canvas.clear();

			// Draw items
			collection.draw();
		});

		this.tiles = [];

		setup.call(this);

	}
}


// Canvas
const radius = 80;
let pointer;

// Add Stage to the background
Background.add(Stage);


function setup() {

	const canvas = this.canvas;
	const tiles = this.tiles;
	const collection = this.collection;

	let h;
	let w;
	w = h = 40;

	const nx = Math.floor(canvas.width / w);
	const ny = Math.floor(canvas.height / h);

	w += Math.floor((canvas.width % (nx * w)) / nx);
	h += Math.floor((canvas.height % (ny * h)) / ny);

	for (let i = 0; i < nx; i++) {
		for (let j = 0; j < ny; j++) {

			let tile = tiles[((i * ny) + j)];

			// %100

			if (!tile) {
				tile = new Tile((i * w) + 1, (j * h) + 1, w - 1, h - 1);
				collection.push(tile);
				tiles.push(tile);
			}
			else {
				tile.position((i * w) + 1, (j * h) + 1, w - 1, h - 1);
			}
			tile.grid = [i, j];
		}
	}
}

let timer;
function action(e) {
	pointer = e;

	if (timer) {
		clearTimeout(timer);
	}
	timer = setTimeout(() => {
		pointer = null;
	}, 1e2);
}
