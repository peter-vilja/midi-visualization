var color = 0;
var synth;
var intervals = [];

var initialize = () => {

  synth = new Synth(16);
  drawInit(window.innerWidth, window.innerHeight);
  navigator && navigator.requestMIDIAccess && navigator.requestMIDIAccess().then(success, failure);

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
        let note = data[1];

        synth.noteOn(note);
        drawCircle(note);
        color++;

        let interval = setInterval(() => {
          drawCircle(note);
        }, 100);

        intervals.push({note: note, interval: interval});

        return;
      }
    case 0x80:
      let note = data[1];

      synth.noteOff(note);

      let interval = intervals.filter(x => x.note === note)[0].interval
      clearInterval(interval);
      intervals = intervals.filter(x => x.note !== note)

      return;
    case 0xB0:
      let potikka = data[1];
      let value = data[2];

      synth.filter(potikka, value);

      drawFilter(potikka, value / 127.0);

      return;
  }
};

var onMessage = message => {
  Object.keys(clients).forEach(key => clients[key].messages.send(JSON.stringify(message.data)));
  translateMessage(message.data);
};

var drawCircle = (noteNumber) => draw(noteNumber * window.innerWidth/64 - (window.innerWidth/2), window.innerHeight / 2, window.innerWidth, window.innerHeight, 10, color);


initialize();
