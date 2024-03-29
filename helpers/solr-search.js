var solr = require('solr'),
    UserModel = require('../models/UserModel'),
    MessageModel = require('../models/MessageModel'),
    config = require('../config');


var client = solr.createClient(config.solr);

/**
 * Use the Solr indexed to find messsges and Mongo to populate the
 * actual message data
 *
 * @param query
 * @param queryOptions
 * @param callback
 */
module.exports.find = function(query, queryOptions, callback) {
    client.query(query, queryOptions, function (err, response) {
        if (err) return;
        var result = [];
        var responseObj = JSON.parse(response);
        responseObj.response.docs.forEach(function (doc) {
            result.push(parseInt(doc.id));
        });
        MessageModel.find({'data.id': { $in: result } }).run(function (err, docs) {
            var sortedDocs = []
            var mongoDocs = docs.concat();
            result.forEach(function(searchDoc) {
                mongoDocs.forEach(function(mongoDoc) {
                    if (searchDoc == mongoDoc.data.id) {
                        sortedDocs.push(mongoDoc);
                    }
                });
            });
            callback(sortedDocs);
        });
    });
};

/**
 * Build up "plain" facet value list for the given query options
 * Used for hashtags and users
 *
 * @param query
 * @param queryOptions
 * @param callback
 */
module.exports.facetvalues = function(query, queryOptions, callback) {

    queryOptions = queryOptions || {}

    queryOptions.start = 0;
    queryOptions.rows = 0;
    queryOptions.facet = true;

    client.query(query, queryOptions, function (err, response) {
        if (err) return;
        var result = [];
        var responseObj = JSON.parse(response);
        var facetResult = responseObj.facet_counts.facet_fields[queryOptions['facet.field']];
        var facetValues = [];

        for(var i=0;i<facetResult.length;i++) {
            if (facetResult[i+1] > 0) {
                facetValues.push({value: facetResult[i], count: facetResult[i+1]});
            }
        }
        callback(facetValues);

    });
}