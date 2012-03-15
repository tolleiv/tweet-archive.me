var mongoose = require('mongoose'),
    solr = require('solr'),
    UserModel = require('../models/UserModel'),
    MessageModel = require('../models/MessageModel'),
    search = require('../helpers/solr-search.js'),
    config = require('../config'),
    facet = require('./facet.js');

// Open DB connection
mongoose.connect(config.mongo.url);

exports.index = function (req, res) {
    if (typeof req.session.twitter != 'object') {
        res.render('hello', { title:'tweet-archive.me' });
        return;
    }
    UserModel.findOne({ name:req.session.twitter.name }, function (err, doc) {
        if (doc.features <= 0) {
            res.render('wait', { title:'tweet-archive.me', name:req.session.twitter.name });
        } else {
            MessageModel.find({users:doc._id, indexed: 2}).count().run(function (err, cnt) {
                res.render('index', { title:'tweet-archive.me', name:req.session.twitter.name, count:(err ? 0 : cnt) });
            });
        }
    });
};

exports.tweets = function (req, res) {
    if (typeof req.session.twitter != 'object') {
        res.send('what???', 401);
        return;
    }
    UserModel.findOne({ name:req.session.twitter.name, features:1 }, function (err, doc) {
        MessageModel.find({users:doc._id, indexed: 2}).desc('date').limit(config.app.listMax).skip(parseInt(req.param('offset', 0))).run(function (err, docs) {
            if (req.params.format) {
                res.json(docs);
            }
        });
    });
}

exports.search = function (req, res) {
    if (typeof req.session.twitter != 'object') {
        res.send('what???', 401);
        return;
    }
    var fq = ['users:' + req.session.twitter.name];
    var query = req.query.q ? req.query.q.replace(/:/, '') : '*:*';

    if (req.query.involved) {
        fq.push('involved:' + req.query.involved.split(',').join(' OR involved:'));
    }
    if (req.query.hashtags) {
        fq.push('hashtags:' + req.query.hashtags.split(',').join(' OR hashtags:'));
    }
    var queryOptions = {
        fq: fq,
        start: parseInt(req.query.offset) || 0,
        rows: config.app.listMax
    };

    if (!req.query.q) {
        queryOptions.sort = 'date desc'
    }
                                   console.log(queryOptions)
    search.find(query, queryOptions, function(docs) {
        res.json(docs);
    });
}

/****************************************
 * Facetten
 ****************************************/
exports.involved = function(req, res) {
    facet.list(req, res,  'involved', 'hashtags')
}
exports.tags = function(req, res) {
    facet.list(req, res,  'hashtags', 'involved')
}

/****************************************
 * Login stuff
 ****************************************/
exports.start = function (req, res) {
    delete req.session.destroy();
    res.redirect('/sessions/login');
};

exports.login = function (req, res) {
    UserModel.findOne({ name:req.session.twitter.name }, function (err, doc) {
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
            doc.save(function (err) {
                res.redirect('/');
            });
        }
    });
};

exports.logout = function (req, res) {
    delete req.session.destroy();
    res.redirect('/');
};


/****************************************
 * Dummy accounts
 ****************************************/
exports.milli = function(req, res) {
    req.session.twitter = {
        accessToken: '507823411-pLPjU1mI4kVIwh2xuwUj5bNp9TfyR9hBCD6pX1A',
        accessTokenSecret: 'OBmDUiH7VDhpmXNR9w8UyoaeD3gdNMGF7p10OoVjX0',
        name: 'MilliHoffn'
    };
    res.redirect('/');
};

exports.hans = function(req, res) {
    req.session.twitter = {
        accessToken: '507400598-Ht2ugTTMo2c9v70wH8N4JGtwtUtzcEPRLUVuPL2v',
        accessTokenSecret: 'BRQjN2yg0Zx7lpsbW7M86xUizN0dVJ28yKaByEb0uJ4',
        name: 'le_hansdampf'
    };
    res.redirect('/');
};