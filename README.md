midi-visualization
==================

Access and visualize midi inputs.

## Instructions

```sh
$ git clone https://github.com/peter-vilja/midi-visualization.git
```
Make sure you have NodeJS installed on your system.

### Install dependencies

```sh
$ npm install
```
### Start

```sh
$ npm install -g gulp
$ gulp watch
```

Currently you have to enable Web MIDI API in Chrome flags and start/restart the browser after the midi device is connected.

Checkout [http://localhost:9000](http://localhost:9000)

### Play with multiple users

```sh
$ node server.js
```

Make sure to change correct IP address for your server in webrtc.js
for example to http://localhost:3000 and refresh the page (compile if needed).

Next check that the browser is successfully connected to web socket server (signaling for webrtc).

After there is multiple users on the server push the "Play with others" -button to establish RTCPeerConnection with other users.
