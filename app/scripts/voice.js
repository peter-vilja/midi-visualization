class Voice {
  constructor(ctx, oscNotes) {
    this.ctx = ctx;
    this.portamento = 0.05;
    this.frequencyFromNoteNumber = note => 440 * Math.pow(2,(note-69)/12);
    this.osc = this.ctx.createOscillator();
    this.osc2 = this.ctx.createOscillator();
    this.osc.frequency.value = 0;
    this.osc2.frequency.value = 0;
    this.osc.start(0);
    this.osc2.start(0);
  }

  connect(node) {
    this.osc.connect(node);
    this.osc2.connect(node);
  }

  noteOn(note) {
    this.note = note;
    this.osc.frequency.cancelScheduledValues(0);
    this.osc.frequency.setTargetAtTime(this.frequencyFromNoteNumber(note), 0, this.portamento);
    this.osc2.frequency.cancelScheduledValues(0);
    this.osc2.frequency.setTargetAtTime(this.frequencyFromNoteNumber(note)/2, 0, this.portamento);
  }

  changeNote(note) {
    var fadeInto = typeof note !== 'undefined' ? this.frequencyFromNoteNumber(note) : 0;
    this.osc.frequency.cancelScheduledValues(0);
    this.osc.frequency.setTargetAtTime(fadeInto, this.ctx.currentTime, this.portamento);
    this.osc2.frequency.cancelScheduledValues(0);
    this.osc2.frequency.setTargetAtTime(fadeInto/2, this.ctx.currentTime, this.portamento);
  }

  noteOff() {
    this.osc.frequency.cancelScheduledValues(0);
    this.osc.frequency.setTargetAtTime(0, this.ctx.currentTime, this.portamento);
    this.osc2.frequency.cancelScheduledValues(0);
    this.osc2.frequency.setTargetAtTime(0, this.ctx.currentTime, this.portamento);
    //this.osc.stop(0);
  }

  setType(type) {
    this.osc.type = type;
    this.osc2.type = type;
  }
}
