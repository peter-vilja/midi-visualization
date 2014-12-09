class Voice {
  constructor(ctx, oscNotes) {
    this.ctx = ctx;
    this.nextNode = null;
    this.frequencyFromNoteNumber = note => 440 * Math.pow(2,(note-69)/12);
    this.osc = this.ctx.createOscillator();
    this.osc.frequency.value = 0;
    this.osc.start(0);
  }

  connect(node) {
    this.nextNode = node;
    this.osc.connect(this.nextNode);
  }

  noteOn(note) {
    this.note = note;
    this.osc.frequency.cancelScheduledValues(0);
    this.osc.frequency.setTargetAtTime(this.frequencyFromNoteNumber(note), 0, 0.05);
  }

  changeNote(note) {
    var fadeInto = typeof note !== 'undefined' ? this.frequencyFromNoteNumber(note) : 0;
    this.osc.frequency.cancelScheduledValues(0);
    this.osc.frequency.setTargetAtTime(fadeInto, this.ctx.currentTime, 0.05);
  }

  noteOff() {
    this.osc.frequency.cancelScheduledValues(0);
    this.osc.frequency.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    //this.osc.stop(0);
  }
}
