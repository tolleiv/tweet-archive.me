
var http = require('http');
var url = require('url');

function expandThisUrl(urlToParse, callback) {
    var short = url.parse(urlToParse);
    var options = {
        host: short.hostname,
        port: 80,
        path: short.pathname
    };
    var clientRequest = http.get(options, extractRealURL);
    clientRequest.on("error", forwardError);
    function extractRealURL(res) {
        callback(null, res.headers.location || short.href);
    }
    function forwardError(error) {
        callback(err, short,href);
    }
}

function expandUrl(url, callback, tries) {
    var tries = tries || 0;
    var originalUrl = url;
    expandThisUrl(url, function(err, url) {
        if (!err && url == originalUrl) {
            callback(null, url);
        } else if (!err && url && tries < 5) {
            expandThisUrl(url, callback, tries+1);
        } else {
            callback(err, originalUrl);
        }
    });
}

function expandUrls (i, data, callback) {
    if (!data || i >= data.length) {
        callback(data);
        return;
    }

    expandUrl(data[i].url, function(err, url) {
        if (!err) {
            data[i].expanded_url = url
        }
        expandUrls(i+1, data, callback);
    });
}

function expand(urls, callback) {
    expandUrls(0, urls, callback);
}

module.exports = expand