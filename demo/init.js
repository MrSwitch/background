// Install background
const background = window.background || [];
let bg;

// Push a function to call
background.push(BG => {
	// Passing in null for target inserts it into the body background
	// Defaults to the only background stage added.
	bg = BG.init(null);

	// Set default state
	bg.setup();
});
