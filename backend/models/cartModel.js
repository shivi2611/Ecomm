import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variant: { type: String, required: true }, // e.g., size or color
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // Inclusive of taxes and shipping
  });

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [cartItemSchema],
  });

const cartModel = mongoose.model('Cart', cartSchema);
export default cartModel;