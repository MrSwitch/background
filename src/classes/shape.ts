// Shape
// CanvasShapes
// The parent object defining a basic shape, x,y,w,h, for starters.
// And basic operatings you might like to include on a shape
import createEvent from 'tricks/events/createEvent';

export interface Box {
	x: number;
	y: number;
	w: number;
	h: number;
}

type EventHandler = (e: Event) => void;

export default class Shape {

	// initieate  events
	events: Record<string, EventHandler[]> = {};

	// Set previous
	previous: Partial<Box> = {};

	_x = 0;
	_y = 0;
	_w = 0;
	_h = 0;
	_dx = 0;
	_dy = 0;
	_visible?: boolean;
	_opacity?: number;
	_dirty: boolean | 'pending' = false;
	_pointerEvents?: boolean | number;
	zIndex?: number;

	constructor (...args: [x?: number, y?: number, w?: number, h?: number]) {

		if (args.length) {
			// Store the values
			this.position(...args);
		}
	}

	//	Set property listeners
	get x() {
		return this._x;
	}
	set x(x: number) {
		this.positionObj({x});
	}

	get y() {
		return this._y;
	}
	set y(y: number) {
		this.positionObj({y});
	}

	get w() {
		return this._w;
	}
	set w(w: number) {
		this.positionObj({w});
	}

	get h() {
		return this._h;
	}
	set h(h: number) {
		this.positionObj({h});
	}

	get dx() {
		return this._dx;
	}
	set dx(v: number) {
		if (this._dx !== v) {
			this.dirty = true; this._dx = v;
		}
	}

	get dy() {
		return this._dy;
	}
	set dy(v: number) {
		if (this._dy !== v) {
			this.dirty = true; this._dy = v;
		}
	}

	get visible() {
		return (this._visible === undefined ? true : this._visible);
	}
	set visible(v: boolean) {
		if (this._visible !== v) {
			this.dirty = true; this._visible = v;
		}
	}

	get opacity() {
		return (this._opacity === undefined ? 1 : this._opacity);
	}
	set opacity(v: number) {
		if (this._opacity !== v) {
			this.dirty = true; this._opacity = v;
		}
	}

	set dirty (v: boolean | 'pending') {
		// Has this just been made dirty?
		if (!this._dirty && v) {
			// Mark as dirty
			this._dirty = v;

			// Trigger a canvas clean
			this.dispatchEvent(createEvent('dirty'));
		}
		else if (!v) {
			// reset
			this._dirty = v;

			// Store the previous values
			this.previous = {
				x: this._x,
				y: this._y,
				w: this._w,
				h: this._h,
			};
		}
	}
	get dirty () {
		return this._dirty;
	}

	// Let events bubble up
	get pointerEvents () {
		return (this._pointerEvents === undefined ? 1 : this._pointerEvents);
	}
	set pointerEvents (v: boolean | number) {
		this._pointerEvents = v;
	}

	// Mark the shape as to be removed from the collection
	remove() {
		this.dirty = true;
		this.visible = false;
	}

	position(x = 0, y = 0, w = 0, h = 0) {

		// Assign, rectangle shape
		// Have a backup footprint
		this.positionObj({x, y, w, h});
	}

	positionObj(coords: Partial<Box>) {
		for (const coord of ['x', 'y', 'w', 'h'] as const) {
			if (!(coord in coords)) {
				continue;
			}
			const value = coords[coord];
			const current = this[`_${coord}`];
			if (value !== undefined && current !== value) {
				this.dirty = true;
				this[`_${coord}`] = value;
			}
		}
	}

	// Placeholder function for drawing to canvas
	frame() {}
	draw(_ctx?: CanvasRenderingContext2D) {} // eslint-disable-line no-unused-vars
	setup() {}

	// Events
	// Assign Events to be fired when the user clicks this object
	// Awesome
	addEventListener(eventName: string, callback: EventHandler) {
		if (!(eventName in this.events)) {
			this.events[eventName] = [];
		}
		this.events[eventName].push(callback);
	}

	dispatchEvent(e: Event) {
		if (!(e.type in this.events)) {
			return;
		}
		this.events[e.type].forEach(fn => fn(e));
	}

	// Assign getters and setters to default properties
	_watchProperty(propName: string) {
		Object.defineProperty(this, propName, {
			get: this._getter.bind(this, propName),
			set: this._setter.bind(this, propName)
		});
	}

	_getter(propName: string) {
		return (this as unknown as Record<string, unknown>)[`_${ propName}`];
	}

	_setter(propName: string, v: unknown) {
		const self = this as unknown as Record<string, unknown>;
		if (self[`_${ propName}`] !== v) {
			this.dirty = true;
			self[`_${ propName}`] = v;
		}
	}
}
