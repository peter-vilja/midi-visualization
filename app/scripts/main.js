var onMessage = function (event) {
  console.log(event);
};

var success = function (access) {
  var inputs = access.inputs();
  inputs.forEach((input) => {
    input.onmidimessage = onMessage;
  });
};

var failure = function (message) {
  console.log(message);
};

navigator.requestMIDIAccess().then(success, failure);
