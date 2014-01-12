var util = require('util');
var net = require("net");
var EventEmitter = require('events').EventEmitter;

function start(options) {
	var result = new EventEmitter();
	net.createServer(accept).listen(options.proxyPort);

	function accept(proxySocket) {
		var client = {}; // tag for customer
		result.emit('connect', client);
		var connected = false;
		var buffers = new Array();
		var serviceSocket = new net.Socket();
		serviceSocket.connect(options.servicePort, options.serviceHost,
				function() {
					connected = true;
					if (buffers.length > 0) {
						for (i = 0; i < buffers.length; i++) {
							serviceSocket.write(buffers[i]);
						}
					}
				});
		proxySocket.on("error", function(e) {
			serviceSocket.end();
		});
		serviceSocket.on("error", function(e) {
			console.error("Could not connect to service at host "
					+ options.serviceHost + ', port ' + options.servicePort);
			proxySocket.end();
		});
		proxySocket.on("data", function(data) {
			result.emit('clientToServer', client, data);
			if (connected) {
				serviceSocket.write(data);
			} else {
				buffers[buffers.length] = data;
			}
		});
		serviceSocket.on("data", function(data) {
			result.emit('serverToClient', client, data);
			proxySocket.write(data);
		});
		proxySocket.on("close", function(had_error) {
			console.log('connection closed by client');
			serviceSocket.end();
		});
		serviceSocket.on("close", function(had_error) {
			console.log('connection closed by server');
			proxySocket.end();
		});
	}

	return result;
}

exports.start = start;
