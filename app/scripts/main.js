(function () {
  var attack = 0.05; // attack speed
  var release = 0.05; // release speed
  var portamento = 0.05; // portamento/glide speed
  var activeNotes = []; // the stack of actively-pressed keys
  var oscillator, oscillator2, gainNode, context, biquadFilter, distortion, tuna, chorus, interval, currentNote;

  var initialize = () => {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    context = new AudioContext();
    tuna = new Tuna(context);
    navigator && navigator.requestMIDIAccess && navigator.requestMIDIAccess().then(success, failure);

    // set up the basic oscillator chain, muted to begin with.
    oscillator = context.createOscillator();
    oscillator2 = context.createOscillator();
    oscillator.frequency.setValueAtTime(110, 0);
    oscillator2.frequency.setValueAtTime(55, 0);
    gainNode = context.createGain();
    biquadFilter = context.createBiquadFilter();
    distortion = context.createWaveShaper();
    chorus = new tuna.Chorus({
                 rate: 2,         //0.01 to 8+
                 feedback: 0.2,     //0 to 1+
                 delay: 0.0045,     //0 to 1
                 bypass: 0          //the value 1 starts the effect as bypassed, 0 or 1
             });

    oscillator.connect(distortion);
    oscillator2.connect(distortion);
    distortion.connect(biquadFilter);
    biquadFilter.connect(chorus.input);
    chorus.connect(gainNode);
    gainNode.connect(context.destination);

    distortion.curve = makeDistortionCurve(400);
    biquadFilter.type = biquadFilter.LOWPASS;
    biquadFilter.frequency.value = 100;
    gainNode.gain.value = 0.0;  // Mute the sound
    oscillator.type = oscillator.SINE;
    oscillator.start(0);  // Go ahead and start up the oscillator
    oscillator2.start(0);  // Go ahead and start up the oscillator
  };

  var success = access => {
    var input = access.inputs.values().next().value;
    input.onmidimessage = onMessage;
    // access.inputs.values().forEach(input => {
    //   input.onmidimessage = onMessage;
    //   console.log(input); // magic??
    // });
  };

  var failure = message => {
    console.log(message);
  };

  var onMessage = event => {
    // Mask off the lower nibble (MIDI channel, which we don't care about)
    switch (event.data[0] & 0xf0) {
      case 0x90:
        if (event.data[2] != 0) {  // if velocity != 0, this is a note-on message
          noteOn(event.data[1]);
          return;
        }
        // if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
      case 0x80:
        noteOff(event.data[1]);
        return;
      case 0xB0:
        filter(event.data[1], event.data[2]);
        return;
    }
  };

  var drawCircle = (noteNumber) => draw(noteNumber * window.innerWidth/64 - (window.innerWidth/2), 320, window.innerWidth, window.innerHeight, 10);

  var noteOn = noteNumber => {
    console.log('note', noteNumber);
    activeNotes.push(noteNumber);
    oscillator.frequency.cancelScheduledValues(0);
    oscillator.frequency.setTargetAtTime(frequencyFromNoteNumber(noteNumber), 0, portamento);
    oscillator2.frequency.cancelScheduledValues(0);
    oscillator2.frequency.setTargetAtTime(frequencyFromNoteNumber(noteNumber)/2, 0, portamento);
    gainNode.gain.cancelScheduledValues(0);
    gainNode.gain.setTargetAtTime(1.0, 0, attack);

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
    }
  }

  var filter = (potikka, value) => {
    console.log('potikka', potikka, 'value', value);
    if (potikka === 4) {
      var curve = makeDistortionCurve(value * 3 + 50);
      distortion.curve = curve;
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

})();
