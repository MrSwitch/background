// Install background
var background = window.background || [];
var bg;

// Push a function to call
background.push(function(BG) {
	// Passing in null for target inserts it into the body background
	// Defaults to the only background stage added.
	bg = BG.init(null);

	// Set default state
	bg.setup();
});
