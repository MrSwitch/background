// mineField, Canvas annimation
// Copyright Andrew Dodson, March 2013

// Get Canvas
import Canvas from './classes/canvas.js';
import Collection from './classes/collection.js';
import Text from './classes/text.js';
import Background from './classes/Background.js';
import extend from 'tricks/object/extend.js';


// Create a new tile
// Arguments handled by parent
class Tile {

	constructor (...args) {

		// Define the position of this square
		this.position(...args);

		// Mine?
		// Assign with a 1 in 5 chance
		this.mine = Math.random() < (1 / 8);

		// Private mark as to whether this has been played
		this.played = false;

		// Define an initial grid position for this tile.
		this.grid = [0, 0];

		// Define a default fill color for tiles.
		this.fillStyle = '#ccc';

		// Initial heat
		this.heat = 0; // How many bombs are next to this?
	}

	position(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.dirty = true;
	}

	setup() {}
	frame() {}
	draw(ctx) {
		ctx.fillStyle = this.fillStyle;
		ctx.fillRect(this.x, this.y, this.w, this.h);
	}

	get type() {
		return 'tile';
	}
}

/******************************************
 *
 *  Build Canvas Object Collection
 * * Tiles
 * * Data
 ******************************************/
class Stage {
	constructor() {

		this.options = {
			controls: true
		};

		this.tiles = [],
		this.mines = [],
		this.flooded = 0,
		this.boom = false,
		this.ended = false;

		// Iniitate canvas
		const canvas = new Canvas();
		this.canvas = canvas;

		// Iniitate collection
		const collection = new Collection(canvas.target);
		this.collection = collection;

		// Add a text Object
		// We only have one text Object on the screen at a time, lets reuse it.

		const title = new Text();
		title.text = 'MineField';
		title.align = 'center center';
		title.fontSize = 150;
		title.zIndex = 1;
		title.calc(canvas);
		title.pointerEvents = false;
		this.title = title;

		const info = new Text();
		info.text = 'Tap  to  start';
		info.align = 'center center';
		info.fontSize = 40;
		info.zIndex = 1;
		info.calc(canvas);
		info.pointerEvents = false;
		info.y = info.y + title.h;
		this.info = info;

		const credits = new Text();
		credits.align = 'center center';
		credits.zIndex = 1;
		credits.fontSize = 150;
		credits.calc(canvas);
		credits.pointerEvents = false;
		this.credits = credits;

		/******************************************
 *  Add Events, to listen to in game play
 ******************************************/

		canvas.addEventListener('click', e => userClick.call(this, e.offsetX, e.offsetY));
		canvas.addEventListener('resize', setup.bind(this));
		canvas.addEventListener('frame', () => {

			// Draw items
			collection.prepare();

			// Draw items
			collection.draw();

		});


	}
	setup(options) {

		// Update config
		this.config(options);

		// Setup all the tiles
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

function userClick(x, y) {

	// If we need to reset?
	if (this.ended) {
		setup.call(this);
		return;
	}

	// Tile Clicked
	const target = this.collection.elementFromPoint(x, y);

	if (target && target.type === 'tile') {
		play.call(this, target);
	}
}


// Setup
function setup() {

	const canvas = this.canvas;
	const collection = this.collection;
	const tiles = this.tiles;
	const mines = this.mines;

	// Define type size
	// set tile default Width and height

	this.mines.length = 0;
	this.flooded = 0;
	this.boom = false;
	this.ended = false;

	tiles.length = 0;
	collection.length = 0;

	let h;
	let w;

	w = h = 50;

	// set number of tiles horizontally and vertically
	const nx = Math.floor(canvas.width / w);
	const ny = Math.floor(canvas.height / h);

	this.nx = nx;
	this.ny = ny;

	// Do the tiles not perfectly fit the space?
	// split the difference between the tiles, adding to the widths and heights
	w += Math.floor((canvas.width % (nx * w)) / nx);
	h += Math.floor((canvas.height % (ny * h)) / ny);

	// Create tiles
	for (let y = 0; y < ny; y++) {
		for (let x = 0; x < nx; x++) {

			const tile = new Tile(x * w, y * h, w - 1, h - 1);
			tile.grid = [x, y];
			tiles.push(tile);
			collection.push(tile);

			// Upgrade the number of mines
			if (tile.mine) {
				mines.push(tile);
			}
		}
	}

	const credits = this.credits;
	const info = this.info;
	const title = this.title;

	// Flood its neighbouring tiles on start
	collection.push(title);
	collection.push(credits);
	collection.push(info);

	// Show Controls?
	showControls.call(this);

	credits.visible = false;

	// Sort the collection by z-index this ensures everything is drawn in the right order
	collection.sort();
}

function play(tile) {

	const mines = this.mines;
	const tiles = this.tiles;
	const credits = this.credits;
	const info = this.info;
	const title = this.title;

	if (!tile) {
		return true;
	}

	// If this is the first time the game has been played,
	// flooded will equal 0
	if (this.flooded === 0) {
		// Ensure this is not a mine
		tile.mine = false;
	}

	// Is it a mine
	if (tile.mine) {
		this.boom = true;
	}
	// Check to see it this tile has been exposed before?
	else if (!tile.played) {
		// Trigger Flooding
		flood.call(this, tile);
	}

	if (((this.flooded + mines.length) === tiles.length) || this.boom) {

		// Show all the mines
		mines.forEach(mine => markTile.call(this, mine));

		// Mark as ended
		this.ended = true;

		// Update Text
		credits.text = this.boom ? 'BOOM!' : 'Kudos!';
		credits.calc(this.canvas);
		info.text = 'Tap to restart';

		// Show controls
		showControls.call(this);
	}
	else {
		title.visible = false;
		info.visible = false;
		credits.visible = false;
	}

}

// Flood this tile with the new colour and its neighbours with the same colour
function flood(tile) {

	const nx = this.nx;
	const ny = this.ny;
	const tiles = this.tiles;

	const [x, y] = tile.grid;

	if (tile.played) {
		return;
	}

	// Add to Counter
	this.flooded++;

	// find all tiles around this one.
	// Filter the array so we only have unique values
	const edgeTiles = [
		((Math.max(y - 1, 0) * nx) + Math.max(x - 1, 0))
		, ((Math.max(y - 1, 0) * nx) + x)
		, ((Math.max(y - 1, 0) * nx) + Math.min(x + 1, nx - 1))
		, ((y * nx) + Math.min(x + 1, nx - 1))
		, (((Math.min(y + 1, ny - 1)) * nx) + Math.min(x + 1, nx - 1))
		, (((Math.min(y + 1, ny - 1)) * nx) + x)
		, (((Math.min(y + 1, ny - 1)) * nx) + Math.max(x - 1, 0))
		, ((y * nx) + Math.max(x - 1, 0))
	]
		.filter((key, index, arr) => arr.indexOf(key) === index && tiles[key])
		.map(key => tiles[key]);

	// Any bombs nearby?
	// Find the `heat` of the current node
	// Loop through all the tiles surrouding this point
	edgeTiles
		.forEach(_tile => {
			tile.heat += +_tile.mine;
		});

	// Set the tile mode to played
	tile.played = true;

	// Change tile appearance
	markTile.call(this, tile);

	// If this tile is the one selected,
	// And has no heat, then recurse through all neighbours and flood them no heat
	if (tile.heat === 0) {
		edgeTiles.forEach(flood.bind(this));
	}
}


function markTile(tile) {
	// Style
	tile.fillStyle = tile.mine ? 'red' : 'rgba(0,0,0,0.1)';

	// Mark as dirty
	tile.dirty = true;

	// Can't make this visible
	if (tile.heat) {

		// Create text
		const text = new Text();
		text.text = tile.heat;
		text.textBaseline = 'middle';
		text.textAlign = 'center';
		text.strokeStyle = null;
		text.fillStyle = 'black';
		text.font = 'bold 30px Arial';
		text.x = tile.x + (tile.w / 2);
		text.y = tile.y + (tile.h / 2);
		text.w = 0;
		text.h = 0;

		this.collection.push(text);
		this.collection.sort();
	}
}

function showControls() {
	const showControls = this.options.controls;
	const inProgress = !(this.flooded === 0 || this.boom || this.ended);

	// Show some controls only between game plays?
	this.title.visible = this.flooded === 0 && !this.ended && showControls;
	this.info.visible = !inProgress && showControls;
	this.credits.visible = this.ended && showControls;
}
