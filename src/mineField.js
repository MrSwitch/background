// mineField, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
import Canvas from './classes/canvas';
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
		this.played = false;

		this.grid = [0, 0];
		this.type = 'tile';

		this.played = false;
		this.fillStyle = "#ccc";

		this.heat = 0; // How many bombs are next to this?
	}

	play (){
		// Mark as played
		this.played = true;

		// Style
		this.fillStyle = this.mine ? "red" : "#eee";

		// Can't make this visible
		if (this.heat) {

			// Create text
			var text = new Text();
			text.text = this.heat;
			text.textBaseline = "middle";
			text.textAlign = "center";
			text.strokeStyle = null;
			text.fillStyle="black";
			text.font = "30px Arial bold";
			text.x = this.x+(this.w/2);
			text.y = this.y+(this.h/2);

			canvas.push(text);
		}

		// Mark as dirty
		this.dirty = true;
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
	boom = false;

var h, w;
var nx;
var ny;

// Iniitate canvas
var canvas = new Canvas();

// Add a text Object
// We only have one text Object on the screen at a time, lets reuse it.

var	text = new Text();
text.write("MineField", "center center", 150, canvas);

// Is this playing as a background image?
// We want to display a button to enable playing in full screen.

var start = new Text();
start.write("►", "left top", 40, canvas);
start.addEventListener('click', (e) => setup(), false);

// Setup all the tiles
setup();

/******************************************
 *  Add Events, to listen to in game play
 ******************************************/

canvas.addEventListener('click', (e) => {
	// Tile Clicked
	if (e.target.type === 'tile') {
		play(e.target);
	}

}, false);



canvas.addEventListener('resize', setup);



// Setup
function setup() {

	mines.length = 0;
	flooded = 0;
	boom = false;

	tiles.length = 0;
	canvas.collection.length = 0;

	// Define type size
	// set tile default Width and height
	w = h = 50;

	// set number of tiles horizontally and vertically
	nx = Math.floor(canvas.width/w);
	ny = Math.floor(canvas.height/h);

	// Do the tiles not perfectly fit the space?
	// split the difference between the tiles, adding to the widths and heights
	w += Math.floor((canvas.width%(nx*w))/nx);
	h += Math.floor((canvas.height%(ny*h))/ny);

	// Create tiles
	for (var y=0; y<ny; y++) {
		for (var x=0; x<nx; x++) {

			var tile = new Tile(x*w, y*h, w-1, h-1);
			tile.grid = [x, y];
			tiles.push(tile);
			canvas.push(tile);

			// Upgrade the number of mines
			if(tile.mine){
				mines.push(tile);
			}
		}
	}

	// Flood its neighbouring tiles on start
	text.write("MineField", "center center", 150, canvas);
	canvas.push(text);
	canvas.push(start);
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
		mines.forEach((mine) => mine.play());
		text.write(boom ? "BOOM!": "Kudos!", "center center", 150, canvas);
	}
	else {
		text.write("", "right bottom", 50, canvas);
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
	var edgeTiles = unique([
		(Math.max(y-1, 0)*nx)+Math.max(x-1, 0),
		(Math.max(y-1, 0)*nx)+x,
		(Math.max(y-1, 0)*nx)+Math.min(x+1, nx-1),
		(y*nx)+Math.min(x+1, nx-1),
		((Math.min(y+1, ny-1))*nx)+Math.min(x+1, nx-1),
		((Math.min(y+1, ny-1))*nx)+x,
		((Math.min(y+1, ny-1))*nx)+Math.max(x-1, 0),
		(y*nx)+Math.max(x-1, 0)
	]);

	// Any bombs nearby?
	// Find the `heat` of the current node
	// Loop through all the tiles surrouding this point
	tile.heat = edgeTiles.reduce((prev, curr) => prev + +tiles[curr].mine, 0);

	// Mark the tile as changed
	tile.play();

	// If this tile is the one selected, 
	// And has no heat, then recurse through all neighbours and flood them no heat
	if (tile.heat === 0) {
		edgeTiles.forEach((x) => flood(tiles[x]));
	}
}

function unique (arr){
	var o = {};
	arr.forEach((item) => o[item] = 1);
	return Object.keys(o);
}