class MIDIPlayer {

  constructor() {
    this.attack = 0.05;      // attack speed
    this.release = 0.05;   // release speed
    this.portamento = 0.05;  // portamento/glide speed
    this.activeNotes = []; // the stack of actively-pressed keys

    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    this.context = new AudioContext();
    navigator.requestMIDIAccess().then(this.success.bind(this), this.failure.bind(this));

    // set up the basic oscillator chain, muted to begin with.
    this.oscillator = this.context.createOscillator();
    this.oscillator.frequency.setValueAtTime(110, 0);
    this.envelope = this.context.createGain();
    this.oscillator.connect(this.envelope);
    this.envelope.connect(this.context.destination);
    this.envelope.gain.value = 0.0;  // Mute the sound
    this.oscillator.start(0);  // Go ahead and start up the oscillator
  }

  success(access) {
    var self = this;
    access.inputs().forEach((input) => {
      input.onmidimessage = self.onMessage.bind(self);
      console.log(input); // magic??
    });
  }

  failure(message) {
    console.log(message);
  }

  onMessage(event) {
    // Mask off the lower nibble (MIDI channel, which we don't care about)
    switch (event.data[0] & 0xf0) {
      case 0x90:
        if (event.data[2]!=0) {  // if velocity != 0, this is a note-on message
          this.noteOn(event.data[1]);
          return;
        }
        // if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
      case 0x80:
        this.noteOff(event.data[1]);
        return;
    }
  }

  noteOn(noteNumber) {
    this.activeNotes.push(noteNumber);
    this.oscillator.frequency.cancelScheduledValues(0);
    this.oscillator.frequency.setTargetAtTime(this.frequencyFromNoteNumber(noteNumber), 0, this.portamento);
    this.envelope.gain.cancelScheduledValues(0);
    this.envelope.gain.setTargetAtTime(1.0, 0, this.attack);
  }

  noteOff(noteNumber) {
    var position = this.activeNotes.indexOf(noteNumber);
    if (position!=-1) {
      this.activeNotes.splice(position, 1);
    }
    if (this.activeNotes.length == 0) {  // shut off the envelope
      this.envelope.gain.cancelScheduledValues(0);
      this.envelope.gain.setTargetAtTime(0.0, 0, this.release);
    } else {
      this.oscillator.frequency.cancelScheduledValues(0);
      this.oscillator.frequency.setTargetAtTime( this.frequencyFromNoteNumber(this.activeNotes[this.activeNotes.length-1]), 0, this.portamento );
    }
  }

  frequencyFromNoteNumber(note) {
    return 440 * Math.pow(2,(note-69)/12);
  }

}

new MIDIPlayer;
