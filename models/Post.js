const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    content:String,
    author:{type:Schema.Types.ObjectId, ref:'User'},
    comments:[{type:Schema.Types.ObjectId, ref:'Comment'}],
    likes:Number,
    date:Date
})

module.exports = mongoose.model('Post',PostSchema);
