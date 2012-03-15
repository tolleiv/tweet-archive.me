
var express = require('express'),
    twitter = require('express-twitter'),
    config = require('./config'),
    routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'box-that-twitter' }));
  app.use(twitter.middleware(config.twitter));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.get('/start', routes.start);

app.get('/login', routes.login);
app.get('/logout', routes.logout);
app.get('/milli', routes.milli);
app.get('/hans', routes.hans);

app.get('/tweets:format?', routes.tweets);
app.get('/search:format?', routes.search);
app.get('/involved:format?', routes.involved);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
