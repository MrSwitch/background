(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = function (obj) {
  return Array.prototype.slice.call(obj);
};

},{}],2:[function(require,module,exports){
'use strict';

var isDom = require('./isDom.js');
var instanceOf = require('../object/instanceOf.js');
var toArray = require('../array/toArray.js');

module.exports = function (matches) {
	var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};


	if (isDom(matches)) {
		matches = [matches];
	} else if (typeof matches === 'string') {
		matches = document.querySelectorAll(matches);
	}

	if (!instanceOf(matches, Array)) {
		matches = toArray(matches);
	}

	if (callback) {
		matches.forEach(callback);
	}

	return matches;
};

},{"../array/toArray.js":1,"../object/instanceOf.js":9,"./isDom.js":3}],3:[function(require,module,exports){
'use strict';

var instanceOf = require('../object/instanceOf.js');

var _HTMLElement = typeof HTMLElement !== 'undefined' ? HTMLElement : Element;
var _HTMLDocument = typeof HTMLDocument !== 'undefined' ? HTMLDocument : Document;
var _Window = window.constructor;

module.exports = function (test) {
	return instanceOf(test, _HTMLElement) || instanceOf(test, _HTMLDocument) || instanceOf(test, _Window);
};

},{"../object/instanceOf.js":9}],4:[function(require,module,exports){
"use strict";

module.exports = function (e) {
	e.stopPropagation = function () {};
	e.preventDefault = function () {};
	return e;
};

},{}],5:[function(require,module,exports){
'use strict';

// IE does not support `new Event()`
// See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events for details
var dict = { bubbles: true, cancelable: true };

var createEvent = function createEvent(eventname) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : dict;
	return new Event(eventname, options);
};

try {
	createEvent('test');
} catch (e) {
	createEvent = function createEvent(eventname) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : dict;

		var e = document.createEvent('Event');
		e.initEvent(eventname, !!options.bubbles, !!options.cancelable);
		return e;
	};
}

module.exports = createEvent;

},{}],6:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// on.js
// Listen to events, this is a wrapper for addEventListener

var each = require('../dom/each.js');
var SEPERATOR = /[\s,]+/;

// See https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
var supportsPassive = false;
try {
	var opts = Object.defineProperty({}, 'passive', {
		get: function get() {
			supportsPassive = true;
		}
	});
	window.addEventListener('test', null, opts);
} catch (e) {
	// Continue
}

module.exports = function (elements, eventnames, callback) {
	var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;


	if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' && options.passive && !supportsPassive) {
		// Override the passive mark
		options = false;
	}

	eventnames = eventnames.split(SEPERATOR);
	return each(elements, function (el) {
		return eventnames.forEach(function (eventname) {
			return el.addEventListener(eventname, callback, options);
		});
	});
};

},{"../dom/each.js":2}],7:[function(require,module,exports){
'use strict';

// swipe
// Checks for a swipe to the left or to the right

var touch = require('./touch.js');
var gesture = touch.gesture;


module.exports = function (elements, callback) {
	return touch(elements, function (e, o, s) {

		gesture(e, s);

		e.gesture.type = 'drag' + e.gesture.direction;

		callback.call(this, e);
	}, function (e) {
		gesture(e);
		e.gesture.type = 'start';
		callback.call(this, e);
	}, function (e) {

		var g = e.gesture;

		// How long did this operation take?
		if (g.deltaTime < 200 && g.distance > 20 && g.velocity > 0.3) {
			g.type = 'swipe' + g.direction;
		} else if (g.distance < 20) {
			g.type = 'click';
		} else {
			g.type = 'release';
		}

		callback.call(this, e);
	});
};

},{"./touch.js":8}],8:[function(require,module,exports){
'use strict';

// Standardizes touch events
// Calculate the difference from the starting position and the end position.
// Returns a gesture object given

var on = require('./on.js');
var each = require('../dom/each.js');

// Does this support pointer events?
var pointerEnabled = window.navigator.pointerEnabled;
var eventMoveTypes = pointerEnabled ? 'MSPointerMove pointerMove' : 'mousemove touchmove';
var eventStartTypes = pointerEnabled ? 'MSPointerDown pointerDown' : 'mousedown touchstart';
var eventEndTypes = pointerEnabled ? 'MSPointerUp pointerUp' : 'mouseup touchend touchcancel';

// Touch
// @param callback function - Every touch event fired
// @param complete function- Once all touch event ends
module.exports = function (elements, onmove, onstart, onend) {

	// Store callbacks, and previous pointer position
	var cb = {};
	var mv = {};
	var fin = {};

	on(document, eventMoveTypes, function (moveEvent) {

		// Fix Android not firing multiple moves
		// if (e.type.match(/touch/i)) {
		// 	e.preventDefault();
		// }

		// Pointer/Mouse down?
		if (voidEvent(moveEvent)) {
			// The mouse buttons isn't pressed, kill this
			return;
		}

		// trigger the call
		var i = moveEvent.pointerId || 0;
		var handler = cb[i];

		if (handler && typeof handler === 'function') {

			var prevEvent = mv[i];

			// Extend the Event Object with 'gestures'
			gesture(moveEvent, prevEvent);

			// Trigger callback
			handler(moveEvent, prevEvent);
		}

		mv[i] = moveEvent;
	});

	on(document, eventEndTypes, function (e) {

		var i = e.pointerId || 0;
		cb[i] = null;

		if (e.type === 'touchend' || e.type === 'touchcancel') {
			e = mv[i];
		}

		var handler = fin[i];
		if (handler) {
			handler(e);
		}

		fin[i] = null;
	});

	// loop through and add events
	each(elements, function (element) {

		// bind events
		// on(element, 'touchend', e => {
		// 	console.log('el:touchend');
		// 	console.log(e);
		// });

		on(element, 'selectstart', function () {
			return false;
		});

		on(element, eventStartTypes, function (startEvent) {

			// Set prevent default to stop any mouse events from also being called
			if (typeof TouchEvent !== 'undefined' && startEvent instanceof TouchEvent) {
				// Prevent the triggering of the mouse events
				startEvent.preventDefault();
			}

			// default pointer ID
			var i = startEvent.pointerId || 0;

			// Add Gestures to event Object
			gesture(startEvent);

			mv[i] = startEvent;
			cb[i] = function (moveEvent, prevMoveEvent) {
				onmove.call(element, moveEvent, prevMoveEvent, startEvent);
			};

			if (onend) {
				fin[i] = function (endEvent) {

					// Add Gestures to event Object
					gesture(endEvent, startEvent);

					// fire complete callback
					onend.call(element, endEvent, startEvent);
				};
			}

			// trigger start
			if (onstart) {
				onstart.call(element, startEvent);
			}
		});
	});
};

function gesture(currEvent, prevEvent) {

	// Response Object
	currEvent.gesture = {};

	if (currEvent && currEvent.touches && currEvent.touches.length > 0) {
		currEvent.gesture.touches = currEvent.touches;
	} else {
		currEvent.gesture.touches = [currEvent];
	}

	currEvent.gesture.screenX = currEvent.gesture.touches[0].screenX;
	currEvent.gesture.screenY = currEvent.gesture.touches[0].screenY;

	if (!('screenX' in currEvent)) {
		currEvent.screenX = currEvent.gesture.screenX;
	}
	if (!('screenY' in currEvent)) {
		currEvent.screenY = currEvent.gesture.screenY;
	}

	// If the second parameter isn't defined then we're unable to define getures
	// But if it is then whoop, lets go.
	if (prevEvent) {

		currEvent.gesture.deltaTime = currEvent.timeStamp - prevEvent.timeStamp;

		var dx = currEvent.gesture.deltaX = currEvent.gesture.screenX - prevEvent.gesture.screenX;
		var dy = currEvent.gesture.deltaY = currEvent.gesture.screenY - prevEvent.gesture.screenY;

		// Which is the best direction for the gesture?
		if (Math.abs(dy) > Math.abs(dx)) {
			currEvent.gesture.direction = dy > 0 ? 'up' : 'down';
		} else {
			currEvent.gesture.direction = dx > 0 ? 'right' : 'left';
		}

		// Distance
		currEvent.gesture.distance = Math.sqrt(dx * dx + dy * dy);

		// Velocity
		currEvent.gesture.velocity = currEvent.gesture.distance / currEvent.gesture.deltaTime;
	}
}

module.exports.gesture = gesture;

function voidEvent(event) {
	var type = event.pointerType || event.type;
	return type.match(/mouse/i) && (event.which || event.buttons) !== 1;
}

},{"../dom/each.js":2,"./on.js":6}],9:[function(require,module,exports){
"use strict";

module.exports = function (test, root) {
  return root && test instanceof root;
};

},{}],10:[function(require,module,exports){
"use strict";

// requestAnimationFrame polyfill
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
	return setTimeout(callback, 1000 / 60);
};

module.exports = window.requestAnimationFrame.bind(window);

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // Setup
// This constructs the canvas object

// Includes


require('tricks/support/requestAnimationFrame');

var _createEvent = require('tricks/events/createEvent');

var _createEvent2 = _interopRequireDefault(_createEvent);

var _createDummyEvent = require('tricks/events/createDummyEvent');

var _createDummyEvent2 = _interopRequireDefault(_createDummyEvent);

var _on = require('tricks/events/on');

var _on2 = _interopRequireDefault(_on);

var _swipe = require('tricks/events/swipe');

var _swipe2 = _interopRequireDefault(_swipe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Constants
var BACKGROUND_HASH = 'background';
var UserEvents = ['click', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout', 'mousewheel', 'frame', 'resize', 'keydown'];
var TouchEvents = ['touchmove', 'touchstart', 'touchend'];

var EVENT_SEPARATOR = /[\s\,]+/;

var Canvas = function () {

	// Construct the Canvas Element
	// @param canvas should be an root element container for this imagery.
	function Canvas(canvas) {
		_classCallCheck(this, Canvas);

		var parent = void 0;

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
		(0, _on2.default)(this.target, UserEvents.toString(), this.dispatchEvent.bind(this), { passive: true });

		// Format Touch events
		(0, _on2.default)(this.target, TouchEvents.toString(), this.dispatchTouchEvent.bind(this), { passive: true });

		// In IE user-events aren't propagated to elements which have negative z-Index's
		// Listen to events on the document element and propagate those accordingly
		if (parent === document.body && canvas.style.getPropertyValue('z-index') === '-1') {
			// Bind events
			(0, _on2.default)(document, UserEvents.toString(), this.dispatchEvent.bind(this), { passive: true });

			// Format Touch events
			(0, _on2.default)(document, TouchEvents.toString(), this.dispatchTouchEvent.bind(this), { passive: true });
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

		// Is there a swipe method handler
		if (this.swipe) {
			// Bind the swipe event handler to the event
			(0, _swipe2.default)(this.target, this.swipe.bind(this));
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
				this.target.dispatchEvent((0, _createEvent2.default)('resize'));
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
			this.target.dispatchEvent((0, _createEvent2.default)('frame'));

			// Request another frame
			requestAnimationFrame(this.draw.bind(this));
		}

		// The user has clicked an item on the page

	}, {
		key: 'addEventListener',
		value: function addEventListener(eventnames, handler) {
			var _this = this;

			eventnames.split(EVENT_SEPARATOR).forEach(function (eventname) {
				// Add to the events list
				if (!(eventname in _this.events)) {
					_this.events[eventname] = [];
				}

				_this.events[eventname].push(handler);
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

					e = (0, _createDummyEvent2.default)({
						type: e.type,
						target: this.target,
						offsetX: e.pageX || e.offsetX,
						offsetY: e.pageY || e.offsetY
					});
				}

				this.events[e.type].forEach(function (handler) {
					return handler(e);
				});
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
}();

exports.default = Canvas;


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

},{"tricks/events/createDummyEvent":4,"tricks/events/createEvent":5,"tricks/events/on":6,"tricks/events/swipe":7,"tricks/support/requestAnimationFrame":10}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // Collection

var _on = require('tricks/events/on');

var _on2 = _interopRequireDefault(_on);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UserEvents = ['click', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout', 'touchmove', 'touchstart', 'touchend', 'frame'];

var Collection = function () {
	function Collection(target) {
		_classCallCheck(this, Collection);

		// Create an empty children
		this.children = [];

		// Events
		this.events = [];

		// setup the canvas element
		this.init(target);
	}

	// listen to canvas events


	_createClass(Collection, [{
		key: 'init',
		value: function init(target) {

			// Define the canvas object as the target for the collection
			this.target = target;

			// Define the CTX
			this.ctx = target.getContext('2d');

			// listen to user interactive events and trigger those on items
			(0, _on2.default)(target, UserEvents.toString(), this._findAndDispatch.bind(this), { passive: true });
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
		key: 'findIndex',
		value: function findIndex(fn) {
			return this.children.findIndex(fn);
		}
	}, {
		key: 'find',
		value: function find(fn) {
			return this.children.find(fn);
		}
	}, {
		key: 'prepare',


		// Touch
		// Mark items and objects in the same space to be redrawn
		value: function prepare() {
			var _this = this;

			this.children.forEach(function (item) {
				if (item.dirty === true) _this.prepareChild(item);
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
			if (item.previous && displaced(item.previous, item)) {
				ctx.clearRect(item.previous.x, item.previous.y, item.previous.w, item.previous.h);
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

			var target = void 0;

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
}();

// Intersect
// Given two objects with, x,y,w,h properties
// Do their rectangular dimensions intersect?
// return Boolean true false.


exports.default = Collection;
function intersect(a, b) {
	return !(a.x > b.x + b.w || a.x + a.w < b.x || a.y > b.y + b.h || a.y + a.h < b.y);
}

function displaced(a, b) {
	return a.x !== b.x || a.y !== b.y || a.w !== b.w || a.h !== b.h;
}

},{"tricks/events/on":6}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // Shape
// CanvasShapes
// The parent object defining a basic shape, x,y,w,h, for starters.
// And basic operatings you might like to include on a shape


var _createEvent = require('tricks/events/createEvent');

var _createEvent2 = _interopRequireDefault(_createEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Shape = function () {
	function Shape() {
		_classCallCheck(this, Shape);

		// initieate  events
		this.events = [];

		// Set previous
		this.previous = {};

		if (arguments.length) {
			// Store the values
			this.position.apply(this, arguments);
		}
	}

	//	Set property listeners


	_createClass(Shape, [{
		key: 'remove',


		// Mark the shape as to be removed from the collection
		value: function remove() {
			this.dirty = true;
			this.visible = false;
		}
	}, {
		key: 'position',
		value: function position() {
			var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
			var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
			var w = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var h = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;


			// Assign, rectangle shape
			// Have a backup footprint
			this.positionObj({ x: x, y: y, w: w, h: h });
		}
	}, {
		key: 'positionObj',
		value: function positionObj(coords) {
			for (var coord in coords) {
				var value = coords[coord];
				var current = this['_' + coord];
				if (current !== value) {
					this.dirty = true;
					this['_' + coord] = value;
				}
			}
		}

		// Placeholder function for drawing to canvas

	}, {
		key: 'frame',
		value: function frame() {}
	}, {
		key: 'draw',
		value: function draw() {}
	}, {
		key: 'setup',
		value: function setup() {}

		// Events
		// Assign Events to be fired when the user clicks this object
		// Awesome

	}, {
		key: 'addEventListener',
		value: function addEventListener(eventName, callback) {
			if (!(eventName in this.events)) {
				this.events[eventName] = [];
			}
			this.events[eventName].push(callback);
		}
	}, {
		key: 'dispatchEvent',
		value: function dispatchEvent(e) {
			if (!(e.type in this.events)) {
				return;
			}
			this.events[e.type].forEach(function (fn) {
				return fn(e);
			});
		}

		// Assign getters and setters to default properties

	}, {
		key: '_watchProperty',
		value: function _watchProperty(propName) {
			Object.defineProperty(this, propName, {
				get: this._getter.bind(this, propName),
				set: this._setter.bind(this, propName)
			});
		}
	}, {
		key: '_getter',
		value: function _getter(propName) {
			return this['_' + propName];
		}
	}, {
		key: '_setter',
		value: function _setter(propName, v) {
			if (this['_' + propName] !== v) {
				this.dirty = true;
				this['_' + propName] = v;
			}
		}
	}, {
		key: 'x',
		get: function get() {
			return this._x;
		},
		set: function set(x) {
			this.positionObj({ x: x });
		}
	}, {
		key: 'y',
		get: function get() {
			return this._y;
		},
		set: function set(y) {
			this.positionObj({ y: y });
		}
	}, {
		key: 'w',
		get: function get() {
			return this._w;
		},
		set: function set(w) {
			this.positionObj({ w: w });
		}
	}, {
		key: 'h',
		get: function get() {
			return this._h;
		},
		set: function set(h) {
			this.positionObj({ h: h });
		}
	}, {
		key: 'dx',
		get: function get() {
			return this._dx;
		},
		set: function set(v) {
			if (this._dx !== v) {
				this.dirty = true;this._dx = v;
			}
		}
	}, {
		key: 'dy',
		get: function get() {
			return this._dy;
		},
		set: function set(v) {
			if (this._dy !== v) {
				this.dirty = true;this._dy = v;
			}
		}
	}, {
		key: 'visible',
		get: function get() {
			return this._visible === undefined ? true : this._visible;
		},
		set: function set(v) {
			if (this._visible !== v) {
				this.dirty = true;this._visible = v;
			}
		}
	}, {
		key: 'opacity',
		get: function get() {
			return this._opacity === undefined ? 1 : this._opacity;
		},
		set: function set(v) {
			if (this._opacity !== v) {
				this.dirty = true;this._opacity = v;
			}
		}
	}, {
		key: 'dirty',
		set: function set(v) {
			// Has this just been made dirty?
			if (!this._dirty && v) {
				// Mark as dirty
				this._dirty = v;

				// Trigger a canvas clean
				this.dispatchEvent((0, _createEvent2.default)('dirty'));
			} else if (!v) {
				// reset
				this._dirty = v;

				// Store the previous values
				this.previous = {
					x: this._x,
					y: this._y,
					w: this._w,
					h: this._h
				};
			}
		},
		get: function get() {
			return this._dirty;
		}

		// Let events bubble up

	}, {
		key: 'pointerEvents',
		get: function get() {
			return this._pointerEvents === undefined ? 1 : this._pointerEvents;
		},
		set: function set(v) {
			this._pointerEvents = v;
		}
	}]);

	return Shape;
}();

exports.default = Shape;

},{"tricks/events/createEvent":5}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _shape = require('./shape');

var _shape2 = _interopRequireDefault(_shape);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // text
// TextObject, defines a shape object which contains text.

var Text = function (_Shape) {
	_inherits(Text, _Shape);

	// Initiate a new shape object.
	function Text(text) {
		_classCallCheck(this, Text);

		// Watch the following properties for changes
		var _this = _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this));
		// initiate inheritance


		['text', 'shadowBlur', 'shadowColor', 'fillStyle', 'strokeStyle', 'textAlign', 'textBaseline', 'lineWidth'].forEach(_this._watchProperty.bind(_this));

		// Define text
		_this.text = text || '';

		_this.shadowColor = 'black';
		_this.fillStyle = 'black';
		_this.strokeStyle = 'white';
		_this.textAlign = 'left';
		_this.textBaseline = 'top';
		_this.lineWidth = 0;
		_this.align = 'left top';
		_this.fontSize = 30;
		return _this;
	}

	// Define the text and the alignment of the object


	_createClass(Text, [{
		key: 'calc',
		value: function calc(canvas) {
			var _align$split = this.align.split(' ');

			// Define text


			var _align$split2 = _slicedToArray(_align$split, 2);

			this.textAlign = _align$split2[0];
			this.textBaseline = _align$split2[1];


			var ctx = canvas.ctx;
			var fontSize = this.fontSize;

			// Split text by line breaks
			this.lines = this.text.toString().split('\n');

			// Which is the longest line?
			var _width = 0;
			var default_text = this.lines[0];

			this.lines.forEach(function (line) {
				var _w = ctx.measureText(line).width;
				if (_w > _width) {
					_width = _w;
					default_text = line;
				}
			});

			// Find the width and height of the item
			// Using the canvas context
			ctx.save();

			ctx.shadowColor = 'black';
			ctx.fillStyle = 'black';
			ctx.strokeStyle = 'rgba(255,255,255,0.5)';
			ctx.font = 'bold ' + fontSize + 'px Arial';

			while (ctx.measureText(default_text).width > canvas.width) {
				fontSize *= 0.9;
				fontSize = Math.round(fontSize);
				ctx.font = 'bold ' + fontSize + 'px Arial';
			}

			this.shadowBlur = ctx.shadowBlur = Math.round(fontSize / 10);
			this.fontSize = fontSize;
			this.font = ctx.font;

			this.w = ctx.measureText(default_text).width + this.shadowBlur * 2;
			this.h = (fontSize + this.shadowBlur * 2) * this.lines.length;

			ctx.restore();

			// Store style attributes
			// Store the new attributes of the text item
			this.lineWidth = Math.floor(fontSize / 60);

			// HEIGHT and WIDTH
			switch (this.textAlign) {
				case 'center':
				case 'middle':
					this.textAlign = 'center';
					this.x = canvas.width / 2 - this.w / 2;
					break;
				case 'left':
					this.x = 0;
					break;
				case 'right':
					this.x = canvas.width - this.w;
					break;
			}

			switch (this.textBaseline) {
				case 'center':
				case 'middle':
					this.textBaseline = 'middle';
					this.y = canvas.height / 2 - this.h / 2;
					break;
				case 'top':
					this.y = 0;
					break;
				case 'bottom':
					this.y = canvas.height - this.h;
					break;
			}

			this.textAlign = 'left';
			this.textBaseline = 'top';

			ctx.restore();
		}

		// Draw

	}, {
		key: 'draw',
		value: function draw(ctx) {
			var _this2 = this;

			ctx.save();

			ctx.globalAlpha = this.opacity;

			ctx.shadowColor = this.shadowColor;
			if (this.shadowBlur) {
				ctx.shadowBlur = this.shadowBlur;
			}
			ctx.fillStyle = this.fillStyle;
			ctx.strokeStyle = this.strokeStyle;
			ctx.font = this.font;

			ctx.textAlign = this.textAlign;
			ctx.textBaseline = this.textBaseline;
			ctx.lineWidth = this.lineWidth;

			if (this.lineWidth) {
				ctx.lineWidth = this.lineWidth;
			}

			this.lines = this.text.toString().split('\n');

			var len = this.lines.length;

			this.lines.forEach(function (item, index) {
				var y = _this2.y + (_this2.h ? index * (_this2.h / len) : 0);

				ctx.fillText(item, _this2.x, y);
				if (_this2.strokeStyle) {
					ctx.strokeText(item, _this2.x, y);
				}
			});

			ctx.restore();
		}
	}]);

	return Text;
}(_shape2.default);

exports.default = Text;

},{"./shape":13}],15:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _canvas = require('./classes/canvas');

var _canvas2 = _interopRequireDefault(_canvas);

var _collection = require('./classes/collection');

var _collection2 = _interopRequireDefault(_collection);

var _shape = require('./classes/shape');

var _shape2 = _interopRequireDefault(_shape);

var _text = require('./classes/text');

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // mineField, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas


// Create a new scribble
// Arguments handled by parent
var Brush = function (_Shape) {
	_inherits(Brush, _Shape);

	function Brush() {
		var _ref;

		_classCallCheck(this, Brush);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		// A collection of x, y points
		var _this = _possibleConstructorReturn(this, (_ref = Brush.__proto__ || Object.getPrototypeOf(Brush)).call.apply(_ref, [this].concat(args)));

		_this.points = [];

		_this.push.apply(_this, args);
		return _this;
	}

	// Add
	// Add a new point to the brushes path


	_createClass(Brush, [{
		key: 'push',
		value: function push(x, y) {

			this.dirty = true;
			this.points.push([x, y]);

			// width
			if (x < this.x) {
				this.w = this.w + (this.x - x);
				this.x = x;
			} else if (x > this.x + this.w) {
				this.w = x - this.x;
			}
			// height
			if (y < this.y) {
				this.h = this.h + (this.y - y);
				this.y = y;
			} else if (y > this.y + this.h) {
				this.h = y - this.y;
			}
		}

		// Draw the line

	}, {
		key: 'draw',
		value: function draw(ctx) {
			// Loop through all the points and draw the line
			ctx.beginPath();
			var point = this.points[0];
			ctx.moveTo(point[0], point[1]);
			this.points.forEach(function (point) {
				return ctx.lineTo(point[0], point[1]);
			});
			ctx.stroke();
		}
	}]);

	return Brush;
}(_shape2.default);

var brush = null;

var canvas = new _canvas2.default();

var collection = new _collection2.default(canvas.target);

var text = new _text2.default();
text.text = 'Drawing Pad';
text.align = 'center center';
text.fontSize = 150;
text.fillStyle = 'rgba(0,0,0,0.03)';
text.strokeStyle = 'rgba(255,255,255,0.03)';
text.calc(canvas);

canvas.addEventListener('frame', function () {
	hideText();

	// Draw
	collection.prepare();

	// Draw
	collection.draw();
});

function hideText() {

	// Has the user started?
	if (brush) {
		if (text.opacity > 0.1) {
			text.opacity *= 0.9;
		} else {
			text.opacity = 0;
		}
	}
}

collection.push(text);

function pointStart(e) {

	brush = new Brush(e.offsetX, e.offsetY);
	collection.push(brush);
}

function pointEnd() {
	brush = null;
}

canvas.addEventListener('touchstart', pointStart);
canvas.addEventListener('touchend', pointEnd);
canvas.addEventListener('touchmove', move);

canvas.addEventListener('mousedown', pointStart);
canvas.addEventListener('mouseup', pointEnd);
canvas.addEventListener('mousemove', move);

canvas.addEventListener('resize', function () {
	return canvas.clean(true);
});

// Move
// Depending on the event
function move(e) {
	// is mousedown?
	if (brush) {
		brush.push(e.offsetX, e.offsetY);
	}
}

},{"./classes/canvas":11,"./classes/collection":12,"./classes/shape":13,"./classes/text":14}]},{},[15])

//# sourceMappingURL=drawingPad.js.map
