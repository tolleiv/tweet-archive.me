var config = require('../config'),
    mongoose = require('mongoose'),
    UserModel = require('../models/UserModel');

if (process.argv.length != 3) {
    console.log("Syntax: node helpers/user-enable.js <name>")
} else {
    mongoose.connect(config.mongo.url);
    UserModel.findOne({name: process.argv[2]}).run(function(err, doc) {
        console.log("Enable " + doc.name)
        doc.features = 1;
        doc.save(function(err) {
            console.log(err ? "Error" : "Done")
            mongoose.connection.close();
        })
    });
}