const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./user');
const Schema = mongoose.Schema; //easy to access schema


const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_150');
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({  //create new schema 
    title: String,
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: { //userID
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`;
})

//Query Middleware
CampgroundSchema.post('findOneAndDelete', async function (doc) { //doc is what we deleted 
    if (doc) { //if something deleted
        await Review.deleteMany({
            _id: { //delete _id in Review DB
                $in: doc.reviews  //where the id is in our doc.reviews just deleted
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema) //create models with Schema and exports