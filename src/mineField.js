// mineField, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
import Canvas from './classes/canvas';
import Collection from './classes/collection';
import Text from './classes/text';
import Rect from './classes/rect';

// Create a new tile
// Arguments handled by parent
class Tile extends Rect{

	constructor (...args) {

		super(...args);

		// Mine?
		// Assign with a 1 in 5 chance
		this.mine = Math.random() < (1/8);

		// Private mark as to whether this has been played
		this._played = false;

		// Define an initial grid position for this tile.
		this.grid = [0, 0];

		// Set the shape type
		this.type = 'tile';

		// Define a default fill color for tiles.
		this.fillStyle = '#ccc';

		// Initial heat
		this.heat = 0; // How many bombs are next to this?
	}


	get played() {
		return this._played;
	}

	set played(v) {

		// Has it already been played?
		if (this._played) {
			return;
		}

		// Mark as played
		this._played = !!v;

		// Style
		this.fillStyle = this.mine ? 'red' : 'rgba(0,0,0,0.1)';

		this.dirty = true;

		// Can't make this visible
		if (this.heat) {

			// Create text
			var text = new Text();
			text.text = this.heat;
			text.textBaseline = 'middle';
			text.textAlign = 'center';
			text.strokeStyle = null;
			text.fillStyle='black';
			text.font = '30px Arial bold';
			text.x = this.x + (this.w / 2);
			text.y = this.y + (this.h / 2);

			collection.push(text);
			collection.sort();
		}
	}
}

/******************************************
 *
 *  Build Canvas Object Collection
 * * Tiles
 * * Data
 ******************************************/

var tiles = [],
	mines = [],
	flooded = 0,
	boom = false,
	ended = true;

var h, w;
var nx;
var ny;

// Iniitate canvas
var canvas = new Canvas();

// Iniitate collection
var collection = new Collection(canvas.target);

// Add a text Object
// We only have one text Object on the screen at a time, lets reuse it.

var	title = new Text();
title.text = 'MineField';
title.align = 'center center';
title.fontSize = 150;
title.zIndex = 1;
title.calc(canvas);
title.pointerEvents = false;

var	info = new Text();
info.text = 'Tap  to  start';
info.align = 'center center';
info.fontSize = 40;
info.zIndex = 1;
info.calc(canvas);
info.pointerEvents = false;
info.y = info.y + title.h;

var	credits = new Text();
credits.align = 'center center';
credits.zIndex = 1;
credits.fontSize = 150;
credits.calc(canvas);
credits.pointerEvents = false;

// Is this playing as a background image?
// We want to display a button to enable playing in full screen.

var start = new Text();
start.text = '►';
start.zIndex = 1;
start.align = 'left top';
start.fontSize = 40;
start.calc(canvas);
start.addEventListener('click', setup);
start.addEventListener('touchstart', setup);

// Setup all the tiles
setup();

/******************************************
 *  Add Events, to listen to in game play
 ******************************************/

canvas.addEventListener('mousedown', (e) => userClick(e.offsetX, e.offsetY));
canvas.addEventListener('touchstart', (e) => userClick(e.offsetX, e.offsetY));

function userClick(x, y) {

	// Tile Clicked
	canvas.bringToFront();

	if (ended) {
		ended = false;
		setup();
		return;
	}

	// Tile Clicked
	var target = collection.elementFromPoint(x, y);

	if (target && target.type === 'tile') {
		play(target);
	}
}


canvas.addEventListener('resize', setup);

canvas.addEventListener('frame', (e) => {

	// Draw items
	collection.prepare();

	// Draw items
	collection.draw();

});



// Setup
function setup() {

	mines.length = 0;
	flooded = 0;
	boom = false;

	tiles.length = 0;
	collection.length = 0;

	// Define type size
	// set tile default Width and height
	w = h = 50;

	// set number of tiles horizontally and vertically
	nx = Math.floor(canvas.width / w);
	ny = Math.floor(canvas.height / h);

	// Do the tiles not perfectly fit the space?
	// split the difference between the tiles, adding to the widths and heights
	w += Math.floor((canvas.width % (nx * w)) / nx);
	h += Math.floor((canvas.height % (ny * h)) / ny);

	// Create tiles
	for (var y=0; y<ny; y++) {
		for (var x=0; x<nx; x++) {

			var tile = new Tile(x*w, y*h, w-1, h-1);
			tile.grid = [x, y];
			tiles.push(tile);
			collection.push(tile);

			// Upgrade the number of mines
			if(tile.mine){
				mines.push(tile);
			}
		}
	}

	// Flood its neighbouring tiles on start
	collection.push(title);
	collection.push(credits);
	collection.push(info);
	collection.push(start);

	title.visible = true;
	info.visible = true;
	credits.visible = false;

	// Sort the collection by z-index this ensures everything is drawn in the right order
	collection.sort();
}

function play(tile){


	if (!tile) {
		return true;
	}

	// If this is the first time the game has been played,
	// flooded will equal 0
	if (flooded === 0) {
		// Ensure this is not a mine
		tile.mine = false;
	}

	// Is it a mine
	if (tile.mine) {
		boom = true;
	}
	// Check to see it this tile has been exposed before?
	else if(!tile.played) {
		// Trigger Flooding
		flood(tile);
	}

	if ((flooded + mines.length) === tiles.length || boom) {

		// Show all the mines
		mines.forEach((mine) => mine.played = true);
		credits.text = boom ? 'BOOM!' : 'Kudos!';
		credits.visible = true;
		credits.calc(canvas);
		info.text = 'Tap to restart';
		info.visible = true;

		ended = true;
	}
	else {
		title.visible = false;
		info.visible = false;
		credits.visible = false;
	}

}

// Flood this tile with the new colour and its neighbours with the same colour
function flood(tile) {

	var [x, y] = tile.grid;

	if (tile.played) {
		return;
	}

	// Add to Counter
	flooded++;

	// find all tiles around this one.
	// Filter the array so we only have unique values
	var edgeTiles = [
	((Math.max(y-1, 0)*nx)+Math.max(x-1, 0))
	,((Math.max(y-1, 0)*nx)+x)
	,((Math.max(y-1, 0)*nx)+Math.min(x+1, nx-1))
	,((y*nx)+Math.min(x+1, nx-1))
	,(((Math.min(y+1, ny-1))*nx)+Math.min(x+1, nx-1))
	,(((Math.min(y+1, ny-1))*nx)+x)
	,(((Math.min(y+1, ny-1))*nx)+Math.max(x-1, 0))
	,((y*nx)+Math.max(x-1, 0))
	]
	.filter((key, index, arr) => {return arr.indexOf(key) === index && tiles[key];})
	.map((key) => {return tiles[key];});

	// Any bombs nearby?
	// Find the `heat` of the current node
	// Loop through all the tiles surrouding this point
	edgeTiles
	.forEach((_tile) => {tile.heat += +_tile.mine;});

	// Set the tile mode to played
	tile.played = true;

	// If this tile is the one selected,
	// And has no heat, then recurse through all neighbours and flood them no heat
	if (tile.heat === 0) {
		edgeTiles.forEach(flood);
	}
}
