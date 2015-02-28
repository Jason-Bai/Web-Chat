var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/webchat');
exports.User = mongoose.model('User', require('./user'));