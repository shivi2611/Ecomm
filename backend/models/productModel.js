
import mongoose from "mongoose";
import reviewModel from "./reviewModel.js";
import { checkProductValidation } from "../utils/validators.js";

const variantSchema = new mongoose.Schema({
    size: { type: String, required: true },
    color: { type: String, required: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    image: { type: String }
    
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    uniqueIdentifier: { type: String,  unique: true },
    brand: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags : [{ type: String }],
    variants: [variantSchema],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

productSchema.methods.saveProduct = async function(){
    this.uniqueIdentifier = `${this.name}-${this.brand}`;
    const{result, message} = await checkProductValidation(this);
    if(!result){
        throw new Error(message);
    }
    try{
        await this.save();
    }
    catch(error){
        throw new Error(error.message);
    }
}
productSchema.pre('findOneAndDelete', async function (next) {
    const productId = this.getQuery()['_id']; // Access the ID of the product being deleted
    try {
        await reviewModel.deleteMany({ product: productId });
        console.log(`Reviews associated with product ${productId} deleted.`);
        next();
    } catch (error) {
        next(error);
    }
});

const productModel = mongoose.model('Product', productSchema);
export default productModel;