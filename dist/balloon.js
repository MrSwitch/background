(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var MATH_PI2 = 2 * Math.PI;

var sprites = [];

// Create a new tile

var Balloon = (function () {
	function Balloon(cx, cy, r) {
		_classCallCheck(this, Balloon);

		this.cx = cx;
		this.cy = cy;
		this.r = r;

		this.ascending = true;
		this.fillStyle = 'black';

		this.calc();
	}

	_createClass(Balloon, [{
		key: 'calc',
		value: function calc() {
			var r = this.r;
			this.x = this.cx - r;
			this.y = this.cy - r;
			this.w = r * 2;
			this.h = r * 2;
		}
	}, {
		key: 'draw',
		value: function draw(ctx) {

			if (this.r <= 0) {
				this.r = 0;
				return;
			}

			// Does this exist as a sprite?
			var key = this.fillStyle + this.r;
			if (!(key in sprites)) {
				var _canvas = document.createElement('canvas');
				_canvas.width = Math.ceil(this.w) + 2;
				_canvas.height = Math.ceil(this.h) + 2;
				var _ctx = _canvas.getContext('2d');
				_ctx.fillStyle = this.fillStyle;
				_ctx.beginPath();
				_ctx.arc(this.r + 1, this.r + 1, this.r, 0, MATH_PI2, false);
				_ctx.fill();

				sprites[key] = _canvas;
			}

			ctx.drawImage(sprites[key], this.x - 1, this.y - 1);
		}
	}, {
		key: 'frame',
		value: function frame() {

			// Is this expanding or shrinking?
			if (this.r <= 0) {
				this.ascending = true;
			} else if (this.r >= max_radius) {
				this.ascending = false;
			}

			this.r += (this.ascending ? 1 : -1) * (max_radius / 200);
			this.calc();
			this.dirty = true;
		}
	}]);

	return Balloon;
})();

var canvas = new _classesCanvas2['default']();
var collection = new _classesCollection2['default'](canvas.target);
canvas.addEventListener('resize', setup);
canvas.addEventListener('frame', function () {

	// Clear canvas
	canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw items
	collection.draw();
});

// draw variant background

var balloons = [];
var max_radius;

setup();

function setup() {

	// There are 100 balloons
	var n = 100;

	// To fill the rectangular screen area
	var W = canvas.width;
	var H = canvas.height;
	var A = H * W;

	// Each would have to fill an area about.
	var a = A / n;

	// And since they must fill a square we can sqrt to find width and height of the balloons
	var w = Math.sqrt(a);
	var h = w;

	// Find the number that would be needed to fill the axis
	var nx = Math.floor(W / w) || 1;
	var ny = Math.floor(H / h) || 1;

	// Adjust the width and height to uniformly spread them out
	w = W / nx;
	h = H / ny;

	// Capture max-radius
	var r = Math.max(w, h) / 2;
	max_radius = r * 1.5;

	for (var i = 0; i < nx; i++) {
		r = (i + 1) / nx * w / 2;
		for (var j = 0; j < ny; j++) {

			var cx = parseInt(i * w + w / 2, 10);
			var cy = parseInt(j * h + h / 2, 10);

			var balloon = balloons[i * ny + j];

			// %100

			if (!balloon) {
				balloon = new Balloon(cx, cy, r);
				collection.push(balloon);
				balloons.push(balloon);
			} else {
				// Insert into a collection
				collection.push(balloon);

				// Update its position
				balloon.cx = cx;
				balloon.cy = cy;
				balloon.r = r;
				balloon.ascending = true;
			}
		}
	}

	// Crop the collection array to nx * ny
	collection.length = nx * ny;
}

},{"./classes/canvas":2,"./classes/collection":3}],2:[function(require,module,exports){
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

},{"../utils/events/createDummyEvent":4,"../utils/events/createEvent":5,"../utils/support/requestAnimationFrame":6}],3:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}]},{},[1])


//# sourceMappingURL=../dist/balloon.js.map