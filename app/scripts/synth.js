class Synth {
  constructor(size) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var id = 0;
    this.param = {
      MasterVolume: id++
    };

    this.controls = [];
    this.maxSize = size;
    this.ctx = new AudioContext();

    if (!this.ctx) return;

    this.oscs = new OscillatorPool(this.ctx, this.maxSize);
    this.masterVolume = this.ctx.createGain();

    this.oscs.connect(this.masterVolume);
    this.masterVolume.connect(this.ctx.destination);
  }

  noteOn(note) {
    this.oscs.noteOn(note);
  }

  noteOff(note) {
    this.oscs.noteOff(note);
  }

  allNotesOff() {
    for (var i = 0; i < 128; i++) {
      this.noteOff(i);
    }
    this.masterVolume.gain.cancelScheduledValues(0);
    this.masterVolume.gain.setTargetAtTime(0.0, 0, 0.05);
  }

  setParam(param_id, val) {
    switch (param_id) {
      case this.param.MasterVolume:
        this.masterVolume.gain.value = val / 100.0;
        break;
      default:
        this.oscs.setParam(param_id, val);
        break;
    }
  }
}
