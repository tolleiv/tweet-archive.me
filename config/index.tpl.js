
module.exports.app = {
    listMax: 25
};

module.exports.twitter = {
    consumerKey: '',
    consumerSecret: '',
    baseURL: 'http://localhost:3000',
//    logging: true, // If true, uses winston to log.
    afterLogin: '/login'
};

module.exports.mongo = {
    url: 'mongodb://localhost/members'
};
module.exports.solr = {
    core:'/tweetarchive',
    port:8080
};

module.exports.user_credentials = function(user) {
    return {
        consumer_key: twitter.consumerKey,
        consumer_secret: twitter.consumerSecret,
        access_token_key: user.token,
        access_token_secret: user.tokenSecret,
    }
};
module.exports.userCredentials = function(user) {
    return {
        consumerKey: twitter.consumerKey,
        consumerSecret: twitter.consumerSecret,
        accessTokenKey: user.token,
        accessTokenSecret: user.tokenSecret,
    }
};