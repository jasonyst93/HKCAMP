const mongoose = require('mongoose');
const Schema = mongoose.Schema; //easy to access schema

const reviewSchema = new Schema({  //create new schema 
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Review', reviewSchema) //create models with Schema and exports