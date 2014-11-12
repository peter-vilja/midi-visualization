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

function setEventHandler(visualName, eventName) {
	// log(visualName, eventName);
	svg.on(eventName, mouseHandler(visualName));
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