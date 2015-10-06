// ColorFlood, Canvas animation
// Copyright Andrew Dodson, March 2013.
// Refactored in 2015

// Get Canvas
import Canvas from './classes/canvas';
import Collection from './classes/collection';
import Text from './classes/text';
import Rect from './classes/rect';


// Create a new tile
// Arguments handled by parent
class Tile{

	constructor(x, y, w, h) {

		// Parent Object
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		// Capture the grid position
		this.grid = new Uint8Array(2);

		var index = Math.floor(Math.random()*palate.length);
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


var palate = ['red','green','orange','blue','white','black'];

// Initiate the canvas in the base
var canvas = new Canvas();

// Collection
// Define the canvas start element
var collection = new Collection(canvas.target);

// Add listeners to the canvas Element
canvas.addEventListener('frame', (e) => {

	// On every frame
	// Prepare dirty areas
	collection.prepare();

	// Draw marked items
	collection.draw();
});

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
var	title = new Text();
title.text = 'Flood It';
title.fontSize = 150;
title.align = 'center center';
title.calc(canvas);

var	credits = new Text();
credits.text = 'Ended';
credits.zIndex = 1;
credits.fontSize = 150;
credits.align = 'center center';
credits.visible = false;
credits.addEventListener('click', setup);

// Help
var	info = new Text();
info.text = 'Start in the top left corner\nFlood tiles by color\nIn as few moves as possible';
info.zIndex = 1;
info.align = 'center center';
info.fontSize = 40;
info.calc(canvas);

var	score = new Text();
score.zIndex = 1;
score.align = 'right bottom';
score.pointerEvents = false;
score.fontSize = 40;

// Is this playing as a background image?
// We want to display a button to enable playing in full screen.
var playBtn = new Text();
playBtn.text = '►';
playBtn.zIndex = 1;
playBtn.align = 'left top';
playBtn.fontSize = 40;
playBtn.addEventListener('click', setup);
playBtn.calc(canvas);


// Setup all the tiles
setup();

// Rebuild the board on resize
canvas.addEventListener('resize', setup);

// User has clicked an item on the canvas
// We'll use event delegation to tell us what the user has clicked.
canvas.addEventListener('click', (e) => {

	// Canvas clicked
	canvas.bringToFront();

	// Get the item at the click location
	var target = collection.elementFromPoint(e.offsetX, e.offsetY);

	// Tile Clicked
	if (target.constructor.name === 'Tile') {
		play(target);
	}

	// hide title
	if (title.visible) {
		title.visible = false;
		title.dirty = true;
	}

	// Has the game state changed?
	if (flooded >= tiles.length && clicks < max_tries) {
		credits.text = `Kudos! ${clicks+1} moves`;
		credits.visible = true;
		credits.calc(canvas);
		info.visible = false;
		score.visible = false;

		credits.dirty = true;
		info.dirty = true;
		score.dirty = true;
	}
	else if (++clicks >= max_tries) {
		credits.text = 'Game over!';
		credits.visible = true;
		credits.calc(canvas);
		info.visible = true;
		score.visible = false;

		credits.dirty = true;
		info.dirty = true;
		score.dirty = true;
	}
	else {
		score.text = `${clicks}/${max_tries}`;
		if(!score.visible){
			score.visible = true;
			score.dirty = true;
		}
		score.calc(canvas);

		// Hide others if need be...
		if(credits.visible){
			credits.visible = false;
			credits.dirty = true;
		}
		if(info.visible){
			info.visible = false;
			info.dirty = true;
		}
	}
});

function setup() {

	// Remove everything
	collection.length = 0;

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
			collection.push(tile);
			tile.grid = [x, y];
		}
	}

	// Write message
	info.y = title.y + title.h;

	// Add text items
	collection.push(title);
	collection.push(info);
	collection.push(credits);
	collection.push(playBtn);
	collection.push(score);

	// Starting state
	// Select the first tile, (top left corner)
	// Mark as flooded
	tiles[0].flooded = true;
	flooded = 1;

	// Flood its neighbouring tiles on start
	play(tiles[0]);

	// Sort the collection by z-index this ensures everything is drawn in the right order
	collection.sort();
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

	// Mark this as needing to be redrawn
	tile.dirty = true;

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
