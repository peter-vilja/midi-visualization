var attack = 0.05; // attack speed
var release = 0.05; // release speed
var portamento = 0.05; // portamento/glide speed
var activeNotes = []; // the stack of actively-pressed keys
var color = 0;
var oscillator, oscillator2, oscillator3, gainNode, context, biquadFilter, distortion, tuna, chorus, interval, currentNote, modulator, volume, moog;

var initialize = () => {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  context = new AudioContext();
  tuna = new Tuna(context);
  navigator && navigator.requestMIDIAccess && navigator.requestMIDIAccess().then(success, failure);

// set up the basic oscillator chain, muted to begin with.
  oscillator = context.createOscillator();
  oscillator2 = context.createOscillator();
	oscillator3 = context.createOscillator();
	oscillator.frequency.setValueAtTime(110, 0);
	oscillator2.frequency.setValueAtTime(55, 0);
	modulator = 0;
	volume = 0.0;
	oscillator3.frequency.setValueAtTime(modulator, 0);
	gainNode = context.createGain();
	biquadFilter = context.createBiquadFilter();
	distortion = context.createWaveShaper();
	chorus = new tuna.Chorus({
	             rate: 0.01,         //0.01 to 8+
	             feedback: 0.0,     //0 to 1+
	             delay: 0.0045,      //0 to 1
	             bypass: 0          //the value 1 starts the effect as bypassed, 0 or 1
	         });

  oscillator.connect(distortion);
  oscillator2.connect(distortion);
  oscillator3.connect(distortion);
  distortion.connect(biquadFilter);
  biquadFilter.connect(chorus.input);
  chorus.connect(gainNode);
  gainNode.connect(context.destination);

  distortion.curve = makeDistortionCurve(400);
  biquadFilter.type = biquadFilter.LOWPASS;
  biquadFilter.frequency.value = 500;
  gainNode.gain.value = volume;  // Mute the sound
  oscillator.type = oscillator.SINE;
  oscillator.start(0);  // Go ahead and start up the oscillator
  oscillator2.start(0);  // Go ahead and start up the oscillator
  oscillator3.start(0);

};

var success = access => {
  var inputs = access.inputs.values();
  for (var input of inputs) {
    console.log(input);
    input.onmidimessage = onMessage;
  }
};

var failure = message => {
  console.log(message);
};

var translateMessage = data => {
  // Mask off the lower nibble (MIDI channel, which we don't care about)
  switch (data[0] & 0xf0) {
    case 0x90:
      if (data[2] != 0) {  // if velocity != 0, this is a note-on message
        noteOn(data[1]);
        return;
      }
      // if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
      case 0x80:
        noteOff(data[1]);
        return;
      case 0xB0:
        filter(data[1], data[2]);
        return;
    }
};

var onMessage = message => {
  Object.keys(clients).forEach(key => clients[key].messages.send(JSON.stringify(message.data)));
  translateMessage(message.data);
};

var drawCircle = (noteNumber) => draw(noteNumber * window.innerWidth/64 - (window.innerWidth/2), 320, window.innerWidth, window.innerHeight, 10, color);

var noteOn = noteNumber => {
  console.log('note', noteNumber);
  activeNotes.push(noteNumber);
  oscillator.frequency.cancelScheduledValues(0);
  oscillator.frequency.setTargetAtTime(frequencyFromNoteNumber(activeNotes[activeNotes.length-1]), 0, portamento);
  oscillator2.frequency.cancelScheduledValues(0);
  oscillator2.frequency.setTargetAtTime(frequencyFromNoteNumber(noteNumber)/2, 0, portamento);
  oscillator3.frequency.cancelScheduledValues(0); // not sure if needed
  oscillator3.frequency.setTargetAtTime(modulator, 0, portamento);
  gainNode.gain.cancelScheduledValues(0);
  gainNode.gain.setTargetAtTime(volume, 0, attack);
  color++;
  // drawFilter(1, 0.1, 10);
  // drawFilter(2, 0.2, 10);
  // drawFilter(3, 0.3, 10);
  // drawFilter(4, 0.4, 10);
  // drawFilter(5, 0.5, 10);
  // drawFilter(6, 0.6, 10);
  // drawFilter(7, 0.7, 10);
  // drawFilter(8, 0.8, 10);
  if (interval) clearInterval(interval);
  drawCircle(noteNumber);
  currentNote = noteNumber;
  interval = setInterval(() => {
    drawCircle(noteNumber);
  }, 100);

};

var noteOff = noteNumber => {
  if (noteNumber === currentNote) clearInterval(interval), interval = null;
  let position = activeNotes.indexOf(noteNumber);
  if (position != -1) {
    activeNotes.splice(position, 1);
  }
  if (activeNotes.length == 0) {  // shut off the gainNode
    gainNode.gain.cancelScheduledValues(0);
    gainNode.gain.setTargetAtTime(0.0, 0, release);
  } else {
    oscillator.frequency.cancelScheduledValues(0);
    oscillator.frequency.setTargetAtTime(frequencyFromNoteNumber(activeNotes[activeNotes.length-1]), 0, portamento);
    oscillator2.frequency.cancelScheduledValues(0);
    oscillator2.frequency.setTargetAtTime(frequencyFromNoteNumber(activeNotes[activeNotes.length-1])/2, 0, portamento);
    oscillator3.frequency.cancelScheduledValues(0);
    oscillator3.frequency.setTargetAtTime(modulator, 0, portamento);
  }
};

var filter = (potikka, value) => {
  console.log('potikka', potikka, 'value', value);
  drawFilter(potikka, value / 127.0, 10);
	if (potikka === 1) {
    volume = value / 127.0;
    if (activeNotes.length > 0) {
    	gainNode.gain.cancelScheduledValues(0);
     	gainNode.gain.setTargetAtTime(volume, 0, portamento);
     }
  } else if (potikka === 2) {
    chorus.rate = value / 16 + 0.01
  } else if (potikka === 3) {
    
  } else if (potikka === 4) {
    var curve = makeDistortionCurve(value * 3 + 50);
    distortion.curve = curve;
  } else if (potikka === 7) {
    modulator = value // changing the carrier frequency
    oscillator3.frequency.cancelScheduledValues(0);
    oscillator3.frequency.setTargetAtTime(modulator, 0, portamento);
  } else {
    biquadFilter.frequency.value = value * 100 + 100;
  }

};

var makeDistortionCurve = amount => {
  var k = typeof amount === 'number' ? amount : 50;
  var n_samples = 44100;
  var curve = new Float32Array(n_samples);
  var deg = Math.PI / 180;
  var i = 0;
  var x;

  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};

var frequencyFromNoteNumber = note => 440 * Math.pow(2,(note-69)/12);

initialize();
