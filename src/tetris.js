// Tetris, Canvas animation
// Copyright Andrew Dodson, July 2017

// Get Canvas
import Canvas from './classes/canvas';
import Collection from './classes/collection';
import Text from './classes/text';
import Shape from './classes/shape';
import Rect from './classes/rect';
import Background from './classes/background';

// Create a new tile
// Arguments handled by parent
class Piece extends Shape {

	constructor({gx, gy, tw, th, structure, color}) {

		const x = tw * gx;
		const y = th * gy;
		const w = tw * structure[0].length;
		const h = th * structure.length;
		super(x, y, w, h);

		this.tw = tw;
		this.th = th;
		this.gx = gx;
		this.gy = gy;
		this.zIndex = 0;
		this.color = color;
		this.structure = structure;
	}

	// Rotate this item
	rotate() {
		// Rotate piece
		const a = [];
		const rowCount = this.structure.length;
		this.structure.forEach((row, rowIndex) => {
			row.forEach((value, colIndex) => {
				// Init array
				let row = a[colIndex];
				if (!row) {
					row = [];
					a[colIndex] = row;
				}

				// The xIndex becomes the row index
				a[colIndex][rowCount - rowIndex - 1] = value;
			});
		});

		this.structure = a;
	}

	points() {
		const a = [];
		this.structure.forEach((row, y) => {
			// Find the blocks in the row
			row.forEach((block, x) => {
				if (block) {
					a.push([x, y]);
				}
			});
		});
		return a;
	}

	// Each function passed into the collection must have a draw function
	draw(ctx) {
		ctx.fillStyle = this.color;

		// Draw
		this.structure.forEach((row, yIndex) => {
			const y = (yIndex * this.th);
			row.forEach((tile, xIndex) => {
				if (tile) {
					const x = xIndex * this.tw;
					ctx.fillRect(this.x + x, this.y + y, this.tw, this.th);
				}
			});
		});
	}
}

// Define the shapes which go into making the game...
const pieces = [
	{
		color: 'red',
		name: 'square',
		structure: [
			[1, 1],
			[1, 1]
		]
	},
	{
		color: 'green',
		name: 'left-l',
		structure: [
			[0, 1, 0],
			[0, 1, 0],
			[0, 1, 1]
		]
	},
	{
		color: 'green',
		name: 'right-l',
		structure: [
			[0, 1, 0],
			[0, 1, 0],
			[1, 1, 0]
		]
	},
	{
		color: 'orange',
		name: 'zig',
		structure: [
			[1, 0, 0],
			[1, 1, 0],
			[0, 1, 0]
		]
	},
	{
		color: 'blue',
		name: 'zag',
		structure: [
			[0, 1, 0],
			[1, 1, 0],
			[1, 0, 0]
		]
	},
	{
		color: 'yellow',
		name: 'line',
		structure: [
			[0, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 1, 0, 0]
		]
	},
	{
		color: 'purple',
		name: 'middle',
		structure: [
			[0, 1, 0],
			[0, 1, 1],
			[0, 1, 0]
		]
	}
];

class Stage extends Canvas {

	constructor(target) {

		// Initiate the canvas in the base
		super(target);

		// Collection
		// Define the canvas start element
		this.collection = new Collection(this.target);

		// Add listeners to the canvas Element
		this.addEventListener('frame', this.frame.bind(this));

		// Add listeners to the canvas Element
		this.addEventListener('resize', this.reset.bind(this));

		// Show text
		this.options = {
			controls: true
		};

		// Pieces
		this.pieces = [];

		// Board
		this.board = [];

		const credits = new Text();
		credits.text = 'Ended';
		credits.zIndex = 1;
		credits.fontSize = 150;
		credits.align = 'center center';
		credits.visible = false;
		credits.addEventListener('click', this.reset.bind(this));
		this.credits = credits;

		const score = new Text();
		score.zIndex = 1;
		score.text = 0;
		score.align = 'right bottom';
		score.pointerEvents = false;
		score.fontSize = 40;
		this.score = score;

		// Is this playing as a background image?
		// We want to display a button to enable playing in full screen.
		const playBtn = new Text();
		playBtn.text = '►';
		playBtn.zIndex = 1;
		playBtn.align = 'left top';
		playBtn.fontSize = 40;
		playBtn.calc(this);
		playBtn.addEventListener('click', this.reset.bind(this));
		this.playBtn = playBtn;

		// User has clicked an item on the canvas
		// We'll use event delegation to tell us what the user has clicked.
		this.addEventListener('click', this.click.bind(this));

		// User has clicked an item on the canvas
		// We'll use event delegation to tell us what the user has clicked.
		this.addEventListener('keydown', this.keypress.bind(this));

		// This cadence
		// This sets the rate at which blocks move
		// And is roughly the [number] of milliseconcd it takes a block to move relative to it's own height.
		this.cadence = 1000;
		this.lastTick = 0;
	}

	setup() {
		this.reset();
	}

	reset() {

		// Set the tilesize
		this.size = 50;

		// Remove everything
		this.collection.length = 0;

		// Board
		// Break the board down into squares
		// At each square there can exist a reference to a piece
		this.board.length = 0;

		{
			// Set number of tiles horizontally and vertically
			this.nx = Math.floor(this.width / this.size);
			this.ny = Math.floor(this.height / this.size);

			// Adjust the tile dimensions
			this.tw = this.size + Math.floor((this.width % (this.nx * this.size)) / this.nx);
			this.th = this.size + Math.floor((this.height % (this.ny * this.size)) / this.ny);

			// Create board matrix
			for (let y = 0; y < this.ny; y++) {
				this.board[y] = [];
				for (let x = 0; x < this.nx; x++) {
					this.board[y][x] = null;
				}
			}
		}

		// Pieces
		this.pieces.length = 0;

		// Score
		this.score.text = 0;
		this.score.calc(this);

		// Add text items
		this.collection.push(this.credits);
		this.collection.push(this.playBtn);
		this.collection.push(this.score);

		// Sort the collection by z-index this ensures everything is drawn in the right order
		this.collection.sort();

		// Show Controls
		this.controls();
	}

	controls() {
		// Show Controls and information?
		this.score.visible = true;


		const showControls = false; //this.options.controls;

		this.credits.visible = this.ended && showControls;
		this.playBtn.visible = showControls;
	}

	frame() {
		const now = performance.now();

		// Mark that this has a difference in Y
		// This is used later to say whether a move to the left or right is possible.
		this.diff = Math.min((now - this.lastTick) / this.cadence, 1) % 1;

		// Grab the current game piece and change it's vertical position
		if (this.gamepiece) {

			// Can this piece move down?
			// Find the matrix
			this.gamepiece.y = parseInt((this.diff + this.gamepiece.gy) * this.th, 10);
		}

		// Is this a big move
		if (this.diff === 0) {

			// Update the lastTick
			this.lastTick = now;

			// Trigger the tick
			this.tick();
		}

		// On every frame
		// Prepare dirty areas
		this.collection.prepare();

		// Draw marked items
		this.collection.draw();
	}

	// This is the game tick
	// The rate at which this is controlled varies depending on the game cadence
	// For instance this should initially be set to a fall rate of 1 block every second
	// When the game evolves the tick can be called more frequently

	tick() {

		if (this.gamepiece) {
			// Compare the position of the gamepiece and determine whether it's free to move down
			// - if not trigger the end and fix it in place

			// The gamepiece has a structure as does the board
			// Compare the position of the blocks which makes up the game piece
			// - in relation to the relative structure of the board

			// Update the gamepieces position...
			this.move({y: 1});
		}
		// Else create a game shape and position it on the board
		else {

			const {tw, th, nx} = this;
			const piece = random(pieces);
			const tlen = piece.structure[0].length;

			// Find the grid x position of the piece
			const gx = Math.ceil((nx - tlen) / 2);

			const options = Object.assign({
				gx,
				gy: 0,
				tw,
				th
			}, piece);

			this.gamepiece = new Piece(options);
			this.collection.push(this.gamepiece);

			// Draw marked items
			this.collection.sort();
		}
	}

	click() {
		// Find the gamepiece and trigger a rotation
		this.rotate();
	}

	rotate() {
		// Find the gamepiece and trigger a rotation
		if (this.gamepiece) {
			this.gamepiece.rotate();
		}
	}

	canMove(cords) {
		// Props of the gamepiece
		const {gx, gy} = this.gamepiece;
		const {x = 0, y = 0} = cords;

		// Can move?
		const points = this.gamepiece.points();

		// Is there something at this point on the board?
		return !points.find(([px, py]) => {

			// For a sideways move having already fallen half way also check an intermediate position
			if (this.diff && x && !y && this.point(px + x + gx, py + y + gy + 1)) {
				return true;
			}

			// Check the position
			return this.point(px + x + gx, py + y + gy);
		});
	}

	point(x, y) {

		// Out of bounds
		if ((y < 0 || y >= this.ny) || (x < 0 || x >= this.nx)) {
			// out of bounds
			return 1;
		}

		// Whats there?
		return this.board[y][x];
	}

	// Triggered when the gamepiece has reached the bottom
	restGamepiece() {

		// Set the gamepiece on the board
		const points = this.gamepiece.points();
		const {gx, gy} = this.gamepiece;

		// Mark the board as having filled in
		points.forEach(([px, py]) => {
			const x = px + gx;
			const y = py + gy;

			// Recreate the square
			const tile = new Rect(this.tw * x, this.th * y, this.tw, this.th);
			tile.zIndex = 0;
			tile.fillStyle = this.gamepiece.color;
			this.collection.push(tile);

			this.board[y][x] = tile;
		});

		// Remove the gamepiece
		this.gamepiece.remove();


		// Create a list of marked row indexes to remove from the board
		const marked = [];

		// Completed rows?
		this.board.forEach((row, index) => {

			// Ignore rows where every tile is not laid
			if (row.filter(a => a).length !== this.nx) {
				return;
			}

			// Detach all tile objects
			row.forEach(tile => tile.remove());

			// Add this row index to the marked list
			marked.push(index);
		});

		// There are rows to remove
		if (marked.length) {

			// Remove items from the bottom
			marked.reverse().forEach(index => this.board.splice(index, 1));

			// Add items to the top
			marked.forEach(() => {
				this.board.unshift([]);
			});

			// Loop through and reposition every tile
			this.board.forEach((row, rowIndex) => {
				row.forEach((tile) => {
					if (tile) {
						tile.y = rowIndex * this.th;
					}
				});
			});

			// Add a score
			this.score.text += marked.length;
			this.score.calc(this);
		}
	}

	move({x = 0, y = 0}) {

		// Move the game piece
		if (this.gamepiece && this.canMove({x, y})) {

			this.gamepiece.gx += x;
			this.gamepiece.x = (this.gamepiece.gx * this.tw);

			this.gamepiece.gy += y;
			this.gamepiece.y = (this.gamepiece.gy * this.th);

			// Free to continue falling?
			if (!this.canMove({y: 1})) {
				// Rest game[iece]
				this.restGamepiece();

				// Remove it
				this.gamepiece = null;
			}

			// This moved successfully
			return true;
		}
	}

	keypress({key}) {
		switch (key) {
			case 'ArrowRight': {
				this.move({x: 1});
				break;
			}
			case 'ArrowLeft': {
				this.move({x: -1});
				break;
			}
			case 'ArrowDown': {
				this.move({y: 1});
				break;
			}
			case 'ArrowUp': {
				this.rotate();
				break;
			}
			case ' ': {
				this.rotate();
			}
		}
	}

	swipe() {

	}
}


// Add Stage to the background
Background.add(Stage);


// Select a random item in an array
function random(arr) {
	return arr[Math.floor(arr.length * Math.random())];
}