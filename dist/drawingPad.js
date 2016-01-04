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

var _utilsEventsUserinitiated = require('../utils/events/userinitiated');

var _utilsEventsUserinitiated2 = _interopRequireDefault(_utilsEventsUserinitiated);

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
		if (!("getContext" in document.createElement('canvas'))) {
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
				canvas.style.cssText = "position:fixed;z-index:-1;top:0;left:0;";
				canvas.setAttribute('tabindex', 0);

				document.documentElement.style.cssText = "min-height:100%;";
				document.body.style.cssText = "min-height:100%;";

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
		if (parent === document.body && canvas.style.getPropertyValue('z-index') === "-1") {
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

			this._fps++;

			var now = new Date().getTime();

			if (now - this._time > 1000) {
				console.log('fps: %d', this._fps);
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

},{"../utils/events/createDummyEvent":6,"../utils/events/createEvent":7,"../utils/events/userinitiated":8,"../utils/support/requestAnimationFrame":9}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
// Shape
// CanvasShapes
// The parent object defining a basic shape, x,y,w,h, for starters.
// And basic operatings you might like to include on a shape
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsEventsCreateEvent = require('../utils/events/createEvent');

var _utilsEventsCreateEvent2 = _interopRequireDefault(_utilsEventsCreateEvent);

var Shape = (function () {
	function Shape() {
		_classCallCheck(this, Shape);

		// initieate  events
		this.events = [];

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		if (args.length) {
			// Store the values
			this.position.apply(this, args);
		}
	}

	//	Set property listeners

	_createClass(Shape, [{
		key: 'position',
		value: function position() {
			var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
			var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
			var w = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
			var h = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

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
		set: function set(v) {
			if (this._x !== v) {
				this.dirty = true;this._x = v;
			}
		}
	}, {
		key: 'y',
		get: function get() {
			return this._y;
		},
		set: function set(v) {
			if (this._y !== v) {
				this.dirty = true;this._y = v;
			}
		}
	}, {
		key: 'w',
		get: function get() {
			return this._w;
		},
		set: function set(v) {
			if (this._w !== v) {
				this.dirty = true;this._w = v;
			}
		}
	}, {
		key: 'h',
		get: function get() {
			return this._h;
		},
		set: function set(v) {
			if (this._h !== v) {
				this.dirty = true;this._h = v;
			}
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
				this.dispatchEvent((0, _utilsEventsCreateEvent2['default'])('dirty'));
			} else if (!v) {
				// reset
				this._dirty = v;
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
})();

exports['default'] = Shape;
module.exports = exports['default'];

},{"../utils/events/createEvent":7}],4:[function(require,module,exports){
// text
// TextObject, defines a shape object which contains text.

'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _shape = require('./shape');

var _shape2 = _interopRequireDefault(_shape);

var Text = (function (_Shape) {
	_inherits(Text, _Shape);

	// Initiate a new shape object.

	function Text(text) {
		_classCallCheck(this, Text);

		// initiate inheritance
		_get(Object.getPrototypeOf(Text.prototype), 'constructor', this).call(this);

		// Watch the following properties for changes
		['text', 'shadowBlur', 'shadowColor', 'fillStyle', 'strokeStyle', 'textAlign', 'textBaseline', 'lineWidth'].forEach(this._watchProperty.bind(this));

		// Define text
		this.text = text || '';

		this.shadowColor = "black";
		this.fillStyle = "black";
		this.strokeStyle = "white";
		this.textAlign = 'left';
		this.textBaseline = 'top';
		this.lineWidth = 0;
		this.align = 'left top';
		this.fontSize = 30;
	}

	// Define the text and the alignment of the object

	_createClass(Text, [{
		key: 'calc',
		value: function calc(canvas) {
			var _align$split = this.align.split(" ");

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

			ctx.shadowColor = "black";
			ctx.fillStyle = "black";
			ctx.strokeStyle = "rgba(255,255,255,0.5)";
			ctx.font = fontSize + "px Arial bold";

			while (ctx.measureText(default_text).width > canvas.width) {
				fontSize *= 0.9;
				fontSize = Math.round(fontSize);
				ctx.font = fontSize + "px Arial bold";
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
				case "center":
				case "middle":
					this.textAlign = "center";
					this.x = canvas.width / 2 - this.w / 2;
					break;
				case "left":
					this.x = 0;
					break;
				case "right":
					this.x = canvas.width - this.w;
					break;
			}

			switch (this.textBaseline) {
				case "center":
				case "middle":
					this.textBaseline = "middle";
					this.y = canvas.height / 2 - this.h / 2;
					break;
				case "top":
					this.y = 0;
					break;
				case "bottom":
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
			var _this = this;

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
				var y = _this.y + (_this.h ? index * (_this.h / len) : 0);

				ctx.fillText(item, _this.x, y);
				if (_this.strokeStyle) {
					ctx.strokeText(item, _this.x, y);
				}
			});

			ctx.restore();
		}
	}]);

	return Text;
})(_shape2['default']);

exports['default'] = Text;
module.exports = exports['default'];

},{"./shape":3}],5:[function(require,module,exports){
// mineField, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _classesCanvas = require('./classes/canvas');

var _classesCanvas2 = _interopRequireDefault(_classesCanvas);

var _classesCollection = require('./classes/collection');

var _classesCollection2 = _interopRequireDefault(_classesCollection);

var _classesShape = require('./classes/shape');

var _classesShape2 = _interopRequireDefault(_classesShape);

var _classesText = require('./classes/text');

var _classesText2 = _interopRequireDefault(_classesText);

// Create a new scribble
// Arguments handled by parent

var Brush = (function (_Shape) {
	_inherits(Brush, _Shape);

	function Brush() {
		_classCallCheck(this, Brush);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		_get(Object.getPrototypeOf(Brush.prototype), 'constructor', this).apply(this, args);

		// A collection of x, y points
		this.points = [];

		this.push.apply(this, args);
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
})(_classesShape2['default']);

var canvas = new _classesCanvas2['default']();

var collection = new _classesCollection2['default'](canvas.target);

var text = new _classesText2['default']();
text.text = 'Drawing Pad';
text.align = 'center center';
text.fontSize = 150;
text.fillStyle = 'rgba(0,0,0,0.03)';
text.strokeStyle = 'rgba(255,255,255,0.03)';
text.calc(canvas);

canvas.addEventListener('frame', function (e) {
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
};

collection.push(text);

var brush = null,
    mousedown = false;

function pointStart(e) {

	brush = new Brush(e.offsetX, e.offsetY);
	collection.push(brush);
	mousedown = true;
}

function pointEnd() {
	brush = null;
	mousedown = false;
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

},{"./classes/canvas":1,"./classes/collection":2,"./classes/shape":3,"./classes/text":4}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
// Was the current event userInitiated?
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

exports['default'] = function () {
	var e = arguments.length <= 0 || arguments[0] === undefined ? window.event : arguments[0];

	if (!e || typeof e !== 'object') {
		return false;
	}
	return !!('which' in e ? e.which : 'button' in e);
};

module.exports = exports['default'];

},{}],9:[function(require,module,exports){
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

},{}]},{},[5])


//# sourceMappingURL=../dist/drawingPad.js.map