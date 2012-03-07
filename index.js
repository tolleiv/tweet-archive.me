var solr = require('solr'),
    config = require('./config'),
    mongoose = require('mongoose'),
    UserModel = require('./models/UserModel'),
    MessageModel = require('./models/MessageModel');

mongoose.connect(config.mongo.url);

var refresh = setInterval(function () {
    indexNewDocs();
}, 10000);

function indexNewDocs() {
    var client = solr.createClient(config.solr);

    MessageModel.find({indexed:0}).limit(100).run(function(err, docs) {
        docs.forEach(function(doc) {
            MessageModel.find({'data.id':doc.data.id}, function(err,messages) {
                var newDoc = doc;
                if (messages.length == 1) {
                    newDoc.indexed = 1;
                    newDoc.save();
                } else if (messages.length > 2) {
                    var indexedDoc = null;
                    messages.forEach(function(msg) {
                        indexedDoc = (!indexedDoc && msg.indexed == 2) ? msg : indexedDoc;
                    });
                    indexedDoc = indexedDoc || newDoc
                    messages.forEach(function(msg) {
                        if (msg._id == indexedDoc._id) { return;}
                        indexedDoc.users = indexedDoc.users.concat(msg.users).unique();
                        msg.indexed = 5
                        msg.save();
                    })
                    indexedDoc.indexed = 1
                    indexedDoc.save();
                } else {
                    var oldDoc = messages[0]._id == newDoc._id ? messages[1] : messages[0];
                    oldDoc.users = oldDoc.users.concat(newDoc.users).unique();
                    oldDoc.indexed = 1;
                    oldDoc.save();
                        // deleted but not (yet) removed
                    newDoc.indexed = 5;
                    newDoc.save();
                }
            });
        })
    });

    MessageModel.find({ indexed: 1}).populate('users').run(function (err, docs) {
        if (err) { console.error(err); return; }
        docs.forEach(function (doc) {
            var mongoDoc = doc;
            var involved = doc.data.entities.user_mentions.map(function(item) { return item.screen_name;});
            involved.push(doc.data.user.screen_name);
            doc.users.forEach(function (user) {
                var solrDoc = {
                    id:doc.data.id,
                    users:[user.name],
                    involved:involved,
                    hashtags:doc.data.entities.hashtags.map(function(item) { return item.text;}),
                    author:doc.data.user.screen_name,
                    content:doc.data.text,
                    date: Math.round(doc.date.getTime()/1000)
                }
                client.add(solrDoc, function (err) {
                    if (err) return;
                    mongoDoc.indexed = 2;
                    mongoDoc.save(function (err, doc) {
                    });
                });
            })

        });
        client.commit();
    });
}


Array.prototype.unique = function() {
    var o = {}, i, l = this.length, r = [];
    for(i=0; i<l;i+=1) o[this[i]] = this[i];
    for(i in o) r.push(o[i]);
    return r;
};
