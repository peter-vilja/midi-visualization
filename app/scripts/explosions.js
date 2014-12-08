var svg = d3.select("#svgContainer").append("svg:svg").style("pointer-events", "all");
var colors = d3.scale.category20b();
// var color = 0;


svg.append("svg:rect")
	.attr("id", 'block1')
	.attr("x", 100)
	.attr("y", 0)
	.attr("width", 200)
	.attr("height", 400);

svg.append("svg:rect")
	.attr("id", 'block2')
	.attr("x", 350)
	.attr("y", 0)
	.attr("width", 200)
	.attr("height", 400);

svg.append("svg:rect")
	.attr("id", 'block3')
	.attr("x", 600)
	.attr("y", 0)
	.attr("width", 200)
	.attr("height", 400);

svg.append("svg:rect")
	.attr("id", 'block4')
	.attr("x", 850)
	.attr("y", 0)
	.attr("width", 200)
	.attr("height", 400);

svg.append("svg:rect")
	.attr("id", 'block5')
	.attr("x", 100)
	.attr("y", 500)
	.attr("width", 200)
	.attr("height", 400);

svg.append("svg:rect")
	.attr("id", 'block6')
	.attr("x", 350)
	.attr("y", 500)
	.attr("width", 200)
	.attr("height", 400);

svg.append("svg:rect")
	.attr("id", 'block7')
	.attr("x", 600)
	.attr("y", 500)
	.attr("width", 200)
	.attr("height", 400);

svg.append("svg:rect")
	.attr("id", 'block8')
	.attr("x", 850)
	.attr("y", 500)
	.attr("width", 200)
	.attr("height", 400);

function draw(mx, my, h, w, timeScale, color) {
	// doVisual('miniworks', 120, 120, 1));
	var transforms = ["0,300","0,-300"];
	for (var i = 0; i < transforms.length; i++) {
		svg.append("svg:ellipse")
			.attr("cx",mx)
			.attr("cy",my)
			.attr("rx",15)
			.attr("ry",30)
			// .attr("r",10)
			.style("stroke",colors(color))
			.style("fill",colors(color))
			.style("stroke-opacity",0.5)
			.transition()
				.attr("transform","translate("+transforms[i]+")")
				.duration(timeScale*1000)
				.ease(Math.sqrt)
				.attr("r",25)
				.style("stroke-opacity",1e-15)
				.style("fill-opacity",1e-6)
				.remove();


		// ORIGINAL GRAPHICS
		// svg.append("svg:circle")
		// 	.attr("cx",mx)
		// 	.attr("cy",my)
		// 	.attr("r",10)
		// 	.style("stroke",colors(++color))
		// 	.style("fill",colors(color))
		// 	.style("stroke-opacity",0.5)
		// 	.transition()
		// 		.attr("transform","translate("+transforms[i]+")")
		// 		.duration(timeScale*1000)
		// 		.ease(Math.sqrt)
		// 		.attr("r",25)
		// 		.style("stroke-opacity",1e-6)
		// 		.style("fill-opacity",1e-6)
		// 		.remove();
	}
}

function drawFilter(block, scale, timeScale) {
	var blocks = [];
	var transforms = ["0,300","0,-300"];
	for (var i = 0; i < transforms.length; i++) {
		// console.log(d3.select('#block1'));
		d3.select('#block'+ block)
			.transition()
				.duration(timeScale*50)
				.ease(Math.sqrt)
				.style("stroke", 'white')
				.style("fill", 'white')
				.style("stroke-opacity",scale)
				.style("opacity",scale);


				// .attr("r",25)
				// .style("stroke-opacity",1e-6)
				// .style("fill-opacity",1e-6);
				// .remove();

			// .attr("r",10)
		// document.getElementById('block2')
		// 	.style("stroke",colors(color))
		// 	.style("fill",colors(color))
		// 	.style("stroke-opacity",0.1)
		// 	.style("opacity",0.1)
		// 	.transition()
		// 		// .attr("transform","translate("+transforms[i]+")")
		// 		.duration(timeScale*500)
		// 		.ease(Math.sqrt)
		// 		.attr("r",25)
		// 		.style("stroke-opacity",1e-15)
		// 		.style("fill-opacity",1e-6)
		// 		.remove();

		// 	// .attr("r",10)
		// document.getElementById('block3')
		// 	.style("stroke",colors(color))
		// 	.style("fill",colors(color))
		// 	.style("stroke-opacity",0.1)
		// 	.style("opacity",0.1)
		// 	.transition()
		// 		// .attr("transform","translate("+transforms[i]+")")
		// 		.duration(timeScale*500)
		// 		.ease(Math.sqrt)
		// 		.attr("r",25)
		// 		.style("stroke-opacity",1e-15)
		// 		.style("fill-opacity",1e-6)
		// 		.remove();

		// 	// .attr("r",10)
		// document.getElementById('block4')
		// 	.style("stroke",colors(color))
		// 	.style("fill",colors(color))
		// 	.style("stroke-opacity",0.1)
		// 	.style("opacity",0.1)
		// 	.transition()
		// 		// .attr("transform","translate("+transforms[i]+")")
		// 		.duration(timeScale*500)
		// 		.ease(Math.sqrt)
		// 		.attr("r",25)
		// 		.style("stroke-opacity",1e-15)
		// 		.style("fill-opacity",1e-6)
		// 		.remove();

		// document.getElementById('block5')
		// 	.style("stroke",colors(color))
		// 	.style("fill",colors(color))
		// 	.style("stroke-opacity",0.1)
		// 	.style("opacity",0.1)
		// 	.transition()
		// 		// .attr("transform","translate("+transforms[i]+")")
		// 		.duration(timeScale*500)
		// 		.ease(Math.sqrt)
		// 		.attr("r",25)
		// 		.style("stroke-opacity",1e-15)
		// 		.style("fill-opacity",1e-6)
		// 		.remove();
	}
}
