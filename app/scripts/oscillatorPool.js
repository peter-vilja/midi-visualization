class OscillatorPool {
  constructor(ctx, size) {
    this.ctx = ctx;
    this.maxSize = size;
    this.osc = new Array(size);
    this.oscNote = new Array(size);
    this.oscBusy = new Array(size);
    for (var i = 0; i < this.osc.length; i++) {
      this.osc[i] = new Voice(this.ctx);
      this.oscBusy[i] = false;
    }
    this.pressedNotes = [];
  }

  connect(node) {
    this.osc.forEach(osc => {
      osc.connect(node);
    });
  }

  noteOn(note) {
    if (this.pressedNotes.indexOf(note) >= 0) return; //if already pressed

    this.pressedNotes.unshift(note);

    if (this.pressedNotes.length > this.maxSize) {
      var mute = this.pressedNotes[this.maxSize];
      for (var i = 0; i < this.mazSize; i++) {
        if (this.oscNote[i] === mute) {
          this.osc[i].noteOff();
          this.oscNote[i] = note;
          this.osc[i].noteOn(note);
        }
      }
    } else {
      for (var i = 0; i < this.osc.length; i++) {
        if (!this.oscBusy[i]) {
          this.oscNote[i] = note;
          this.osc[i].noteOn(note);
          this.oscBusy[i] = true;
          return true;
        }
      }
    }
  }

  noteOff(note) {
    var index = this.pressedNotes.indexOf(note);
    this.pressedNotes.splice(index, 1);

    if ((index < this.maxSize) && (this.pressedNotes.length >= this.maxSize)) {
      var popNote = this.pressedNotes[this.maxSize - 1];

      for (var i = 0; i < this.maxSize; i++) {
        if (this.oscNote[i] === note) {
          this.oscNote[i] = popNote;
          this.osc[i].changeNote(popNote);
        }
      }
    }

    for (var i = 0; i < this.osc.length; i++) {
      if ((this.oscBusy[i]) && (this.oscNote[i] === note)) {
        // if other notes are busy change the osc to play lastly pressed note
        if (this.oscBusy.filter(function (x) { return x === true; }).length >= 2) {
          this.osc[i].changeNote(this.pressedNotes[this.pressedNotes.length-1]);
        } else {
          this.osc[i].noteOff();
        }
        this.oscBusy[i] = false;

        // check if need note off for everything
        if (this.oscBusy.every(function (x) { return x === false;})) {
          for (var j = 0; j < this.osc.length; j++) {
            this.osc[j].noteOff();
          }
        }
      }
    }
  }

  setParam(param, val) {
    for (var i = 0; i < this.osc.length; i++) {
      this.osc[i].setParam(param, val);
    }
  }
}
