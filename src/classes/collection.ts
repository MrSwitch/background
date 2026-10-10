// Collection

import on from 'tricks/events/on';
import type {Box} from './shape.js';

const UserEvents = ['click', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout', 'touchmove', 'touchstart', 'touchend', 'frame'];

// Anything drawable which can be added to a collection
export interface CollectionItem extends Box {
	dirty?: boolean | 'pending';
	visible?: boolean;
	zIndex?: number;
	pointerEvents?: boolean | number;
	previous?: Partial<Box>;
	past?: Box;
	type?: string;
	draw(ctx: CanvasRenderingContext2D): void;
	frame?(ctx: CanvasRenderingContext2D): void;
	setup?(collection: Collection): void;
	dispatchEvent?(e: Event): void;
}

export default class Collection {

	// Create an empty children
	children: CollectionItem[] = [];

	// Events
	events: Record<string, Array<(e: Event) => void>> = {};

	target!: HTMLCanvasElement;
	ctx!: CanvasRenderingContext2D;

	constructor(target: HTMLCanvasElement) {
		// setup the canvas element
		this.init(target);
	}

	// listen to canvas events
	init (target: HTMLCanvasElement) {

		// Define the canvas object as the target for the collection
		this.target = target;

		// Define the CTX
		this.ctx = target.getContext('2d')!;

		// listen to user interactive events and trigger those on items
		on(target, UserEvents.toString(), this._findAndDispatch.bind(this), {passive: true});

	}

	push(item: CollectionItem) {
		item.dirty = true;

		// Is this item already in the collection?
		if (this.children.indexOf(item) === -1) {
			if (item.setup) {
				item.setup(this);
			}

			// item.addEventListener('dirty', this.prepareChild.bind(this, item));
			this.children.push(item);
		}
	}

	findIndex(fn: (item: CollectionItem, index: number, arr: CollectionItem[]) => boolean) {
		return this.children.findIndex(fn);
	}

	find(fn: (item: CollectionItem, index: number, arr: CollectionItem[]) => boolean) {
		return this.children.find(fn);
	}

	get length () {
		return this.children.length;
	}
	set length (v: number) {
		this.children.length = v;
	}


	// Touch
	// Mark items and objects in the same space to be redrawn
	prepare() {
		this.children.forEach(item => {
			if (item.dirty === true)
				this.prepareChild(item);
		});
	}

	// Clean Item
	prepareChild(item: CollectionItem) {

		const ctx = this.ctx;

		if (item.dirty === 'pending') {
			return;
		}

		// Mark this item as dirty
		item.dirty = 'pending';

		// Remove from Canvas
		ctx.clearRect(item.x, item.y, item.w, item.h);

		// If the items old position is different
		if (item.previous && displaced(item.previous, item)) {
			ctx.clearRect(item.previous.x ?? 0, item.previous.y ?? 0, item.previous.w ?? 0, item.previous.h ?? 0);
		}

		// Loop though objects and redraw those that exist within the position
		this.children.forEach(this._prepareSiblings.bind(this, item));
	}

	_prepareSiblings(item: CollectionItem, sibling: CollectionItem) {

		// Does this Object overlap with the focused object?
		if (!sibling.dirty && sibling.visible !== false && (intersect(sibling, item) || (item.past ? intersect(sibling, item.past) : false))) {
			// Nested clean
			this.prepareChild(sibling);
		}
	}

	sort() {
		// Sort items by z-index
		this.children.sort((a, b) => {
			const az = a.zIndex || 0;
			const bz = b.zIndex || 0;
			return +(az > bz) || -(az < bz);
		});
	}

	// Trigger the draw function
	draw() {

		const ctx = this.ctx;

		// Find items that have changed
		// Remove background
		this.children.forEach(item => {

			if (item.frame) {
				item.frame(ctx);
			}

			if (item.dirty && item.visible !== false) {
				item.draw(ctx);
			}

			item.dirty = false;
		});
	}

	elementFromPoint(x: number, y: number) {

		let target: CollectionItem | undefined;

		// Find the canvas item which this targets?
		const obj = {
			x,
			y,
			w: 1,
			h: 1
		};

		this.children.forEach(item => {

			if (item.visible === false || !item.w || !item.h || item.pointerEvents === false) {
				return;
			}

			// Is this a target?
			if (intersect(obj, item)) {
				// Define this as a target
				target = item;
			}
		});

		return target;
	}

	// The user has clicked an item on the page
	addEventListener(eventname: string, handler: (e: Event) => void) {

		// Add to the events list
		if (!(eventname in this.events)) {
			this.events[eventname] = [];
		}

		this.events[eventname].push(handler);
	}

	// Dispatch
	dispatchEvent(e: Event) {
		if (e.type in this.events)
			this.events[e.type].forEach(handler => handler(e));
	}

	// Find and _dispatch
	_findAndDispatch(e: Event) {
		// If this is not a pointerEvent lets just pass it through.
		if ((typeof MouseEvent !== 'undefined' && e instanceof MouseEvent) ||
			(typeof TouchEvent !== 'undefined' && e instanceof TouchEvent)) {

			const {offsetX, offsetY} = e as MouseEvent;

			// Find the canvas item which this targets?
			const obj = {
				x: offsetX,
				y: offsetY,
				w: 1,
				h: 1
			};

			this.children.forEach(item => {

				if (!item.visible || !item.w || !item.h || !item.pointerEvents) {
					return;
				}

				// Intersects?
				if (intersect(obj, item)) {
					item.dispatchEvent?.(e);
				}
			});
		}
	}
}


// Intersect
// Given two objects with, x,y,w,h properties
// Do their rectangular dimensions intersect?
// return Boolean true false.
function intersect(a: Box, b: Box) {
	return !(a.x > (b.x + b.w) ||
	(a.x + a.w) < b.x ||
	a.y > (b.y + b.h) ||
	(a.y + a.h) < b.y);
}

function displaced(a: Partial<Box>, b: Box) {
	return (a.x !== b.x ||
	a.y !== b.y ||
	a.w !== b.w ||
	a.h !== b.h);
}
