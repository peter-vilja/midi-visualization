var svg = d3.select("#svgContainer").append("svg:svg").style("pointer-events", "all");
var colors = d3.scale.category20b();
var color = 0;

function draw(mx, my, h, w, timeScale) {
	// doVisual('miniworks', 120, 120, 1));
	var transforms = ["0,300","0,-300"];
	for (var i = 0; i < transforms.length; i++) {
		svg.append("svg:circle")
			.attr("cx",mx)
			.attr("cy",my)
			.attr("r",10)
			.style("stroke",colors(++color))
			.style("fill",colors(color))
			.style("stroke-opacity",0.5)
			.transition()
				.attr("transform","translate("+transforms[i]+")")
				.duration(timeScale*1000)
				.ease(Math.sqrt)
				.attr("r",25)
				.style("stroke-opacity",1e-6)
				.style("fill-opacity",1e-6)
				.remove();
	}
}
