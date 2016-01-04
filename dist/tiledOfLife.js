(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Background
// Exposes the basic properties/methods of a controllable background

// Extract the window.background items
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _callbacks = Array.isArray(window.background) ? window.background : [];
var callbacks = [];
var stages = [];

var Background = (function () {
	function Background() {
		_classCallCheck(this, Background);
	}

	// Execute the current callbacks

	_createClass(Background, null, [{
		key: "push",
		value: function push(cb) {

			// Return callback with an instance of this Object
			if (stages.length) {
				cb(Background);
			} else {
				callbacks.push(cb);
			}
		}
	}, {
		key: "ready",
		value: function ready() {
			callbacks.forEach(function (item) {
				Background.push(item);
			});
			callbacks.length = 0;
		}
	}, {
		key: "add",
		value: function add(stage) {
			// Store the
			stages.push(stage);

			// Trigger ready if it has not already been set
			if (stages.length === 1) {
				Background.ready();
			}
		}

		// Create a new instance of a stage
	}, {
		key: "init",
		value: function init(target) {
			// Get the default stage which has been registered with this class
			var stage = stages[0];

			// Return instance
			if (stage) {
				return new stage(target);
			}
		}
	}]);

	return Background;
})();

exports["default"] = Background;
_callbacks.forEach(function (item) {
	Background.push(item);
});
_callbacks.length = 0;

// Define the background on the window
// This is a rudimentary service which works...
window.background = Background;
module.exports = exports["default"];

},{}],2:[function(require,module,exports){
// Setup
// This constructs the canvas object

// Includes
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

require('../utils/support/requestAnimationFrame');

var _utilsEventsCreateEvent = require('../utils/events/createEvent');

var _utilsEventsCreateEvent2 = _interopRequireDefault(_utilsEventsCreateEvent);

var _utilsEventsCreateDummyEvent = require('../utils/events/createDummyEvent');

var _utilsEventsCreateDummyEvent2 = _interopRequireDefault(_utilsEventsCreateDummyEvent);

// Constants
var BACKGROUND_HASH = 'background';
var UserEvents = ['click', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout', 'frame', 'resize'];
var TouchEvents = ['touchmove', 'touchstart', 'touchend'];

var EVENT_SEPARATOR = /[\s\,]+/;

var Canvas = (function () {

	// Construct the Canvas Element
	// @param canvas should be an root element container for this imagery.

	function Canvas(canvas) {
		var _this = this;

		_classCallCheck(this, Canvas);

		var parent;

		// events
		this.events = {};

		// browser check
		if (!('getContext' in document.createElement('canvas'))) {
			// browser doesn't support canvas
			return;
		}

		if (!(canvas && canvas instanceof HTMLCanvasElement)) {

			// Set the parent
			parent = canvas;

			// Create the canvas layer
			canvas = document.createElement('canvas');
			canvas.style.backgroundColor = 'white';

			// Not a parent
			if (!parent) {
				// Append to the body
				parent = document.body;
				canvas.style.cssText = 'position:fixed;z-index:-1;top:0;left:0;';
				canvas.setAttribute('tabindex', 0);

				document.documentElement.style.cssText = 'min-height:100%;';
				document.body.style.cssText = 'min-height:100%;';

				// Bind window resize events
				window.addEventListener('resize', this.resize.bind(this));
			}

			// Append this element
			parent.insertBefore(canvas, parent.firstElementChild);

			this.target = canvas;

			this.resize();
		} else {
			this.target = canvas;
			parent = canvas.parentNode;
		}

		this.ctx = canvas.getContext('2d');

		// Set initial save point
		this.ctx.save();

		// Initiate the time
		this._time = 0;
		this._fps = 0;

		// Initiate the draw
		this.draw();

		// Bind events
		UserEvents.forEach(function (eventname) {
			return _this.target.addEventListener(eventname, _this.dispatchEvent.bind(_this));
		});

		// Format Touch events
		TouchEvents.forEach(function (eventname) {
			return _this.target.addEventListener(eventname, _this.dispatchTouchEvent.bind(_this));
		});

		// In IE user-events aren't propagated to elements which have negative z-Index's
		// Listen to events on the document element and propagate those accordingly
		if (parent === document.body && canvas.style.getPropertyValue('z-index') === '-1') {
			// Bind events
			UserEvents.forEach(function (eventname) {
				return document.addEventListener(eventname, _this.dispatchEvent.bind(_this));
			});

			// Format Touch events
			TouchEvents.forEach(function (eventname) {
				return document.addEventListener(eventname, _this.dispatchTouchEvent.bind(_this));
			});
		}

		// Listen to hashChange events
		{
			// HASH CHANGE DEPTH
			var style = this.target.style;
			var initialZ = style.getPropertyValue('z-index');
			// Listen to changes to the background hash to bring the canvas element to the front
			window.addEventListener('hashchange', hashchange.bind(style, initialZ));

			hashchange.call(style, initialZ);
		}
	}

	// ensure its keeping up.

	_createClass(Canvas, [{
		key: 'resize',
		value: function resize() {
			var parent = this.target.parentNode === document.body ? document.documentElement : this.target.parentNode;
			var height = parent.clientHeight;
			var width = parent.clientWidth;
			var changed = false;

			if (this.width !== width) {
				changed = true;
				this.width = width;
			}
			if (this.height !== height) {
				changed = true;
				this.height = height;
			}

			if (changed) {
				this.target.dispatchEvent((0, _utilsEventsCreateEvent2['default'])('resize'));
			}
		}
	}, {
		key: 'clear',
		value: function clear() {
			this.ctx.clearRect(0, 0, this.target.width, this.target.height);
		}

		// Bring the content of the canvas to the front
	}, {
		key: 'bringToFront',
		value: function bringToFront() {

			// Update the window.location with the hash #background
			window.location.hash = BACKGROUND_HASH;
		}

		// Trigger the draw function
	}, {
		key: 'draw',
		value: function draw() {

			// Increment the number of frames
			this.fps++;

			// Call the frame function in the context of the frame to draw
			this.target.dispatchEvent((0, _utilsEventsCreateEvent2['default'])('frame'));

			// Request another frame
			requestAnimationFrame(this.draw.bind(this));
		}

		// The user has clicked an item on the page
	}, {
		key: 'addEventListener',
		value: function addEventListener(eventnames, handler) {
			var _this2 = this;

			eventnames.split(EVENT_SEPARATOR).forEach(function (eventname) {
				// Add to the events list
				if (!(eventname in _this2.events)) {
					_this2.events[eventname] = [];
				}

				_this2.events[eventname].push(handler);
			});
		}

		// Dispatch
	}, {
		key: 'dispatchEvent',
		value: function dispatchEvent(e) {

			if (e.type in this.events) {

				var target = e.currentTarget;

				// This was triggered using event delegation, aka in the background
				if (target === document) {

					e = (0, _utilsEventsCreateDummyEvent2['default'])({
						type: e.type,
						target: this.target,
						offsetX: e.pageX || e.offsetX,
						offsetY: e.pageY || e.offsetY
					});
				}

				this.events[e.type].forEach(function (handler) {
					return handler(e);
				});
				e.preventDefault();
				e.stopPropagation();
			}
		}

		// Dispatch
	}, {
		key: 'dispatchTouchEvent',
		value: function dispatchTouchEvent(e) {
			// If this was a touch event
			// Determine the offset to the canvas element relative to the item being clicked
			var touch = (e.touches || e.changedTouches)[0];
			if (touch) {
				e.offsetX = Math.abs(touch.pageX || touch.screenX);
				e.offsetY = Math.abs(touch.pageY || touch.screenY);
			}

			this.dispatchEvent(e);
		}
	}, {
		key: 'width',
		get: function get() {
			return this.target.width;
		},
		set: function set(value) {
			this.target.width = value;
			return value;
		}
	}, {
		key: 'height',
		get: function get() {
			return this.target.height;
		},
		set: function set(value) {
			this.target.height = value;
			return value;
		}
	}, {
		key: 'fps',
		get: function get() {
			return this._fps;
		},
		set: function set(value) {

			this._fps = value;

			var now = new Date().getTime();

			if (now - this._time > 1000) {
				// console.log('fps: %d', this._fps);
				this._time = now;
				this._fps = 0;
			}
		}
	}]);

	return Canvas;
})();

exports['default'] = Canvas;

function hashchange(z) {

	var zIndex = 'z-index';

	if (window.location.hash === '#' + BACKGROUND_HASH) {
		z = 10000;
	}

	if (z !== undefined) {
		// Set the z-Index
		this.setProperty(zIndex, z);
	} else {
		// Remove the z-Index
		this.removeProperty(zIndex);
	}
}
module.exports = exports['default'];

},{"../utils/events/createDummyEvent":5,"../utils/events/createEvent":6,"../utils/support/requestAnimationFrame":7}],3:[function(require,module,exports){
// Collection

'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var UserEvents = ['click', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout', 'touchmove', 'touchstart', 'touchend', 'frame'];

var Collection = (function () {
	function Collection(target) {
		_classCallCheck(this, Collection);

		// Create an empty children
		this.children = [];

		// Events
		this.events = [];

		// setup the canvas element
		this.init(target);
	}

	// Intersect
	// Given two objects with, x,y,w,h properties
	// Do their rectangular dimensions intersect?
	// return Boolean true false.

	// listen to canvas events

	_createClass(Collection, [{
		key: 'init',
		value: function init(target) {
			var _this = this;

			// Define the canvas object as the target for the collection
			this.target = target;

			// Define the CTX
			this.ctx = target.getContext('2d');

			// listen to user interactive events and trigger those on items
			UserEvents.forEach(function (eventname) {
				return target.addEventListener(eventname, _this._findAndDispatch.bind(_this));
			});
		}
	}, {
		key: 'push',
		value: function push(item) {
			item.dirty = true;

			// Is this item already in the collection?
			if (this.children.indexOf(item) === -1) {
				if (item.setup) {
					item.setup(this);
				}

				// item.addEventListener('dirty', this.prepareChild.bind(this, item));
				this.children.push(item);
			}
		}
	}, {
		key: 'prepare',

		// Touch
		// Mark items and objects in the same space to be redrawn
		value: function prepare() {
			var _this2 = this;

			this.children.forEach(function (item) {
				if (item.dirty === true) _this2.prepareChild(item);
			});
		}

		// Clean Item
	}, {
		key: 'prepareChild',
		value: function prepareChild(item) {

			var ctx = this.ctx;

			if (item.dirty === 'pending') {
				return;
			}

			// Mark this item as dirty
			item.dirty = 'pending';

			// Remove from Canvas
			ctx.clearRect(item.x, item.y, item.w, item.h);

			// If the items old position is different
			if (item.past && displaced(item.past, item)) {
				ctx.clearRect(item.past.x, item.past.y, item.past.w, item.past.h);
			}

			// Loop though objects and redraw those that exist within the position
			this.children.forEach(this._prepareSiblings.bind(this, item));
		}
	}, {
		key: '_prepareSiblings',
		value: function _prepareSiblings(item, sibling) {

			// Does this Object overlap with the focused object?
			if (!sibling.dirty && sibling.visible !== false && (intersect(sibling, item) || (item.past ? intersect(sibling, item.past) : false))) {
				// Nested clean
				this.prepareChild(sibling);
			}
		}
	}, {
		key: 'sort',
		value: function sort() {
			// Sort items by z-index
			this.children.sort(function (a, b) {
				a = a.zIndex || 0;
				b = b.zIndex || 0;
				return +(a > b) || -(a < b);
			});
		}

		// Trigger the draw function
	}, {
		key: 'draw',
		value: function draw() {

			var ctx = this.ctx;

			// Find items that have changed
			// Remove background
			this.children.forEach(function (item) {

				if (item.frame) {
					item.frame(ctx);
				}

				if (item.dirty && item.visible !== false) {
					item.draw(ctx);
				}

				item.dirty = false;
			});
		}
	}, {
		key: 'elementFromPoint',
		value: function elementFromPoint(x, y) {

			var target;

			// Find the canvas item which this targets?
			var obj = {
				x: x,
				y: y,
				w: 1,
				h: 1
			};

			this.children.forEach(function (item) {

				if (item.visible === false || !item.w || !item.h || item.pointerEvents === false) {
					return;
				}

				// Is this a target?
				if (intersect(obj, item)) {
					// Define this as a target
					target = item;
				}
			});

			return target;
		}

		// The user has clicked an item on the page
	}, {
		key: 'addEventListener',
		value: function addEventListener(eventname, handler) {

			// Add to the events list
			if (!(eventname in this.events)) {
				this.events[eventname] = [];
			}

			this.events[eventname].push(handler);
		}

		// Dispatch
	}, {
		key: 'dispatchEvent',
		value: function dispatchEvent(e) {
			if (e.type in this.events) this.events[e.type].forEach(function (handler) {
				return handler(e);
			});
		}

		// Find and _dispatch
	}, {
		key: '_findAndDispatch',
		value: function _findAndDispatch(e) {
			// If this is not a pointerEvent lets just pass it through.
			if (typeof MouseEvent !== 'undefined' && e instanceof MouseEvent || typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {

				// Find the canvas item which this targets?
				var obj = {
					x: e.offsetX,
					y: e.offsetY,
					w: 1,
					h: 1
				};

				this.children.forEach(function (item) {

					if (!item.visible || !item.w || !item.h || !item.pointerEvents) {
						return;
					}

					// Intersects?
					intersect(obj, item) && item.dispatchEvent(e);
				});
			}
		}
	}, {
		key: 'length',
		get: function get() {
			return this.children.length;
		},
		set: function set(v) {
			return this.children.length = v;
		}
	}]);

	return Collection;
})();

exports['default'] = Collection;
function intersect(a, b) {
	return !(a.x > b.x + b.w || a.x + a.w < b.x || a.y > b.y + b.h || a.y + a.h < b.y);
}

function displaced(a, b) {
	return a.x !== b.x || a.y !== b.y || a.w !== b.w || a.h !== b.h;
}
module.exports = exports['default'];

},{}],4:[function(require,module,exports){
// TiledOfLife, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _classesCanvas = require('./classes/canvas');

var _classesCanvas2 = _interopRequireDefault(_classesCanvas);

var _classesCollection = require('./classes/collection');

var _classesCollection2 = _interopRequireDefault(_classesCollection);

var _classesBackground = require('./classes/background');

var _classesBackground2 = _interopRequireDefault(_classesBackground);

// Create a new tile

var Tile = (function () {
	function Tile() {
		_classCallCheck(this, Tile);

		this.i = Math.round(Math.random() * this.n);
		this.ascending = !Math.round(Math.random());
		this.dx = 0;
		this.dy = 0;
		this.grid = [];
		this.position.apply(this, arguments);
	}

	_createClass(Tile, [{
		key: 'position',
		value: function position(x, y, w, h) {
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
		}
	}, {
		key: 'draw',
		value: function draw(ctx) {

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
	}, {
		key: 'setup',
		value: function setup() {}
	}, {
		key: 'frame',
		value: function frame() {

			this.dirty = true;

			var opacity = this.i;

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
				var mx = pointer.offsetX;
				var my = pointer.offsetY;

				var dx = mx - this.x;
				var dy = my - this.y;

				if (Math.abs(dx) < radius && Math.abs(dy) < radius && Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(radius, 2)) {

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
						opacity = opacity / 2 + this.n / 2;
					}
					if (mx < this.x) {
						opacity = opacity / 2;
					}
				}
			}

			this.fillStyle = 'rgba(0, 0, 0, ' + (opacity ? opacity / this.n : 0) + ')';

			if (this.i <= 0) {
				this.ascending = true;
			} else if (this.i >= this.n) {
				this.ascending = false;
			}

			this.i += this.ascending ? 1 : -1;
		}
	}, {
		key: 'n',
		get: function get() {
			return 100;
		}
	}]);

	return Tile;
})();

var Stage = function Stage(target) {
	_classCallCheck(this, Stage);

	var canvas = new _classesCanvas2['default'](target);
	var collection = new _classesCollection2['default'](canvas.target);

	this.canvas = canvas;
	this.collection = collection;

	canvas.addEventListener('mousemove', action.bind(this));
	canvas.addEventListener('touchmove', action.bind(this));
	canvas.addEventListener('resize', setup.bind(this));

	canvas.addEventListener('frame', function () {

		// Clear canvas
		canvas.clear();

		// Draw items
		collection.draw();
	});

	this.tiles = [];

	setup.call(this);
}

// Canvas
;

var radius = 80;
var pointer;

// Add Stage to the background
_classesBackground2['default'].add(Stage);

function setup() {

	var canvas = this.canvas;
	var tiles = this.tiles;
	var collection = this.collection;

	var h, w;
	w = h = 40;

	var nx = Math.floor(canvas.width / w);
	var ny = Math.floor(canvas.height / h);

	w += Math.floor(canvas.width % (nx * w) / nx);
	h += Math.floor(canvas.height % (ny * h) / ny);

	for (var i = 0; i < nx; i++) {
		for (var j = 0; j < ny; j++) {

			var tile = tiles[i * ny + j];

			// %100

			if (!tile) {
				tile = new Tile(i * w + 1, j * h + 1, w - 1, h - 1);
				collection.push(tile);
				tiles.push(tile);
			} else {
				tile.position(i * w + 1, j * h + 1, w - 1, h - 1);
			}
			tile.grid = [i, j];
		}
	}
}

var timer;
function action(e) {
	pointer = e;

	if (timer) {
		clearTimeout(timer);
	}
	timer = setTimeout(function () {
		pointer = null;
	}, 1e2);
}

},{"./classes/background":1,"./classes/canvas":2,"./classes/collection":3}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports["default"] = function (e) {
	e.stopPropagation = function () {};
	e.preventDefault = function () {};
	return e;
};

module.exports = exports["default"];

},{}],6:[function(require,module,exports){
// IE does not support `new Event()`
// See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events for details
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var createEvent = function createEvent(eventname) {
	return new Event(eventname);
};
try {
	createEvent('test');
} catch (e) {
	createEvent = function (eventname) {
		var e = document.createEvent('Event');
		e.initEvent(eventname, true, true);
		return e;
	};
}

exports['default'] = createEvent;
module.exports = exports['default'];

},{}],7:[function(require,module,exports){
// requestAnimationFrame polyfill
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
	setTimeout(callback, 1000 / 60);
};

exports["default"] = window.requestAnimationFrame.bind(window);
module.exports = exports["default"];

},{}]},{},[4])


//# sourceMappingURL=../dist/tiledOfLife.js.map