var config = require('../config'),
    mongoose = require('mongoose'),
    UserModel = require('../models/UserModel');
mongoose.connect(config.mongo.url);
UserModel.find({}, ['name', 'lastlogin', 'features']).run(function(err, docs) {
    console.log(docs)
    mongoose.connection.close();
});