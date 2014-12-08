var socket = io('http://10.23.7.25:3000');
var connect = document.getElementById('connect');
var clients = {};

var setLocalDescription = (connection, description) => connection.setLocalDescription(description);

var sendAnswer = (connection, client) => {
  return description => {
    console.log('sending answer to', client);
    setLocalDescription(connection, description);
    socket.emit('answer', {'to': client, 'sdp': description});
  };
};

socket.on('offer', ({from, sdp}) => {
  console.log('offer from', from);
  var client = clients[from]
  if (client) {
    var c = client.connection;
    c.setRemoteDescription(new RTCSessionDescription(sdp));
    c.createAnswer(sendAnswer(c, from));
  } else {
    let conn = createConnection();
    conn.onicecandidate = ({candidate}) => socket.emit('iceCandidate', {'to': from, 'candidate': candidate});
    conn.ondatachannel = (event) => {
      clients[from].messages = event.channel;
      clients[from].messages.onmessage = showMessage(from);
    };

    clients[from] = {connection: conn};
    conn.setRemoteDescription(new RTCSessionDescription(sdp));
    conn.createAnswer(sendAnswer(conn, from));
  }
});

socket.on('answer', ({from, sdp}) => {
  console.log('answer from', from);
  var conn = clients[from].connection;
  conn.setRemoteDescription(new RTCSessionDescription(sdp));
});

socket.on('iceCandidate', ({from, candidate}) => {
  console.log('candidate from', from);
  if (candidate) {
    var conn = clients[from].connection;
    conn.addIceCandidate(new RTCIceCandidate(candidate));
  }
});

socket.on('createOffer', ({to}) => {
  console.log('createOffer');
  let conn = createConnection();
  conn.onicecandidate = ({candidate}) => socket.emit('iceCandidate', {'to': to, 'candidate': candidate});

  clients[to] = {connection: conn};
  clients[to].messages = createMessageChannel(conn, to);
  conn.createOffer(sendOffer(conn, to));
});

var showMessage = from => {
  return event => {
    console.log(event.data);
    translateMessage(JSON.parse(event.data));
  };
};

var createMessageChannel = (connection, from) => {
  console.log('createMessageChannel');
  var messages = connection.createDataChannel('Messages', {reliable: true});
  messages.onmessage = showMessage(from);
  return messages;
};

var sendOffer = (connection, client) => {
  return description => {
    console.log('sending offer');
    setLocalDescription(connection, description);
    socket.emit('offer', {'to': client, 'sdp': description});
  };
};

var createConnection = () => new RTCPeerConnection({iceServers: [{url: 'stun:stun.l.google.com:19302'}]}, {optional: [{RtpDataChannels: true}]});

var call = () => {
  socket.emit('inactive', inactive => {
    inactive.forEach(client => {
      let conn = createConnection();
      conn.onicecandidate = ({candidate}) => socket.emit('iceCandidate', {'to': client, 'candidate': candidate});

      clients[client] = {connection: conn};
      clients[client].messages = createMessageChannel(conn, client);
      conn.createOffer(sendOffer(conn, client));
    });
  });
};

var succ = stream => {
  local.src = URL.createObjectURL(stream);
  local.classList.add('streaming');
  Object.keys(clients).forEach(key => {
    var conn = clients[key].connection;
    var streams = conn.getLocalStreams();
    streams.forEach(stream => {
      conn.removeStream(stream);
    });
    conn.addStream(stream);
    conn.createOffer(sendOffer(conn, key));
  });
};

var failure = (e) => console.log('getUserMedia failed!', e);

connect.addEventListener('click', call, false);
