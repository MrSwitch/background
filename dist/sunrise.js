(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"../utils/events/createDummyEvent":3,"../utils/events/createEvent":4,"../utils/support/requestAnimationFrame":5}],2:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classesCanvas = require('./classes/canvas');

var _classesCanvas2 = _interopRequireDefault(_classesCanvas);

var canvas = new _classesCanvas2['default']();
canvas.addEventListener('mouseover', function () {
	return hover = true;
});
canvas.addEventListener('mouseout', function () {
	return hover = false;
});

var spin = 0,
    radius,
    hover,
    opacity = 0;
var slices = 32;
var pi = Math.PI / 180,
    deg = 360 / slices;
var pallate = ['rgb(255, 140, 0)', 'rgb(255,0,0)', 'rgb(255,255,0)'];

canvas.addEventListener('frame', function () {

	var ctx = canvas.ctx;
	var cx = canvas.width / 2;
	var cy = canvas.height / 2;

	// ensure its keeping up.
	radius = Math.max(canvas.width, canvas.height) / 2;

	// Do we need this?
	if (hover || opacity > 0) {

		spin++;

		if (hover && opacity < 1) {
			opacity += 0.1;
		}
		if (!hover && opacity > 0) {
			opacity -= 0.1;
		}

		canvas.target.style.opacity = Math.round(opacity * 10) / 10;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// draw an arc
		for (var i = 0; i < slices; i++) {
			ctx.beginPath();
			ctx.fillStyle = pallate[i % pallate.length];

			// *270 changed to *360
			ctx.arc(radius, radius, radius * 1.5, pi * (i * deg + spin), pi * ((i + 1) * deg + spin), false);
			ctx.lineTo(cx, cy);
			ctx.fill();
			ctx.closePath();
		}
	}
});

},{"./classes/canvas":1}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}]},{},[2])


//# sourceMappingURL=../dist/sunrise.js.map