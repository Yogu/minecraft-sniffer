var protocol = require('minecraft-protocol').protocol;
var packetNames = require('./packet-names.js').packets;
var colors = require('colors');
var EventEmitter = require('events').EventEmitter;

console.log('Welcome to mincraft-sniffer, the protocol inspector');
console.log('Start your server on port 25565, and connect your client to 25566');
console.log('NOTE: this does not work with encryption. Therefore, offline mode must be enabled.');
console.log('server packets are blue'.blue + ', ' + 'client packets are green'.green);
console.log('');

var proxy = require('./proxy.js').start({
	proxyPort : 25566,
	serviceHost : 'localhost',
	servicePort : 25565
});

proxy.on('connect', function(client) {
	client.incomingBuffer = new Buffer(0);
	client.outgoingBuffer = new Buffer(0);
	client.state = 'handshaking';
	console.log('accepted connection');
});

proxy.on('clientToServer', function(client, data) {
	client.incomingBuffer = Buffer.concat([ client.incomingBuffer, data ]);
	client.incomingBuffer = handleData(client, true /* toServer */, client.incomingBuffer);
});

proxy.on('serverToClient', function(client, data) {
	client.outgoingBuffer = Buffer.concat([ client.incomingBuffer, data ]);
	client.outgoingBuffer = handleData(client, false /* to client */, client.outgoingBuffer);
});

var packets = new EventEmitter();
packets.on('handshaking:toServer:handshake', function(client, packet) {
	var oldState = client.state;
	client.state = ['handshaking', 'status', 'login', 'play'][packet.nextState];
	console.log('state changed from ' + oldState + ' to ' + client.state);
});
packets.on('login:toClient:loginSuccess', function(client, packet) {
	var oldState = client.state;
	client.state = 'play';
	console.log('state changed from ' + oldState + ' to ' + client.state);
});

function handleData(client, isToServer, buffer) {
	var source = isToServer ? 'client' : 'server';
	var dest = isToServer ? 'toServer' : 'toClient';
	while (true) {
		parsed = protocol.parsePacket(buffer, client.state, isToServer);
		if (!parsed)
			break;
		
		if (parsed.error) {
			console.error('parse error from ' + source + ': ' + parsed.error);
		} else {
			packet = parsed.results;
			var name = packetNames[client.state][dest][packet.id];
			if (typeof name == 'undefined')
				console.error('unknown packet id ' + packet.id + ' from ' + source);
			else {
				delete packet.id;
				if (['mapChunkBulk', 'mapChunk'].indexOf(name) >= 0)
					packet.data.compressedChunkData = '(hidden)';
				var output = (name + ': ').bold + JSON.stringify(packet);
				console.log(output[isToServer ? 'green' : 'blue']);

				packets.emit(client.state+':'+dest+':'+name, client, packet);
			}
		}
		buffer = buffer.slice(parsed.size);
	}
	return buffer;
}
