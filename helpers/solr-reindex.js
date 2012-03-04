var solr = require('solr'),
    config = require('../config'),
    mongoose = require('mongoose'),
    UserModel = require('../models/UserModel'),
    MessageModel = require('../models/MessageModel');

var client = solr.createClient(config.solr);

mongoose.connect(config.mongo.url);

var id, query = '*:*';
client.del(id, query, function(err, response) {
     if (err) throw err;
     console.log('Deleted all docs matching query "' + query + '"');
     client.commit();
});


MessageModel.update({}, { indexed: 0 }, { multi: true }, function(err){
    mongoose.connection.close();
});