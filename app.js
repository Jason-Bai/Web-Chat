var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var signature = require('cookie-signature');
var Cookie = require('cookie');
var MongoStore = require('connect-mongo')(session);
var app = express();
var port = process.env.PORT || 3000;
var Controllers = require('./controllers');
var sessionStore = new MongoStore({
	url: 'mongodb://localhost/webchat'
});

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	secret: 'webchat',
	cookie: {
		maxAge: 60 * 1000
	},
	resave: true,
  saveUninitialized: true,
  store: sessionStore
}));
app.use(express.static(__dirname + '/static'));

app.get('/api/validate', function  (req, res) {
	_userId = req.session._userId;
	if(_userId) {
		// 已登录
		Controllers.User.findUserById(_userId, function  (err, user) {
			if(err) {
				res.status(401).json({msg: err});
			} else {
				res.json(user);
			}
		});
	} else {
		// 未登录
		res.status(401).json(null);
	}
});

app.post('/api/login', function  (req, res) {
	email = req.body.email;
	if(email) {
		Controllers.User.findByEmailOrCreate(email, function  (err, user) {
			if(err) {
				res.status(500).json({msg: err});
			} else {
				req.session._userId = user._id;
				res.status(200).json(user);
			}
		});
	} else {
		res.status(403).json(null);
	}
});

app.get('/api/logout', function  (req, res) {
	req.session._userId = null;
	res.json(401);
});

app.use(function (req, res) {

	res.sendFile(__dirname + '/static/index.html');

});

/*var server = require('http').createServer(app),
*/
var io = require('socket.io').listen(app.listen(port));

io.set('authorization', function  (handshakeData, accept) {
	handshakeData.cookie = Cookie.parse(handshakeData.headers.cookie);
	var connectSid = handshakeData.cookie['connect.sid'];
	connectSid = connectSid && 0 == connectSid.indexOf('s:') ? signature.unsign(connectSid.slice(2), 'webchat') : connectSid;
	if(connectSid) {
		sessionStore.get(connectSid, function  (err, session) {
			if(err) {
				return accept(err.message, false);
			} else {
				handshakeData.session = session;
				if(!session._userId) {
					return accept('No login', false);
				}
			}
		});
	} else {
		return accept('No session');
	}
	accept(null, true);
});

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