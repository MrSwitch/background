// ColorFlood, Canvas animation
// Copyright Andrew Dodson, March 2013.
// Refactored in 2015

// Get Canvas
import Canvas from './classes/canvas';
import Collection from './classes/collection';
import Text from './classes/text';
import Background from './classes/background';
import extend from './utils/object/extend';

// Create a new tile
// Arguments handled by parent
class Tile {

	constructor(x, y, w, h) {

		// Parent Object
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		// Capture the grid position
		this.grid = new Uint8Array(2);

		var index = Math.floor(Math.random() * palate.length);
		if (index === palate.length) {
			index--;
		}

		this.colorIndex = index;
		this.fillStyle = palate[this.colorIndex];
		this.flooded = false; // is this tile caught
	}

	// Each function passed into the collection must have a draw function
	draw(ctx) {
		ctx.fillStyle = this.fillStyle;
		ctx.fillRect(this.x, this.y, this.w, this.h);
	}
}

var palate = ['red', 'green', 'orange', 'blue', 'white', 'black'];

class Stage {

	constructor(target) {

		// Initiate the canvas in the base
		this.canvas = new Canvas(target);

		// Collection
		// Define the canvas start element
		this.collection = new Collection(this.canvas.target);

		// Tiles
		this.tiles = [];

		// Add listeners to the canvas Element
		this.canvas.addEventListener('frame', () => {

			// On every frame
			// Prepare dirty areas
			this.collection.prepare();

			// Draw marked items
			this.collection.draw();
		});

		// Initiate
		init.call(this);
	}

	setup(options) {

		// Set the options
		this.config(options);

		// Setup
		setup.call(this);
	}

	config(options) {

		// Merge the current options
		extend(this.options, options);

		// Show Controls
		showControls.call(this);
	}
}


// Add Stage to the background
Background.add(Stage);


function init() {

// Show text
this.options = {
	controls: true
};

// Add a text Object
// We only have one text Object on the screen at a time, lets reuse it.
let title = new Text();
title.text = 'Flood It';
title.fontSize = 150;
title.align = 'center center';
title.calc(this.canvas);
this.title = title;

let credits = new Text();
credits.text = 'Ended';
credits.zIndex = 1;
credits.fontSize = 150;
credits.align = 'center center';
credits.visible = false;
credits.addEventListener('click', setup.bind(this));
this.credits = credits;

// Help
let info = new Text();
info.text = 'Start in the top left corner\nFlood tiles by color\nIn as few moves as possible';
info.zIndex = 1;
info.align = 'center center';
info.fontSize = 40;
info.calc(this.canvas);
this.info = info;


let score = new Text();
score.zIndex = 1;
score.align = 'right bottom';
score.pointerEvents = false;
score.fontSize = 40;
this.score = score;

// Is this playing as a background image?
// We want to display a button to enable playing in full screen.
let playBtn = new Text();
playBtn.text = '►';
playBtn.zIndex = 1;
playBtn.align = 'left top';
playBtn.fontSize = 40;
playBtn.addEventListener('click', setup.bind(this));
playBtn.calc(this.canvas);
this.playBtn = playBtn;


// Rebuild the board on resize
this.canvas.addEventListener('resize', setup.bind(this));

// User has clicked an item on the canvas
// We'll use event delegation to tell us what the user has clicked.
this.canvas.addEventListener('click', (e) => {

	// Get the item at the click location
	var target = this.collection.elementFromPoint(e.offsetX, e.offsetY);

	// Tile Clicked
	if (target.constructor.name === 'Tile') {
		play.call(this, target);
	}

	// hide title
	if (this.title.visible) {
		this.title.visible = false;
		this.title.dirty = true;
	}

	// Has the game state changed?
	if (this.flooded >= this.tiles.length && this.clicks < this.max_tries) {
		this.credits.text = `Kudos! ${this.clicks + 1} moves`;
		this.credits.visible = true;
		this.credits.calc(this.canvas);
		this.info.visible = false;
		this.score.visible = false;

		this.credits.dirty = true;
		this.info.dirty = true;
		this.score.dirty = true;
	}
	else if (++this.clicks >= this.max_tries) {
		this.credits.text = 'Game over!';
		this.credits.visible = true;
		this.credits.calc(this.canvas);
		this.info.visible = true;
		this.score.visible = false;

		this.credits.dirty = true;
		this.info.dirty = true;
		this.score.dirty = true;
	}
	else {
		this.score.text = `${this.clicks}/${this.max_tries}`;
		if (!this.score.visible) {
			this.score.visible = true;
			this.score.dirty = true;
		}
		this.score.calc(this.canvas);

		// Hide others if need be...
		if (this.credits.visible) {
			this.credits.visible = false;
			this.credits.dirty = true;
		}
		if (this.info.visible) {
			this.info.visible = false;
			this.info.dirty = true;
		}
	}
});
}

function setup() {
	// Remove everything
	this.collection.length = 0;
	this.tiles.length = 0;

	this.clicks = 0;
	this.selectedColor = null;
	this.flooded = 1;

	// Define type size
	// set tile default Width and height
	let w = 50;
	let h = 50;

	// set number of tiles horizontally and vertically
	this.nx = Math.floor(this.canvas.width / w);
	this.ny = Math.floor(this.canvas.height / h);

	this.max_tries = this.nx + this.ny;

	// Do the tiles not perfectly fit the space?
	// split the difference between the tiles, adding to the widths and heights
	w += Math.floor((this.canvas.width % (this.nx * w)) / this.nx);
	h += Math.floor((this.canvas.height % (this.ny * h)) / this.ny);

	// Create tiles
	for (var y = 0; y < this.ny; y++) {
		for (var x = 0; x < this.nx; x++) {

			var tile = new Tile(x * w, y * h, w - 1, h - 1);
			this.tiles.push(tile);
			this.collection.push(tile);
			tile.grid = [x, y];
		}
	}

	// Write message
	this.info.y = this.title.y + this.title.h;

	// Add text items
	this.collection.push(this.title);
	this.collection.push(this.info);
	this.collection.push(this.credits);
	this.collection.push(this.playBtn);
	this.collection.push(this.score);

	// Starting state
	// Select the first tile, (top left corner)
	// Mark as flooded
	this.tiles[0].flooded = true;

	// Flood its neighbouring tiles on start
	play.call(this, this.tiles[0]);

	// Sort the collection by z-index this ensures everything is drawn in the right order
	this.collection.sort();
}


function play(tileSelected) {

	if (!tileSelected) {
		return;
	}

	this.selectedColor = tileSelected.colorIndex;

	// Trigger Flooding
	this.tiles.forEach((tile) => {
		if (tile.flooded) {
			flood.call(this, tile);
		}
	});
}

// Flood this tile with the new colour and its neighbours with the same colour
function flood(tile) {

	var [x, y] = tile.grid;

	tile.colorIndex = this.selectedColor;
	tile.fillStyle = palate[this.selectedColor];

	// Mark this as needing to be redrawn
	tile.dirty = true;

	// find all tiles next to this one.
	var edgeTiles = [
		(Math.max(y - 1, 0) * this.nx) + x,
		(y * this.nx) + Math.min(x + 1, this.nx - 1),
		((Math.min(y + 1, this.ny - 1)) * this.nx) + x,
		(y * this.nx) + Math.max(x - 1, 0)
	];

	edgeTiles.forEach((edge) => {
		var tile = this.tiles[edge];
		if (edge > 0 && tile) {
			if (tile.colorIndex === this.selectedColor && !tile.flooded) {
				tile.flooded = true;
				flood.call(this, tile);
				this.flooded++;
			}
		}
	});
}

function showControls() {
	// Show Controls and information?
	let showControls = this.options.controls;
	this.title.visible = showControls;
	this.info.visible = showControls;
	this.score.visible = showControls;
	this.credits.visible = showControls;
	this.playBtn.visible = showControls;
}
