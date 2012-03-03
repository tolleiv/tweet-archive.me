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
    if (typeof user != 'object' || users[user.name] == true) return;

    var twit = new twitter(config.user_credentials(user));
    twit.stream('user', {track:user.name}, function(stream) {
            // Make sure we start him only once
        users[user.name] = true;
        stream.on('data', function (data) {
            if (data.text && data.user && data.user.name) {
                errorCnt[user.name] = 0;
                expand(data.entities.urls, function(urls) {
                    data.entities.urls = urls;
                    var message = new MessageModel();
                    message.summary = data.user.screen_name + ': ' + data.text
                    message.data = data
                    message.users.push(user._id);
                    message.save(function (err) {
                        if (!err && verbose) console.log('[' + user.name + ']' + data.user.screen_name + ': ' + data.text);
                    });
                });

            }
        });
        stream.on('error', function (err) {
            if (verbose) console.log('Event: error')
            if (verbose) console.log(err);
        });
        stream.on('end', function (response) {
            if (verbose) console.log('Event: end - ' + user.name)
            if (verbose) console.log(response);
            users[user.name] = false;
            errorCnt[user.name] = errorCnt[user.name]+1;
            setTimeout(function() {
                if (errorCnt[user.name] < 10) {
                    if (verbose) console.log('Restart');
                    capture({name: user.name})
                } else {
                    console.error('Stopped - ' + user.name)
                }
            }, errorCnt[user.name]*1000);
        });
        stream.on('destroy', function (response) {
            // Handle a 'silent' disconnection from Twitter, no end/error event fired
            if (verbose) console.log('Event: destroy' + user.name);
            users[user.name] = false;
            errorCnt[user.name] = errorCnt[user.name]+1;
            setTimeout(function() {
                if (errorCnt[user.name] < 10) {
                    if (verbose) console.log('Restart');
                    capture({name: user.name})
                } else {
                    console.error('Stopped - ' + user.name)
                }
            }, errorCnt[user.name]*1000);
        });
    });
    console.info('Streaming for ' + user.name);
}
