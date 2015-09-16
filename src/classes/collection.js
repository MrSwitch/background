// Collection

const UserEvents = ['click', 'mousedown', 'mouseup', 'mouseover', 'mousemove','mouseout', 'touchmove','touchstart', 'touchend', 'frame'];

export default class Collection{

	constructor(target) {
		// Create an empty children
		this.children = [];

		// Events
		this.events = [];

		// setup the canvas element
		this.init(target);
	}

	// listen to canvas events
	init (target) {

		// Define the canvas object as the target for the collection
		this.target = target;

		// Define the CTX
		this.ctx = target.getContext('2d');

		// listen to user interactive events and trigger those on items
		UserEvents.forEach((eventname) => target.addEventListener(eventname, this._findAndDispatch.bind(this)));

	}

	push(item) {
		item.dirty = true;

		// Is this item already in the collection?
		if (this.children.indexOf(item) === -1) {
			item.setup(this);

			// item.addEventListener('dirty', this.prepareChild.bind(this, item));
			this.children.push(item);
		}
	}

	get length () {
		return this.children.length;
	}
	set length (v) {
		return this.children.length = v;
	}


	// Touch
	// Mark items and objects in the same space to be redrawn
	prepare() {
		this.children.forEach((item) => {
			if (item.dirty)
				this.prepareChild(item);
		});
	}

	// Clean Item
	prepareChild(item) {

		let ctx = this.ctx;

		// Mark this item as dirty
		item.dirty = true;

		// Remove from Canvas
		ctx.clearRect(item.x, item.y, item.w, item.h);

		// If the items old position is different
		if (displaced(item.past, item)) {
			ctx.clearRect(item.past.x, item.past.y, item.past.w, item.past.h);
		}

		// Loop though objects and redraw those that exist within the position
		this.children.forEach( this._prepareSiblings.bind(this, item));
	}

	_prepareSiblings(item, sibling) {

		// Does this Object overlap with the focused object?
		if (!sibling.dirty && (intersect(sibling, item) || (item.past ? intersect(sibling, item.past) : false))) {

			// Nested clean
			this.prepareChild(sibling);
		}
	}

	sort() {
		// Sort items by z-index
		this.children.sort((a, b) => {
			a = a.zIndex || 0;
			b = b.zIndex || 0;
			return +(a > b) || -(a < b);
		});
	}

	// Trigger the draw function
	draw() {

		let ctx = this.ctx;

		// Find items that have changed
		// Remove background
		this.children.forEach((item) => {

			item.frame(ctx);

			if (item.dirty) {
				if (item.visible) {
					item.draw(ctx);
				}
			}
		});

		// Mark all as undirty
		this.children.filter((item) => item.dirty).forEach((item) => item.dirty = false );
	}

	elementFromPoint(x, y) {

		var target;

		// Find the canvas item which this targets?
		var obj = {
			x: x,
			y: y,
			w: 1,
			h: 1
		};

		this.children.forEach((item) => {

			if (!item.visible || !item.w || !item.h || !item.pointerEvents) {
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

	// Find and _dispatch
	_findAndDispatch(e) {
		// If this is not a pointerEvent lets just pass it through.
		if (e instanceof MouseEvent || e instanceof TouchEvent) {

			// Find the canvas item which this targets?
			var obj = {
				x: e.offsetX,
				y: e.offsetY,
				w: 1,
				h: 1
			};

			this.children.forEach((item) => {

				if (!item.visible || !item.w || !item.h || !item.pointerEvents) {
					return;
				}

				// Intersects?
				intersect(obj, item) && item.dispatchEvent(e);
			});
		}
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
