var db = require('../models');

exports.create = function (message, callback) {
    var msg = new db.Message();
    msg.content = message.content;
    msg.creator = message.creator;
    msg.save(callback);
};

exports.read = function (callback) {
    db.Message.find({}).sort({'createAt': -1}).limit(20).exec(callback);
};
