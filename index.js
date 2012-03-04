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
    MessageModel.find({ indexed:0}).populate('users').run(function (err, docs) {
        if (err) return;
        docs.forEach(function (doc) {
            var mongoDoc = doc;
            doc.users.forEach(function (user) {
                var solrDoc = {
                    id:doc.data.id,
                    user:user.name,
                    author:doc.data.user.screen_name,
                    content:doc.data.text
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