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
    MessageModel.find( { $or :  [ { indexed: 0},{ indexed: null}] } ).limit(1000).populate('users').run(function (err, docs) {
        if (err) { console.error(err); return; }
        docs.forEach(function (doc) {
            if (doc.users.length == 0) {
                doc.indexed = -1;
                doc.save();
                return;
            }
            var mongoDoc = doc;
            var involved = doc.data.entities.user_mentions.map(function(item) { return item.screen_name;});
            involved.push(doc.data.user.screen_name);
            var users = doc.users.map(function(item) { return item.name; })

            var solrDoc = {
                id:doc.data.id,
                users:users,
                involved:involved,
                hashtags:doc.data.entities.hashtags.map(function(item) { return item.text;}),
                author:doc.data.user.screen_name,
                content:doc.data.text,
                date: (new Date(doc.data.created_at)).toISOString() // Math.round(doc.date.getTime()/1000)
            }
            client.add(solrDoc, function (err) {
                if (err) {
                    console.log(err);
                    return;
                }
                mongoDoc.indexed = 2;
                mongoDoc.save(function (err, doc) {
                    if (err){
                        console.error(err);
                    }
                });
            });

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
