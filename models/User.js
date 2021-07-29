const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name:String,
    last_name:String,
    email:String,
    password:String,
    friends:[{type:Schema.Types.ObjectId, ref:'User'}],
    posts:[{type:Schema.Types.ObjectId, ref:'Post'}],
    friendRequests:[{type:Schema.Types.ObjectId, ref:'User'}]
})

module.exports = mongoose.model('User',UserSchema);
