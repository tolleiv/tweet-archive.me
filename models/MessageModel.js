
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var MessageSchema = new Schema({
    id          : ObjectId,
    tweetId     : { type: Number, index: { unique: true, dropDups: true } },
    tweetFound  : { type: Number, default: 0 },
    summary     : { type: String, required: true },
    data        : {},
    date        : Date,
    users       : [{ type: Schema.ObjectId, ref: 'Users'}],
    indexed     : { type: Number, default: 0 }
});


// Date setter
MessageSchema.path('date')
    .default(function(){
        return new Date()
    })
    .set(function(v){
        return v == 'now' ? new Date() : v;
    });
module.exports = mongoose.model('Messages', MessageSchema);