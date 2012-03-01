var express = require('express');

var app = express.createServer();
app.use(express.cookieParser());
app.use(express.session({ secret:'randomness' }));

app.get('/', function(req, res) {
  res.send("Sorry this service is currently in maintenance mode");
});

app.listen(parseInt(process.env.PORT || 3001));