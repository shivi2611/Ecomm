import mongoose from 'mongoose';
const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, 

}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;