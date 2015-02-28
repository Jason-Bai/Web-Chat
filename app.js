var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/static'));

app.use(function (req, res) {

	res.sendFile(__dirname + '/static/index.html');

});

/*var server = require('http').createServer(app),
*/
var io = require('socket.io').listen(app.listen(port));

var messages = [];

io.sockets.on('connection', function (socket) {

	// socket.emit('connected');

	socket.on('getAllMessages', function () {

		socket.emit('allMessages', messages);

	});

	socket.on('createMessage', function (message) {

		messages.push(message);

		socket.broadcast.emit('messageAdded', message);

	});

});

/*
server.listen(port, function () {

	console.log('TechNode is on port ' + port + '!');

});
*/
console.log('TechNode is on port ' + port + '!');