// Shape
// CanvasShapes
// The parent object defining a basic shape, x,y,w,h, for starters.
// And basic operatings you might like to include on a shape

export default class Shape{

	constructor (...args) {

		// Set property listeners
		['x', 'y', 'w', 'h', 'dx', 'dy', 'visible', 'opacity'].forEach(this._watchProperty.bind(this));

		// The default status is touched,
		// This means it needs to be drawn on to canvas
		this._dirty = true;

		// initieate  events
		this.events = [];

		// Set past points
		this.past = {};

		// Store the values
		this.position(...args);

		// Whether or not to draw this out
		this.visible = true;

		// Opacity
		this.opacity = 1;

	}

	set dirty (v) {
		// Has this just been made dirty?
		if (!this._dirty && v) {
			// Mark as dirty
			this._dirty = v;

			// Trigger a canvas clean
			this.dispatchEvent(new Event('dirty'));
		}
		else if(!v){
			// reset
			this._dirty = false;
		}
	}
	get dirty () {
		return this._dirty;
	}

	// set x (v) { this._x = v; }
	// get x () { return this._x || 0; }

	// set y (v) { this._y = v; }
	// get y () { return this._y || 0; }

	// set w (v) { this._w = v; }
	// get w () { return this._w || 0; }

	// set h (v) { this._h = v; }
	// get h () { return this._h || 0; }

	position(x = 0, y = 0, w = 0, h = 0) {

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
	frame(){}
	draw(){}
	setup(){}

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
			get: function() {
				return this['_' + propName];
			},
			set: function(v) {
				if (this['_' + propName] !== v) {
					this.dirty = true; 
					this['_' + propName] = v;
				}
			}
		});
	}
}