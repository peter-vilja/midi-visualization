class Voice {
  constructor(ctx) {
    this.ctx = ctx;
    this.nextNode = null;
    this.frequencyFromNoteNumber = note => 440 * Math.pow(2,(note-69)/12);
  }

  connect(node) {
    this.nextNode = node;
  }

  noteOn(note) {
    this.note = note;
    this.osc = this.ctx.createOscillator();
    this.osc.frequency.value = this.frequencyFromNoteNumber(note);
    this.osc.connect(this.nextNode);
    this.osc.start(0);
  }

  changeNote(note) {
    this.osc.frequency.value = this.frequencyFromNoteNumber(note);
  }

  noteOff() {
    this.osc.frequency.cancelScheduledValues(0);
    this.osc.frequency.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    //this.osc.stop(0);
  }
}
