var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var R = require('ramda');
var calls = {};
var master;

var others = R.curry(function (id, client) {
  return id != client;
});

var add = R.curry(function (id, client) {
  client.inactive.push(id);
  return client;
});

io.on('connection', function (socket) {
  console.log('a user connected');
  var id = socket.id;
  var clients = io.engine.clients;
  var ids = R.compose(R.filter(others(id)), R.keys);
  calls = R.mapObj(add(id), calls);
  calls[id] = {inactive: ids(clients)};
  console.log(calls);

  socket.on('inactive', function (fn) {
    fn(calls[socket.id].inactive);
  });

  socket.on('offer', function (offer) {
    var user = calls[socket.id];
    user.inactive = user.inactive.filter(function (client) { return client != offer.to; });
    io.to(offer.to).emit('offer', {from: socket.id, sdp: offer.sdp});

    var to = calls[offer.to];

    if (to.inactive.length > 0) {
      to.inactive = to.inactive.filter(function (client) { return client != socket.id; });
    }

    if (to.inactive.length > 0) {
      var next = to.inactive[0];
      to.inactive = to.inactive.filter(function (client) { return client != next; });
      calls[next].inactive = calls[next].inactive.filter(function (x) {return x != offer.to});
      io.to(offer.to).emit('createOffer', {to: next});
    }
  });

  socket.on('answer', function (answer) {
    io.to(answer.to).emit('answer', {from: socket.id, sdp: answer.sdp});
  });

  socket.on('iceCandidate', function (candidate) {
    io.to(candidate.to).emit('iceCandidate', {from: socket.id, candidate: candidate.candidate});
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
