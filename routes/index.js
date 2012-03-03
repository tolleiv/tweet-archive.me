
var mongoose    = require('mongoose'),
    UserModel = require('../models/UserModel'),
    MessageModel = require('../models/MessageModel'),
    config = require('./config');

// Open DB connection
mongoose.connect(config.mongo.url);

exports.index = function(req, res){
    if (typeof req.session.twitter != 'object') {
        res.render('hello', { title: 'tweet-archive.me' })
    } else {
        UserModel.findOne({ name: req.session.twitter.name }, function(err, doc) {
            if (doc.features <= 0) {
                res.render('wait', { title: 'tweet-archive.me', name: req.session.twitter.name });
            } else {
                MessageModel.find({users: doc._id}).count().run(function(err, cnt) {
                    res.render('index', { title: 'tweet-archive.me', name: req.session.twitter.name, count: (err ? 0 : cnt) });
                });
            }
        });
    }
};

exports.tweets = function(req, res) {
    if (typeof req.session.twitter != 'object') {
        res.send('what???', 401);
        return;
    }
    UserModel.findOne({ name: req.session.twitter.name, features: 1 }, function(err, doc) {
        MessageModel.find({users: doc._id}).desc('date').limit(25).skip(parseInt(req.param('offset', 0))).run(function(err, docs) {
            if (req.params.format) {
                res.json(docs);
            }
        });
    });
}

exports.start = function(req, res) {
    delete req.session.destroy();
    res.redirect('/sessions/login');
};

exports.login = function(req, res) {
    UserModel.findOne({ name: req.session.twitter.name }, function(err, doc) {
        if (err || !doc) {
            var user = new UserModel();
            user.name = req.session.twitter.name
            user.token = req.session.twitter.accessToken
            user.tokenSecret = req.session.twitter.accessTokenSecret
            user.save(function (err) {
                if (!err) console.log('New user ' + user.name);
                res.redirect('/');
            });
        } else {
                // User found :)
            doc.lastlogin = new Date();
            doc.token = req.session.twitter.accessToken
            doc.tokenSecret = req.session.twitter.accessTokenSecret
            doc.save(function(err) {
                res.redirect('/');
            });
        }
    });
};

exports.logout = function (req, res) {
    delete req.session.destroy();
    res.redirect('/');
};