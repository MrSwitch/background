// Shape
// CanvasShapes
// The parent object defining a basic shape, x,y,w,h, for starters.
// And basic operatings you might like to include on a shape
import createEvent from '../utils/events/createEvent';

export default class Shape {

	constructor (...args) {

		// initieate  events
		this.events = [];

		if (args.length) {
			// Store the values
			this.position(...args);
		}
	}

//	Set property listeners
	get x() { return this._x;}
	set x(v) { if (this._x !== v) {this.dirty = true; this._x = v;}}

	get y() { return this._y;}
	set y(v) { if (this._y !== v) {this.dirty = true; this._y = v;}}

	get w() { return this._w;}
	set w(v) { if (this._w !== v) {this.dirty = true; this._w = v;}}

	get h() { return this._h;}
	set h(v) { if (this._h !== v) {this.dirty = true; this._h = v;}}

	get dx() { return this._dx;}
	set dx(v) { if (this._dx !== v) {this.dirty = true; this._dx = v;}}

	get dy() { return this._dy;}
	set dy(v) { if (this._dy !== v) {this.dirty = true; this._dy = v;}}

	get visible() { return (this._visible === undefined ? true : this._visible);}
	set visible(v) { if (this._visible !== v) {this.dirty = true; this._visible = v;}}

	get opacity() { return (this._opacity === undefined ? 1 : this._opacity);}
	set opacity(v) { if (this._opacity !== v) {this.dirty = true; this._opacity = v;}}

	set dirty (v) {
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
		}
	}
	get dirty () {
		return this._dirty;
	}

	// Let events bubble up
	get pointerEvents () {
		return (this._pointerEvents === undefined ? 1 : this._pointerEvents);
	}
	set pointerEvents (v) {
		this._pointerEvents = v;
	}

	position(x = 0, y = 0, w = 0, h = 0) {

		if (!this.past) {
			// Set past points
			this.past = {};
		}

		this.past.x = this.x;
		this.past.y = this.y;
		this.past.w = this.w;
		this.past.h = this.h;

		// Assign, rectangle shape
		// Have a backup footprint
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	// Placeholder function for drawing to canvas
	frame() {}
	draw() {}
	setup() {}

	// Events
	// Assign Events to be fired when the user clicks this object
	// Awesome
	addEventListener(eventName, callback) {
		if (!(eventName in this.events)) {
			this.events[eventName] = [];
		}
		this.events[eventName].push(callback);
	}

	dispatchEvent(e) {
		if (!(e.type in this.events)) {
			return;
		}
		this.events[e.type].forEach((fn) => fn(e));
	}

	// Assign getters and setters to default properties
	_watchProperty(propName) {
		Object.defineProperty(this, propName, {
			get: this._getter.bind(this, propName),
			set: this._setter.bind(this, propName)
		});
	}

	_getter(propName) {
		return this['_' + propName];
	}

	_setter(propName, v) {
		if (this['_' + propName] !== v) {
			this.dirty = true;
			this['_' + propName] = v;
		}
	}
}
