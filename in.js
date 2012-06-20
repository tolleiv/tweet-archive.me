var twitter = require('ntwitter'),
    mongoose = require('mongoose'),
    UserModel = require('./models/UserModel'),
    MessageModel = require('./models/MessageModel'),
    config = require('./config'),
    expand = require('./helpers/expand.js');

mongoose.connect(config.mongo.url);

var users = {};
var errorCnt = {};
var verbose = process.env.NODE_ENV != 'production';

function capture(query) {
        // Make sure the user is active
    query.features = 1
    UserModel.find(query, function(err, docs) {
        var i = docs.length;
        var tO = setInterval(function() {
            if (i<=0) {
                clearInterval(tO);
            } else {
                captureTweets(docs[i-1]);
            }
            i--;
        }, 100);
    });
}
capture({});
    // get new users as well
var refresh = setInterval(function() { capture({}); }, 30000);

function captureTweets(user) {
    if (typeof user != 'object' || users[user.name] == true) {
        return;
    }

    var twit = new twitter(config.user_credentials(user));
    twit.stream('user', {track:user.name}, function(stream) {
            // Make sure we start him only once
        users[user.name] = true;
        stream.on('data', function (data) {
            var tweet = data;
                // We don't want the friends list
            if (data.friends) {
                return;
            }
                // Other actions e.g. maked sth favorite.
            if (data.target_object) {
                tweet = data.target_object;
                tweet.entities = tweet.entities || {}
                tweet.entities.hashtags = tweet.entities.hashtags  || []
                tweet.entities.urls = tweet.entities.urls  || []
                tweet.entities.user_mentions = tweet.entities.user_mentions  || []
            }
                // Still not the "right" shape?
            if (!tweet.text || !tweet.user || !tweet.user.name) {
                return;
            }

            errorCnt[user.name] = 0;
            expand(tweet.entities.urls, function(urls) {
                var upsertData = {
                    $addToSet:{ users:user._id },
                    $set:{
                        tweetId:tweet.id,
                        data:tweet,
                        summary:tweet.user.screen_name + ': ' + tweet.text,
                        date: new Date()
                    },
                    $inc:{ tweetFound:1 }
                }
                MessageModel.update({tweetId:tweet.id}, upsertData, {upsert:true}, function (err) {
                    if (err) {
                        console.log(data.id + 'not saved');
                        console.log(err)
                    } else {
                        console.log('.' + user.name + tweet.id)
                    }

                });
            });

        });
        stream.on('error', function (err) {  });
        stream.on('end', function (response) { considerRestart(user.name) });
        stream.on('destroy', function (response) { considerRestart(user.name) });
    });
}

function considerRestart(name) {
    users[name] = false;
    errorCnt[name] = errorCnt[name] + 1;
    setTimeout(function () {
        if (errorCnt[name] < 10) {
            capture({name:name})
        } else {
            console.error('Stopped - ' + name)
        }
    }, errorCnt[name] * 1000);
}
