// Background
// Exposes the basic properties/methods of a controllable background

// Extract the window.background items
var _callbacks = (Array.isArray(window.background) ? window.background : []);
var callbacks = [];
var stages = [];

export default class Background {

	static push(cb) {

		// Return callback with an instance of this Object
		if (stages.length) {
			cb(Background);
		}
		else {
			callbacks.push(cb);
		}
	}

	static ready() {
		callbacks.forEach((item) => {
			Background.push(item);
		});
		callbacks.length = 0;
	}

	static add(stage) {
		// Store the
		stages.push(stage);

		// Trigger ready if it has not already been set
		if (stages.length === 1) {
			Background.ready();
		}
	}

	// Create a new instance of a stage
	static init(target) {
		// Get the default stage which has been registered with this class
		let stage = stages[0];

		// Return instance
		if (stage) {
			return new stage(target);
		}
	}
}

// Execute the current callbacks
_callbacks.forEach((item) => {
	Background.push(item);
});
_callbacks.length = 0;

// Define the background on the window
// This is a rudimentary service which works...
window.background = Background;
