
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    id          : ObjectId,
    name        : { type: String, required: true },
    token         : { type: String, required: true },
    tokenSecret      : { type: String, required: true },
    lastlogin   : Date
});

// Date setter
UserSchema.path('lastlogin').default(function(){
        return new Date()
    })
    .set(function(v){
        return v == 'now' ? new Date() : v;
    });

module.exports = mongoose.model('Users', UserSchema);