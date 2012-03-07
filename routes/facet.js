
var search = require('../helpers/solr-search.js');
module.exports.list = function(req, res, name) {
    if (typeof req.session.twitter != 'object') {
        res.send('what???', 401);
        return;
    }
    var fq = ['users:' + req.session.twitter.name];
    var query = req.query.q ? req.query.q.replace(/:/, '') : '*:*';

    if (req.query[name]) {
        fq.push(name + ':' + req.query[name]);
    }
    var queryOptions = { fq: fq, 'facet.field': name };

    search.facetvalues(query, queryOptions, function(docs) {
        res.json(docs);
    });
}