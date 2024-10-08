// Setup
// This constructs the canvas object

// Includes
import 'tricks/support/requestAnimationFrame';
import createEvent from 'tricks/events/createEvent';
import createDummyEvent from 'tricks/events/createDummyEvent';
import on from 'tricks/events/on';
import swipe from 'tricks/events/swipe';

// Constants
const BACKGROUND_HASH = 'background';
const UserEvents = ['click', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout', 'frame', 'resize', 'keydown'];
const TouchEvents = ['touchmove', 'touchstart', 'touchend'];

const EVENT_SEPARATOR = /[\s,]+/;

export default class Canvas {

	// Construct the Canvas Element
	// @param canvas should be an root element container for this imagery.
	constructor(canvas) {

		let parent;

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
		}
		else {
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
		on(this.target, UserEvents.toString(), this.dispatchEvent.bind(this), {passive: true});

		// Format Touch events
		on(this.target, TouchEvents.toString(), this.dispatchTouchEvent.bind(this), {passive: true});

		// In IE user-events aren't propagated to elements which have negative z-Index's
		// Listen to events on the document element and propagate those accordingly
		if (parent === document.body && canvas.style.getPropertyValue('z-index') === '-1') {
			// Bind events
			on(document, UserEvents.toString(), this.dispatchEvent.bind(this), {passive: true});

			// Format Touch events
			on(document, TouchEvents.toString(), this.dispatchTouchEvent.bind(this), {passive: true});
		}

		// Listen to hashChange events
		{
			// HASH CHANGE DEPTH
			const style = this.target.style;
			const initialZ = style.getPropertyValue('z-index');
			// Listen to changes to the background hash to bring the canvas element to the front
			window.addEventListener('hashchange', hashchange.bind(style, initialZ));

			hashchange.call(style, initialZ);
		}

		// Is there a swipe method handler
		if (this.swipe) {
			// Bind the swipe event handler to the event
			swipe(this.target, this.swipe.bind(this));
		}
	}

	// ensure its keeping up.
	get width() {
		return this.target.width;
	}
	set width(value) {
		this.target.width = value;
	}

	get height() {
		return this.target.height;
	}
	set height(value) {
		this.target.height = value;
	}
	get fps() {
		return this._fps;
	}
	set fps(value) {

		this._fps = value;

		const now = (new Date()).getTime();

		if ((now - this._time) > 1000) {
			// console.log('fps: %d', this._fps);
			this._time = now;
			this._fps = 0;
		}
	}


	resize() {
		const parent = (this.target.parentNode === document.body) ? document.documentElement : this.target.parentNode;
		const height = parent.clientHeight;
		const width = parent.clientWidth;
		let changed = false;

		if (this.width !== width) {
			changed = true;
			this.width = width;
		}
		if (this.height !== height) {
			changed = true;
			this.height = height;
		}

		if (changed) {
			this.target.dispatchEvent(createEvent('resize'));
		}
	}

	clear() {
		this.ctx.clearRect(0, 0, this.target.width, this.target.height);
	}

	// Bring the content of the canvas to the front
	bringToFront() {

		// Update the window.location with the hash #background
		window.location.hash = BACKGROUND_HASH;
	}

	// Trigger the draw function
	draw() {

		// Increment the number of frames
		this.fps++;

		// Call the frame function in the context of the frame to draw
		this.target.dispatchEvent(createEvent('frame'));

		// Request another frame
		requestAnimationFrame(this.draw.bind(this));
	}

	// The user has clicked an item on the page
	addEventListener(eventnames, handler) {

		eventnames.split(EVENT_SEPARATOR).forEach(eventname => {
			// Add to the events list
			if (!(eventname in this.events)) {
				this.events[eventname] = [];
			}

			this.events[eventname].push(handler);
		});
	}

	// Dispatch
	dispatchEvent(e) {

		if (e.type in this.events) {

			const target = e.currentTarget;

			// This was triggered using event delegation, aka in the background
			if (target === document) {

				e = createDummyEvent({
					type: e.type,
					target: this.target,
					offsetX: e.pageX || e.offsetX,
					offsetY: e.pageY || e.offsetY
				});
			}

			this.events[e.type].forEach(handler => handler(e));
			e.stopPropagation();
		}
	}

	// Dispatch
	dispatchTouchEvent(e) {
		// If this was a touch event
		// Determine the offset to the canvas element relative to the item being clicked
		const touch = (e.touches || e.changedTouches)[0];
		if (touch) {
			e.offsetX = Math.abs(touch.pageX || touch.screenX);
			e.offsetY = Math.abs(touch.pageY || touch.screenY);
		}

		this.dispatchEvent(e);
	}
}


function hashchange(z) {

	const zIndex = 'z-index';

	if (window.location.hash === `#${ BACKGROUND_HASH}`) {
		z = 10000;
	}

	if (z !== undefined) {
		// Set the z-Index
		this.setProperty(zIndex, z);
	}
	else {
		// Remove the z-Index
		this.removeProperty(zIndex);
	}
}
