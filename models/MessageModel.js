
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var MessageSchema = new Schema({
    id          : ObjectId,
    summary     : { type: String, required: true },
    data        : {},
    date        : Date,
    users       : []
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