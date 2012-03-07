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
    MessageModel.find({ indexed: 0}).populate('users').run(function (err, docs) {
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
                    mongoDoc.indexed = 1;
                    mongoDoc.save(function (err, doc) {
                    });
                });
            })

        });
        client.commit();
    });
}
