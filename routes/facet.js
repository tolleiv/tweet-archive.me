
var search = require('../helpers/solr-search.js');

/**
 * Get the facet value list for a certain user,
 * makes sure existing facet-filters are taken into account
 *
 * @param req
 * @param res
 * @param name
 * @param related
 */
module.exports.list = function(req, res, name, related) {
    if (typeof req.session.twitter != 'object') {
        res.send('what???', 401);
        return;
    }
    var fq = ['users:' + req.session.twitter.name];
    var query = req.query.q ? req.query.q.replace(/:/, '') : '*:*';

    var others = related.split(',');
    for(var i=0;i<others.length;i++) {
        if (!req.query[others[i]]) continue;
        fq.push(others[i] + ':' + req.query[others[i]].split(',').join(' OR ' + others[i] + ':'))
    }

    var queryOptions = {
        fq: fq,
        'facet.field': name,
        'facet.limit': parseInt(req.query.limit)
    };

    search.facetvalues(query, queryOptions, function(docs) {
        res.json(docs);
    });
}