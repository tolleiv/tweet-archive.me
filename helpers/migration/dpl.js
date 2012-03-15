var
    mongoose = require('mongoose'),
    UserModel = require('../../models/UserModel'),
    MessageModel = require('../../models/MessageModel'),
    TweetModel = require('../../models/TweetModel'),
    config = require('../../config');

mongoose.connect(config.mongo.url);

var toDo = 0;

TweetModel.find({}).run(function (err, messages) {
    toDo = messages.length

    if (toDo == 0) {
        mongoose.disconnect();
    }


    messages.forEach(function (message) {

        var upsertData = {
            $addToSet:{ users:{ $each:message.users } },
            $set:{
                tweetId:message.data.id,
                data:message.data,
                summary:message.summary,
                date:message.date,
                indexed: 0
            },
            $inc:{ tweetFound:1 }
        }
        MessageModel.update({tweetId:message.data.id}, upsertData, {upsert:true}, function (err) {
            if (err) {
                console.log(err);
            } else {
                process.stdout.write('.')
            }
            toDo = toDo -1;
            if (toDo == 0) {
                process.stdout.write('+++')
                mongoose.disconnect();
            }
        });
        return;
    });
});