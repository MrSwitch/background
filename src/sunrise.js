
import Canvas from './classes/canvas';

let canvas = new Canvas();
canvas.addEventListener("mouseover", (e) => hover = true);
canvas.addEventListener("mouseout", (e) => hover = false);

var start = 0, radius, hover, opacity = 0;

canvas.frame = (canvas) => {

	var ctx = canvas.ctx;

	// ensure its keeping up.
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	radius = Math.max(canvas.width, canvas.height) / 2;

	//
	// Do we need this?
	//
	if (hover || opacity > 0) {

		start++;

		if (hover && opacity < 1) {
			visibility(0.1);
		}
		if (!hover && opacity > 0) {
			visibility(-0.1);
		}

		var slices = 32;
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// draw an arc
		var pallate = ['rgb(255, 140, 0)', 'rgb(255,0,0)', 'rgb(255,255,0)'];
		for (var i = 0; i < slices; i++) {
			ctx.beginPath();
			ctx.fillStyle = pallate[i % pallate.length];

			// *270 changed to *360
			ctx.arc(radius, radius, radius*1.5, (Math.PI/180)*((i*(360/slices))+start), (Math.PI/180)*(((i+1)*(360/slices))+start), false);
			ctx.lineTo(canvas.width/2, canvas.height/2);
			ctx.fill();
			ctx.closePath();
		}
	}
};

function visibility(i) {
	opacity += i;
	opacity = Math.round(opacity * 10) / 10;
	canvas.canvas.style.opacity = opacity;
}