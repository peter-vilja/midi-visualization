(function () {
  var attack = 0.05; // attack speed
  var release = 0.05; // release speed
  var portamento = 0.05; // portamento/glide speed
  var activeNotes = []; // the stack of actively-pressed keys
  var oscillator, envelope, context;

  var initialize = () => {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    context = new AudioContext();
    navigator.requestMIDIAccess().then(success, failure);

    // set up the basic oscillator chain, muted to begin with.
    oscillator = context.createOscillator();
    oscillator.frequency.setValueAtTime(110, 0);

    envelope = context.createGain();
    oscillator.connect(envelope);
    envelope.connect(context.destination);
    envelope.gain.value = 0.0;  // Mute the sound
    oscillator.start(0);  // Go ahead and start up the oscillator
  };

  var success = (access) => {
    access.inputs().forEach((input) => {
      input.onmidimessage = onMessage;
      console.log(input); // magic??
    });
  };

  var failure = (message) => {
    console.log(message);
  };

  var onMessage = (event) => {
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
    }
  };

  var noteOn = (noteNumber) => {
    activeNotes.push(noteNumber);
    oscillator.frequency.cancelScheduledValues(0);
    oscillator.frequency.setTargetAtTime(frequencyFromNoteNumber(noteNumber), 0, portamento);
    envelope.gain.cancelScheduledValues(0);
    envelope.gain.setTargetAtTime(1.0, 0, attack);
    draw(400, 320, window.innerWidth, window.innerHeight, 1);
  };

  var noteOff = (noteNumber) => {
    let position = activeNotes.indexOf(noteNumber);
    if (position != -1) {
      activeNotes.splice(position, 1);
    }
    if (activeNotes.length == 0) {  // shut off the envelope
      envelope.gain.cancelScheduledValues(0);
      envelope.gain.setTargetAtTime(0.0, 0, release);
    } else {
      oscillator.frequency.cancelScheduledValues(0);
      oscillator.frequency.setTargetAtTime(frequencyFromNoteNumber(activeNotes[activeNotes.length-1]), 0, portamento);
    }
  }

  var frequencyFromNoteNumber = (note) => 440 * Math.pow(2,(note-69)/12);

  initialize();

})();
