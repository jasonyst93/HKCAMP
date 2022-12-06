const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); //review[review] and review[rating]
    review.author = req.user._id; // added user_id to review model
    campground.reviews.push(review); //update campground model
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created a new review')
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //find the campground ID,then delete(pull) the review(reviewId) from review array
    await Review.findByIdAndDelete(reviewId);;
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
};