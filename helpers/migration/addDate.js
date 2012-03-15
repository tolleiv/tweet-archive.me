var
    mongoose = require('mongoose'),
    UserModel = require('../../models/UserModel'),
    MessageModel = require('../../models/MessageModel'),
    config = require('../../config');

mongoose.connect(config.mongo.url);

var toDo = 0;

MessageModel.find({ date: null}).run(function (err, messages) {
    toDo = messages.length

    if (toDo == 0) {
        mongoose.disconnect();
    }

    messages.forEach(function (message) {
        message.date = new Date(message.data.created_at)
        message.save(function(err){
            toDo = toDo -1;
            if (toDo == 0) {
                process.stdout.write('+++')
                mongoose.disconnect();
            } else {
                process.stdout.write('.')
            }
        });
    });
});