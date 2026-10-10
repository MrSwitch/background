// Background
// Exposes the basic properties/methods of a controllable background

import Queue from 'tricks/object/Queue';

type BackgroundCallback = (background: typeof Background) => void;

type StageConstructor = new (target?: HTMLElement) => unknown;

declare global {
	interface Window {
		background?: Queue | BackgroundCallback[];
	}
}

// Extract the window.background items
const queue = window.background = new Queue(window.background, undefined);

function queueHandler(callback: BackgroundCallback) {
	// Each item in the queue should be a function
	callback(Background);
}

export default class Background {

	static stages: StageConstructor[] = [];

	static add(stage: StageConstructor) {
		// Store the
		Background.stages.push(stage);

		// Trigger ready if it has not already been set
		if (Background.stages.length === 1) {
			// Initiate the queue
			queue.handler = queueHandler;
		}
	}

	// Create a new instance of a stage
	static init(target?: HTMLElement) {
		// Get the default stage which has been registered with this class
		const stage = Background.stages[0];

		// Return instance
		if (stage) {
			return new stage(target);
		}
	}
}
