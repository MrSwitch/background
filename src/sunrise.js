
import Canvas from './classes/canvas.js';

const canvas = new Canvas();
canvas.addEventListener('mouseover', () => hover = true);
canvas.addEventListener('mouseout', () => hover = false);

const slices = 32;
const pi = (Math.PI / 180);
const deg = (360 / slices);
const pallate = ['rgb(255, 140, 0)', 'rgb(255,0,0)', 'rgb(255,255,0)'];

let spin = 0;
let radius;
let hover;
let opacity = 0;

canvas.addEventListener('frame', () => {

	const ctx = canvas.ctx;
	const [cx, cy] = [canvas.width / 2, canvas.height / 2];

	// ensure its keeping up.
	radius = Math.max(canvas.width, canvas.height) / 2;

	// Do we need this?
	if (hover || opacity > 0) {

		spin++;

		if (hover && opacity < 1) {
			opacity += 0.1;
		}
		if (!hover && opacity > 0) {
			opacity -= 0.1;
		}

		canvas.target.style.opacity = Math.round(opacity * 10) / 10;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// draw an arc
		for (let i = 0; i < slices; i++) {
			ctx.beginPath();
			ctx.fillStyle = pallate[i % pallate.length];

			// *270 changed to *360
			ctx.arc(radius, radius, radius * 1.5, pi * ((i * deg) + spin), pi * (((i + 1) * deg) + spin), false);
			ctx.lineTo(cx, cy);
			ctx.fill();
			ctx.closePath();
		}
	}
});
