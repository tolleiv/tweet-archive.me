
var twitter = {
    consumerKey: '',
    consumerSecret: '',
    baseURL: 'http://localhost:3000',
//    logging: true, // If true, uses winston to log.
    afterLogin: '/login'
};

module.exports.twitter = twitter;

module.exports.mongo = {
    url: 'mongodb://localhost/members'
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