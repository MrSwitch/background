// Setup
// This constructs the canvas object

// Includes
import '../polyfills/requestAnimationFrame';

// Constants
const BACKGROUND_HASH = 'background';
const UserEvents = ['click', 'mousedown', 'mouseup', 'mouseover', 'mousemove','mouseout', 'touchmove','touchstart', 'touchend', 'frame', 'resize'];

export default class Canvas{

	constructor(canvas) {

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
		}
		else{
			this.target = canvas;
		}

		this.ctx = canvas.getContext('2d');

		// Initiate the draw
		this.draw();

		// Bind events
		UserEvents.forEach((eventname) => this.target.addEventListener(eventname, this.dispatchEvent.bind(this)));


		{
			// HASH CHANGE DEPTH
			// Listen to changes to the background hash to bring the canvas element to the front
			window.addEventListener('hashchange', hashchange.bind(this));

			let INITIAL_ZINDEX = this.target.style.getPropertyValue('z-index');

			function hashchange() {

				var z = INITIAL_ZINDEX;

				if (window.location.hash === '#'+BACKGROUND_HASH) {
					z = 10000;
				}

				if (z !== undefined) {
					// Set the z-Index
					this.target.style.setProperty('z-index', z);
				}
				else {
					// Remove the z-Index
					this.target.style.removeProperty('z-index');
				}
			}

			hashchange.call(this);
		}

	}

	// ensure its keeping up.
	get width() {
		return this.target.width;
	}
	set width(value) {
		return this.target.width = value;
	}

	get height() {
		return this.target.height;
	}
	set height(value) {
		return this.target.height = value;
	}


	resize() {
		var parent = (this.target.parentNode === document.body) ? document.documentElement : this.target.parentNode;
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
			this.target.dispatchEvent(new Event('resize'));
		}
	}

	// Bring the content of the canvas to the front
	bringToFront() {

		// Update the window.location with the hash #background
		window.location.hash = BACKGROUND_HASH;
	}

	// Trigger the draw function
	draw() {

		// Call the frame function in the context of the frame to draw
		this.target.dispatchEvent(new Event('frame'));

		// Request another frame
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

		if (e.type in this.events) {

			// This was in the background
			if (e.target !== this.target) {
				return;
			}

			this.events[e.type].forEach((handler) => handler(e));
		}
	}
}
