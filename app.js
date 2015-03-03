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
var async = require('async');

/*
var SessionSockets = require('session.socket.io'),
    sessionSockets = new SessionSockets(io, sessionStore, cookieParser);
*/
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
                Controllers.User.online(user._id, function (err, user) {
                    if(err) {
                        res.status(500).json({msg: err});
                    } else {
                        res.json(user);
                    }
                });
			}
		});
	} else {
		res.status(403).json(null);
	}
});

app.get('/api/logout', function  (req, res) {
    _userId = req.session._userId;
    Controllers.User.offline(_userId, function (err, user) {
        if(err) {
            res.status(500).json({msg: err});
        } else {
            res.status(200).json(null);
            delete req.session._userId;
        }
    });
});

app.use(function (req, res) {

	res.sendFile(__dirname + '/static/index.html');

});

/*var server = require('http').createServer(app),
*/
var io = require('socket.io').listen(app.listen(port));
io.use(function (socket, next) {
    var handshakeData = socket.request;
	handshakeData.cookie = Cookie.parse(handshakeData.headers.cookie);
	var connectSid = handshakeData.cookie['connect.sid'];
	connectSid = connectSid && 0 == connectSid.indexOf('s:') ? signature.unsign(connectSid.slice(2), 'webchat') : connectSid;
	if(connectSid) {
		sessionStore.get(connectSid, function  (err, session) {
            if(err) {
				next(new Error(err.message));
			} else {
				socket.handshake.session = session;
                next();
			}
		});
	} else {
	    next(new Error('No Session'));
    }
});
/*
io.set('authorization', function  (handshakeData, accept) {
	handshakeData.cookie = Cookie.parse(handshakeData.headers.cookie);
	var connectSid = handshakeData.cookie['connect.sid'];
	connectSid = connectSid && 0 == connectSid.indexOf('s:') ? signature.unsign(connectSid.slice(2), 'webchat') : connectSid;
	if(connectSid) {
		sessionStore.get(connectSid, function  (err, session) {
            if(err) {
				accept(err.message, false);
			} else {
				handshakeData.session = session;
                accept(null, true);
			}
		});
	} else {
	    accept('No session', false);
	}
});
*/
var SYSTEM = {
	avatarUrl: 'http://www.gravatar.com/avatar/1354ced4c4c59f5621929a15a20b5039',
	name: 'SYSTEM',
	email: 'system@163.com'
};

io.on('connection', function (socket) {
    _userId = socket.handshake.session._userId;

    Controllers.User.online(_userId, function (err, user) {
        if(err) {
            socket.emit('err', {msg: err});
        } else {
            socket.broadcast.emit('online', user);
            socket.broadcast.emit('messageAdded', {
            	content: user.name + '进入了聊天室',
            	creator: SYSTEM,
            	createAt: new Date()
            });
        }
    });

    socket.on('disconnect', function () {
        Controllers.User.offline(_userId, function (err, user) {
            if(err) {
                socket.emit('err', {
                    msg: err
                });
            } else {
                socket.broadcast.emit('offline', user);
                socket.broadcast.emit('messageAdded', {
                	content: user.name + '离开了聊天室',
                	creator: SYSTEM,
                	createAt: new Date()
                });
                delete socket.handshake.session;
            }
        });
    });

	socket.on('getAllMessages', function () {
        Controllers.Message.read(function (err, messages) {
		    socket.emit('allMessages', messages);
        });
	});

	socket.on('createMessage', function (message) {
        Controllers.Message.create(message, function (err, message) {
            if(err) {
                socket.emit('err', {msg: err});
            } else {
                io.sockets.emit('messageAdded', message);
            }
        });
	});

    socket.on('getRoom', function () {
        async.parallel([function (done) {
            Controllers.User.getOnlineUsers(done);
        },
        function (done) {
            Controllers.Message.read(done);
        }], function (err, results) {
            if(err) {
                socket.emit('err', {msg: err});
            } else {
                socket.emit('roomData', {
                    users: results[0],
                    messages: results[1]
                });
            }
        });
    });

    socket.on('createRoom', function  (room) {
        Controllers.Room.create(room, function  (err, room) {
           if(err) {
            socket.emit('err', {msg: err});
           } else {
            io.sockets.emit('roomAdded', room);
           }
        });
    });

    socket.on('getAllRooms', function  () {
        Controllers.Room.read(function  (err, rooms) {
            if(err) {
                socket.emit('err', {msg: err});
            } else {
                socket.emit('roomsData', rooms);
            }
        });
    });
});

/*
server.listen(port, function () {

	console.log('TechNode is on port ' + port + '!');

});
*/
console.log('TechNode is on port ' + port + '!');
