// ColorFlood, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
import Canvas from './classes/canvas';
import Text from './classes/text';
import Rect from './classes/rect';


// Create a new tile
// Arguments handled by parent
class Tile extends Rect{

	constructor(...args) {

		// Parent Object
		super(...args);

		this.type = 'tile';
		this.grid = [0, 0];

		var index = Math.floor(Math.random()*palate.length);
		if (index === palate.length) {
			index--;
		}

		this.colorIndex = index;
		this.fillStyle = palate[this.colorIndex];
		this.flooded = false; // is this tile caught
	}
}


var palate = ["red","green","orange","blue","white","black"];

// Initiate the canvas in the base
var canvas = new Canvas();

var clicks,
	flooded,
	selectedColor;


/******************************************
 *
 *  Build Canvas Object Collection
 * * Tiles
 * * Data
 ******************************************/

var tiles = [];
var max_tries;
var h,w;
var nx;
var ny;


// Add a text Object
// We only have one text Object on the screen at a time, lets reuse it.
var	text = new Text();

// Help
var	info = new Text();

// Is this playing as a background image?
// We want to display a button to enable playing in full screen.
var playBtn = new Text();
playBtn.write("►", "left top", 40, canvas);
playBtn.addEventListener('click', setup );


// Setup all the tiles
setup();

// Rebuild the board on resize
canvas.addEventListener('resize', setup);

// User has clicked an item on the canvas
// We'll use event delegation to tell us what the user has clicked.
canvas.addEventListener('click', (e) => {

	// Tile Clicked
	if (e.target.type === 'tile') {
		play(e.target);
	}

	// Has the game state changed?
	if (flooded >= tiles.length && clicks < max_tries) {
		text.write("Kudos! " + (clicks+1) + " moves", "center center", 150, canvas);
		info.visible = false;
		info.dirty = true;
	}
	else if (++clicks >= max_tries) {
		text.write("Game over!", "center center", 150, canvas);
		info.visible = true;
		info.dirty = true;
	}
	else {
		text.write(clicks + "/" + max_tries, "right bottom", 50, canvas);
		info.visible = false;
		info.dirty = true;
	}
});

function setup() {

	// Remove everything
	canvas.collection.length = 0;

	clicks = 0;
	selectedColor = null;

	tiles.length = 0;


	// Define type size
	// set tile default Width and height
	w = h = 50;

	// set number of tiles horizontally and vertically
	nx = Math.floor(canvas.width/w);
	ny = Math.floor(canvas.height/h);
	max_tries = nx + ny;

	// Do the tiles not perfectly fit the space?
	// split the difference between the tiles, adding to the widths and heights
	w += Math.floor((canvas.width%(nx*w))/nx);
	h += Math.floor((canvas.height%(ny*h))/ny);

	// Create tiles
	for (var y = 0; y < ny; y++) {
		for (var x = 0; x < nx; x++) {

			var tile = new Tile(x*w, y*h, w-1, h-1);
			tiles.push(tile);
			canvas.push(tile);
			tile.grid = [x, y];
		}
	}

	// Write message
	text.write("Flood It", "center center", 150, canvas);
	info.write("Start in the top left corner\nFlood tiles by color\nIn as few moves as possible", "center center", 40, canvas);
	info.y = text.y + text.h;

	// Add text items
	canvas.push(text);
	canvas.push(info);
	canvas.push(playBtn);

	// Starting state
	// Select the first tile, (top left corner)
	// Mark as flooded
	tiles[0].flooded = true;
	flooded = 1;

	// Flood its neighbouring tiles on start
	play(tiles[0]);
}

function play(tileSelected) {

	if (!tileSelected) {
		return;
	}

	selectedColor = tileSelected.colorIndex;

	// Trigger Flooding
	tiles.forEach((tile) => {
		if (tile.flooded) {
			flood(tile);
		}
	});
}

// Flood this tile with the new colour and its neighbours with the same colour
function flood(tile) {

	var [x, y] = tile.grid;

	tile.colorIndex = selectedColor;
	tile.fillStyle = palate[selectedColor];

	// Not sure how optimal this is but hey it look
	canvas.cleanItem(tile);

	// find all tiles next to this one.
	var edgeTiles = [
		(Math.max(y-1, 0) * nx) + x,
		(y * nx) + Math.min(x + 1, nx - 1),
		((Math.min(y + 1, ny - 1)) * nx) + x,
		(y * nx) + Math.max(x-1, 0)
	];

	edgeTiles.forEach((edge) => {
		var tile = tiles[edge];
		if (edge > 0 && tile) {
			if (tile.colorIndex === selectedColor && !tile.flooded) {
				tile.flooded = true;
				flood(tile);
				flooded++;
			}
		}
	});
}