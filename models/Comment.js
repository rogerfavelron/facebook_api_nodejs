const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    content:String,
    author:{type:Schema.Types.ObjectId, ref:'User'}
})

module.exports = mongoose.model('Comment',CommentSchema);
