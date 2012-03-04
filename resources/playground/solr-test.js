var solr = require('solr'),
    config = require('../../config'),
    mongoose = require('mongoose'),
    UserModel = require('../../models/UserModel'),
    MessageModel = require('../../models/MessageModel');

var client = solr.createClient(config.solr);

var query = '*:*';
var options = {
    fq : [ 'user:tolleiv', 'f_author:dmitryd' ],
    start:0,
    rows: 0,
    facet: true,
    'facet.field': 'f_author',
    'facet.limit': 10
}

// select/?q=user:tolleiv+author:robertlemke%0D%0A&version=2.2&start=0&rows=0&facet=true&facet.field=f_author
client.query(query, options, function(err, response) {
   var responseObj = JSON.parse(response);
  console.log(responseObj.facet_counts.facet_fields.f_author)
});

    // Delete all we have
/*
var id, query = '*:*';
client.del(id, query, function(err, response) {
     if (err) throw err;
     console.log('Deleted all docs matching query "' + query + '"');
     client.commit();
});

*/
 /*
mongoose.connect(config.mongo.url);

MessageModel.find({ indexed: 0}).populate('users').run(function(err, docs) {
    docs.forEach(function(doc) {
        var mongoDoc = doc;
        doc.users.forEach(function(user) {
            var solrDoc = {
                id: doc.data.id,
                user: user.name,
                author: doc.data.user.screen_name,
                content: doc.data.text
            }
            client.add(solrDoc, function(err) {
                mongoDoc.indexed = 1;
                mongoDoc.save(function(err, doc) {});
                process.stdout.write("√");
            });
            process.stdout.write(".");
        })

    });
    process.stdout.write("commit");
    client.commit();
    mongoose.connection.close();
});
  */
 /*
UserModel.find({}).run(function(err, users) {
    processArray(users, function(user) {
       console.log('Proc ' + user.name);
    }, function() {
        mongoose.connection.close();
    });
});
*/
/*
function processArray(items, process, done) {
    var todo = items.concat();
    setTimeout(function() {
        process(todo.shift());
        if(todo.length > 0) {
            setTimeout(arguments.callee, 25);
        } else {
           done();
        }
    }, 25);
}
  */

// select/?q=user:tolleiv+author:robertlemke%0D%0A&version=2.2&start=0&rows=0&facet=true&facet.field=f_author
// q=something&rows=10&start=20
// ?q=typo3&fq=user:tolleiv&start=0&rows=0&facet=true&facet.field=f_author&facet.limit=10



/*
var query = 'user:tolleiv'
   client.query(query, function(err, response) {
     if (err) throw err;
     var responseObj = JSON.parse(response);
     console.log('A search for "' + query + '" returned ' +
         responseObj.response.numFound + ' documents.');     /*
     console.log('First doc title: ' + responseObj.response.docs[0].title_t);
     console.log('Second doc title: ' + responseObj.response.docs[1].title_t);*/
 /*  });

/*


function indexForUser(user) {
    MessageModel.find({users: user._id}).run(function(err, docs) {
        for(var i=0;i<docs.length;i++) {
            var doc = {
                id: docs[i].data.id,
                user: user.name,
                author: docs[i].data.user.screen_name,
                content: docs[i].data.text
            }
            client.add(doc, function(err) { });
        }
        client.commit(); console.log(user.name + ' done')
    });

}
*/
