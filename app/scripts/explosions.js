var svg = d3.select("#svgContainer").append("svg:svg").style("pointer-events", "all");
var colors = d3.scale.category20b();
var color = 0;
var debug = true;
function log(msg) {if (debug) {console.log(msg);}}

function mouseHandler(visualName) {
	return function() {
		var m = d3.mouse(svg[0][0]);
		var w = window.innerWidth, h = window.innerHeight;
		var fmx = m[0]/w, fmy = m[1]/h;
		// if (window.recorder) {recorder.record([visualName, fmx, fmy]);}
		return doVisual(visualName, fmx, fmy);
	};
}


function doVisual(visualName, fmx, fmy, timeScale) {
	if (!timeScale) {timeScale=1;}
	var w = window.innerWidth, h = window.innerHeight;
	var visual = visuals[visualName];
	return visual(w*fmx, h*fmy, w, h, timeScale);
}

function midiVisuals() {
	svg.on('mousemove', function() {
		draw(400, 320, window.innerWidth, window.innerHeight, 1);
	});
}

function draw(mx, my, h, w, timeScale) {
	// doVisual('miniworks', 120, 120, 1));
	var transforms = ["300,300","-300,300","300,-300","-300,-300"];
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


function setEventHandler(visualName, eventName) {
	// log(visualName, eventName);
	midiVisuals();
}

function setEventHandlerFromMenuOption(element, eventName) {
	var visualName = element.value;
	setEventHandler(visualName, eventName);
}


$(document).ready(function() {
	// setEventHandler('miniworks', 'mousemove');
	// setEventHandler('hexagon', 'mousedown');
    // importFromHash();
});
