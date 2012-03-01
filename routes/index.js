
/*
 * GET home page.
 */

var mongoose    = require('mongoose'),
    UserModel = require('../models/UserModel');
  //  messageModel = require('../models/MessageModel');

// Open DB connection
mongoose.connect('mongodb://localhost/members');

exports.index = function(req, res){
    if (typeof req.session.twitter != 'object') {
        res.render('hello', { title: 'tweet-archive.me' })
    } else {
        res.render('index', { title: 'tweet-archive.me', name: req.session.twitter.name })
    }
};

exports.update = function(req, res) {

}

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
            res.redirect('/');
        }
    });
};