class Synth {
  constructor(size) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    this.portamento = 0.05;

    this.ctx = new AudioContext();
    let tuna = new Tuna(this.ctx);
    this.oscs = new OscillatorPool(this.ctx, size);
    this.currentType = 'sine';

    this.masterVolume = this.ctx.createGain();
    let output = this.ctx.createGain();
    this.feedback = this.ctx.createGain();

    this.delay = this.ctx.createDelay();
    this.biquadFilter = this.ctx.createBiquadFilter();
    this.distortion = this.ctx.createWaveShaper();

    this.chorus = new tuna.Chorus({
      rate: 0.01,         //0.01 to 8+
      feedback: 0.0,     //0 to 1+
      delay: 0.0045,      //0 to 1
      bypass: 0          //the value 1 starts the effect as bypassed, 0 or 1
    });

    this.wahwah = new tuna.WahWah({
      automode: true,                //true/false
      baseFrequency: 0.5,            //0 to 1
      excursionOctaves: 2,           //1 to 6
      sweep: 0.8,                    //0 to 1
      resonance: 10,                 //1 to 100
      sensitivity: 0.5,              //-1 to 1
      bypass: 1
    });



    /*/this.masterVolume.connect(this.distortion);
    //this.wahwah.connect(distortion); // wah wah is not in use currently
    this.distortion.connect(this.biquadFilter);
    this.biquadFilter.connect(this.chorus.input);
    this.chorus.connect(this.delay);
    this.chorus.connect(output); // dry sound without delay
    this.delay.connect(this.feedback); // feedback loop
    this.feedback.connect(this.delay);
    this.delay.connect(output);
    this.oscs.connect(this.masterVolume);
    this.modulo.connect(this.masterVolume);
    output.connect(this.ctx.destination);*/

    this.masterVolume.connect(this.distortion);
    this.distortion.connect(this.chorus.input);
    this.chorus.connect(this.delay);
    this.chorus.connect(this.biquadFilter);
    this.delay.connect(this.feedback); // feedback loop
    this.feedback.connect(this.delay);
    this.delay.connect(this.biquadFilter);
    this.biquadFilter.connect(this.wahwah.input);
    this.wahwah.connect(output);

    this.oscs.connect(this.masterVolume);
    output.connect(this.ctx.destination);

    this.masterVolume.gain.value = 0.5;
    output.gain.value = 0.5;
    this.feedback.gain.value = 0.0;
    this.delay.delayTime.value = 0.0;
    this.distortion.curve = new Float32Array;
    this.biquadFilter.type = this.biquadFilter.LOWPASS;
    this.biquadFilter.frequency.value = 500;
    output.gain.value = 1.0;
  }

  noteOn(note) {
    this.oscs.noteOn(note);
  }

  noteOff(note) {
    this.oscs.noteOff(note);
  }

  filter(potikka, value) {
    if (potikka === 1) {
      var prevolume = value / 127.0;
      this.masterVolume.gain.cancelScheduledValues(0);
      this.masterVolume.gain.setTargetAtTime(prevolume, 0, this.portamento);
    } else if (potikka === 2) {
      this.chorus.rate = value / 16 + 0.01;
    } else if (potikka === 3) {
      if (value === 0) {
        this.wahwah.bypass = 1;
      } else {
        this.wahwah.bypass = 0;
      }
    } else if (potikka === 4) {
      if (value === 0) {
        this.distortion.curve = new Float32Array;
      } else {
        this.distortion.curve = makeDistortionCurve(value);
      }
    } else if (potikka === 5) {
      var delaytime = value / 64;
      this.delay.delayTime.cancelScheduledValues(0);
      this.delay.delayTime.setTargetAtTime(delaytime, 0, this.portamento);
    } else if (potikka === 6) {
      var feedbackAmount = value / 130;
      this.feedback.gain.cancelScheduledValues(0);
      this.feedback.gain.setTargetAtTime(feedbackAmount, 0, this.portamento);
    } else if (potikka === 7) {
      var mod = value / 30;
      var type;
      if (mod < 1) {
        type = 'sine';
      } else if (mod < 2) {
        type = 'square';
      } else if (mod < 3) {
        type = 'sawthooth';
      } else {
        type = 'triangle';
      }

      if (this.currentType !== type) {
        console.log(type);
        this.currentType = type;
        this.oscs.setType(type);
      }
    } else {
      this.biquadFilter.frequency.value = value * 100 + 100;
    }

  };
}

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
