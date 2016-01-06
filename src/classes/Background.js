// Background
// Exposes the basic properties/methods of a controllable background

import Queue from '../utils/object/Queue';

// Extract the window.background items
let queue = window.background = new Queue(window.background);

function queueHandler(callback) {
	// Each item in the queue should be a function
	callback(Background);
}

export default class Background {

	static add(stage) {
		// Store the
		Background.stages.push(stage);

		// Trigger ready if it has not already been set
		if (Background.stages.length === 1) {
			// Initiate the queue
			queue.handler = queueHandler;
		}
	}

	// Create a new instance of a stage
	static init(target) {
		// Get the default stage which has been registered with this class
		let stage = Background.stages[0];

		// Return instance
		if (stage) {
			return new stage(target);
		}
	}
}

Background.stages = [];
