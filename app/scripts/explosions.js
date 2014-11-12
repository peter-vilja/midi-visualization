var svg = d3.select("#svgContainer").append("svg:svg").style("pointer-events", "all");
var colors = d3.scale.category20b();
var ci=0;
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
	var transforms = ["155,155","-155,155","155,-155","-155,-155"];
	for (var i = 0; i < transforms.length; i++) {
		svg.append("svg:circle")
			.attr("cx",mx).attr("cy",my).attr("r",10)
			.style("stroke",colors(++ci)).style("fill",colors(ci)).style("stroke-opacity",0.5)
			.transition()
				.attr("transform","translate("+transforms[i]+")").duration(timeScale*1000).ease(Math.sqrt).attr("r",25)
				.style("stroke-opacity",1e-6).style("fill-opacity",1e-6).remove();
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

var keyAliases = {

	"`": "#mousemove-yoloswag",
	"1": "#mousemove-circlereverse",
	"2": "#mousemove-basiccircle",
	"3": "#mousemove-triangles",
	"4": "#mousemove-hexagon",
	"5": "#mousemove-fireworks",
	"6": "#mousemove-miniworks",
	"7": "#mousemove-foursquare",
	"8": "#mousemove-jazz",
	"9": "#mousemove-confetti",
	"0": "#mousemove-linestomouse",
	"-": "#mousemove-biglines",
	"=": "#mousemove-drawing",

	"~": "#mousedown-yoloswag",
	"!": "#mousedown-circlereverse",
	"@": "#mousedown-basiccircle",
	"#": "#mousedown-triangles",
	"$": "#mousedown-hexagon",
	"%": "#mousedown-fireworks",
	"^": "#mousedown-miniworks",
	"&": "#mousedown-foursquare",
	"*": "#mousedown-jazz",
	"(": "#mousedown-confetti",
	")": "#mousedown-linestomouse",
	"_": "#mousedown-biglines",
	"+": "#mousedown-drawing",

	"[": "#button-record-start",
	"]": "#button-record-stop",
	"\\":"#button-record-reset",
	" ": "#button-play-start",
	"z": "#button-play-stop",
	"x": "#button-play-reset",
	"e": "#button-export-exporter",

	"/": "#button-controls"
};

function keystrokes(event) {
	if ($('textarea:focus, input:focus, select:focus').length>0) {return;}
	var k = event.charCode;
	var s = String.fromCharCode(k);
	var $e = $(keyAliases[s]);
	if ($e.is('option')) {
		$e.parent().val($e.val());
		$e.change();
	}
	else if ($e.attr('disabled') === undefined) {
		$e.click();
	}
}
$(document).keypress(keystrokes);

$(document).ready(function() {
	setEventHandler('miniworks', 'mousemove');
	setEventHandler('hexagon', 'mousedown');
    $("#mousemoveSelector").change(function() {
        setEventHandlerFromMenuOption(this, 'mousemove');
    });
    $("#mousedownSelector").change(function() {
        setEventHandlerFromMenuOption(this, 'mousedown');
    });
    // importFromHash();
});