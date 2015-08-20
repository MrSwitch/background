// Setup
// This constructs the canvas object

// Includes
import '../polyfills/requestAnimationFrame';

export default class Canvas{

	constructor(canvas) {

		var parent;

		// events
		this.events = {};

		// Set the collection to be empty
		this.collection = [];

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

			// Not a parent
			if (!parent) {
				// Append to the body
				parent = document.body;
				canvas.style.cssText = "position:fixed;z-index:-1;top:0;left:0;";
				canvas.setAttribute('tabindex',0);

				document.documentElement.style.cssText = "min-height:100%;";

				// Bind window resize events
				window.addEventListener('resize', this.resize.bind(this));
			}

			// Append this element
			parent.insertBefore(canvas, parent.firstElementChild);

			this.canvas = canvas;

			this.resize();
		}
		else{
			this.canvas = canvas;
		}

		this.ctx = canvas.getContext('2d');

		// ensure its keeping up.
		this.width=canvas.width;
		this.height=canvas.height;

		// Initiate the draw
		this.draw();

		// Bind events
		CanvasListeners.call(this, ['click', 'mousedown', 'mouseup', 'mouseover', 'mousemove','mouseout', 'touchmove','touchstart','touchend']);

		// listen to changes
		
	}

	resize() {
		var parent = (this.canvas.parentNode === document.body) ? document.documentElement : this.canvas.parentNode;
		var height = parent.offsetHeight;
		var width = parent.offsetWidth;
		var changed = false;

		if (this.width !== width) {
			changed = true;
			this.canvas.width = width;
			this.width = width;
		}
		if (this.height !== height) {
			changed = true;
			this.canvas.height = height;
			this.height = height;
		}

		if (changed) {
			this.dispatchEvent({type:'resize'});
		}
	}

	push(item) {
		item.dirty = true;
		item.setup(this);
		this.collection.push(item);
	}

	// Touch
	// Mark items and objects in the same space to be redrawn
	clean(enforce) {
		this.collection.forEach((item) => {
			if (enforce || item.dirty)
				this.cleanItem(item);
		});
	}

	// Clean Item
	cleanItem(item) {

		// Mark this item as dirty
		item.dirty = true;

		// Remove from Canvas
		this.ctx.clearRect(item.x, item.y, item.w, item.h);

		// If the items old position is different
		var shifted = displaced(item.past, item);
		if (shifted) {
			this.ctx.clearRect(item.past.x, item.past.y, item.past.w, item.past.h);
		}

		// Loop though objects and redraw those that exist within the position
		this.collection.forEach((obj) => {

			// Does this Object overlap with the focused object?
			if (!obj.dirty && (intersect(obj, item) || (shifted ? intersect(obj, item.past) : false))) {

				// Nested clean
				this.cleanItem(obj);
			}
		});
	}

	// Placeholder for the frame function
	frame() {}

	// Trigger the draw function
	draw() {

		// Call the frame function in the context of the frame to draw
		this.frame(this);

		// Find items that have changed
		// Remove background
		this.collection.forEach((item) => {

			item.frame(this);

			if (item.dirty) {
				if (item.visible) {
					item.draw(this);
				}
				item.dirty = false;
			}
		});

		requestAnimationFrame(this.draw.bind(this));
	}

	// The user has clicked an item on the page
	addEventListener(eventname, handler) {

		// Add to the events list
		if (!(eventname in this.events)) {
			this.events[eventname] = [];
		}

		this.events[eventname].push(handler);
	}

	// Dispatch
	dispatchEvent(e) {
		if (e.type in this.events)
			this.events[e.type].forEach((handler) => handler(e));
	}
}


// Intersect
// Given two objects with, x,y,w,h properties
// Do their rectangular dimensions intersect?
// return Boolean true false.
function intersect(a,b){
	return !( a.x>(b.x+b.w) ||
	(a.x+a.w)<b.x  ||
	a.y>(b.y+b.h) ||
	(a.y+a.h)<b.y );
}

function displaced(a,b) {
	return (a.x !== b.x ||
	a.y !== b.y ||
	a.w !== b.w ||
	a.h !== b.h);
}

class CanvasEvent{
	constructor (e) {
		this.type = e.type;
		this.originalEvent = e;	
		this.target = null;

		let _e = e;
		// determine which elements in the collection are at this point
		if (e.touches) {
			_e = e.touches[0];
		}

		this.clientX = _e.clientX - e.target.clientLeft;
		this.clientY = _e.clientY - e.target.clientTop;
	}
	preventDefault(){}
}


function CanvasListeners(events) {

	// Self
	var self = this;

	events.forEach((eventname) => {

		// Bind an event to the canvas
		self.canvas.addEventListener(eventname, (_e) => {

			// This was in the background
			if (_e.target !== self.canvas) {
				return;
			}

			// Clone the event
			var e = new CanvasEvent(_e);

			// Find the canvas item which this targets?
			var obj = {
				x: e.clientX,
				y: e.clientY,
				w: 1,
				h: 1
			};

			self.collection.forEach((item) => {

				if (!item.visible || !item.w || !item.h) {
					return;
				}

				// Is this a target?
				var bool = intersect(obj, item);

				if (bool) {
					// Define this as a target
					e.target = item;

					// Does the element have any event listeners?
					if ((e.type in item.events)) {
						item.dispatchEvent(e);
					}
				}
			});

			// Lastly dispatch the event on the canvas instance
			self.dispatchEvent(e);

		});
	});
}