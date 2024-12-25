import productModel from '../models/productModel.js';
import reviewModel from '../models/reviewModel.js';
import fs from 'fs';
import csvParser from 'csv-parser';
import { bulkAddProductsLogic } from '../utils/productFunctions.js';


const addProduct = async (req, res) => {
    const product = req.body;
    const uniqueIdentifier = `${product.name}-${product.brand}`;
    const existingProduct = await productModel.findOne({ uniqueIdentifier});
    if (existingProduct) {
        return res.status(409).json({ message: 'Duplicate Product' });
    }
    try{
        const newProduct = new productModel(product);
        await newProduct.saveProduct();
        return res.status(201).json({message: 'Product added successfully', data : newProduct});
    }
    catch(error){
        return res.status(500).json({message: error.message});
    }
};

const bulkAddProduct = async (req, res) => {
    if(!req.file){
        return res.status(400).json({message: 'No file uploaded'});
    }
    
    const filePath = req.file.path;
    const products = [];

    // Parse the CSV file
    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
            //handle list fields
            const tags = row.tags? JSON.parse(row.tags) : [];
            const variants = row.variants? JSON.parse(row.variants) : [];
            const product = {
                name: row.name,
                brand: row.brand,
                description: row.description,
                price: row.price,
                category: row.category,
                tags: tags,
                variants: variants,
                seller: row.seller
            }
            products.push(product);
        })
        .on('end', async () => {
            
            try {
                const results = await bulkAddProductsLogic(products);
                res.status(200).json(results);
            } catch (err) {
                res.status(500).json({ message: 'Error processing file', error: err.message });
            }
            
        })
        .on('error', (err) => {
            res.status(500).json({ message: 'Error reading file', error: err.message });
        });
};
 
const updateProduct = async (req, res) => {
    console.log('inside update product');   
    const productId = req.params.id;
    const product = req.body;
    const existingProduct = await productModel.findById(productId);
    if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
    }
    Object.keys(product).forEach((key) => {
        existingProduct[key] = product[key];
    });
    try{
        await existingProduct.saveProduct();
        return res.status(200).json({message: 'Product updated successfully', data : existingProduct});
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }

};

const getProduct = async (req, res) => {
    const productId = req.params.id;
    try{
        const product = await productModel.findById(productId);
        if(!product){
            return res.status(404).json({message: 'Product not found'});
        }
        return res.status(200).json(product);
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

const getFilteredProducts = async (req, res) => {
};

const deleteProduct = async (req, res) => {
    const productId = req.params.id;
    try{
        const product = await productModel.findByIdAndDelete(productId);
        if(!product){
            return res.status(404).json({message: 'Product not found'});
        }
        return res.status(200).json({message: 'Product deleted successfully'});
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

const getSellerProducts = async (req, res) => {
    const sellerId = req.params.sellerId;
    try{
        const products = await productModel.find({seller: sellerId});
        return res.status(200).json(products);
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

const getReviews = async (req, res) => {
    const productId = req.params.id;
    try{
        const reviews = await reviewModel.find({product: productId});
        return res.status(200).json(reviews);
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

const addReview = async (req, res) => {
    const review = req.body;
    const productId = req.params.productId;
    const newReview = new reviewModel(review);
    newReview.product = productId;
    try{
        await newReview.save();
        return res.status(201).json({message: 'Review added successfully', data : newReview});
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

const updateReview = async (req, res) => {
    const reviewId = req.params.reviewId;
    const existingReview = await reviewModel.findById(reviewId);
    if (!existingReview) {
        return res.status(404).json({ message: 'Review not found' });
    }
    const reviewKeys = Object.keys(req.body);
    reviewKeys.forEach((key) => {
        existingReview[key] = req.body[key];
    });
    try{
        await existingReview.save();
        return res.status(200).json({message: 'Review updated successfully', data : existingReview});
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

const deleteReview = async (req, res) => {
    const reviewId = req.params.reviewId;
    try{
        const review = await reviewModel.findByIdAndDelete(reviewId);
        if(!review){
            return res.status(404).json({message: 'Review not found'});
        }
        return res.status(200).json({message: 'Review deleted successfully'});
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

const addVariant = async (req, res) => {
    const productId = req.params.productId;
    const variant = req.body;
    const existingProduct = await productModel.findById(productId);
    if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
    }
    existingProduct.variants.push(variant);
    try{
        await existingProduct.save();
        return res.status(201).json({message: 'Variant added successfully', data : existingProduct});
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

const updateVariant = async (req, res) => {
    const productId = req.params.productId; 
    const variants = req.body;
    const existingProduct = await productModel.findById(productId);
    if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
    }
    existingProduct.variants = variants;
    try{
        await existingProduct.save();
        return res.status(200).json({message: 'Variants updated successfully', data : existingProduct});
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

const deleteVariant = async (req, res) => {
    const productId = req.params.productId;
    const variantId = req.params.variantId;

    const existingProduct = await productModel.findById(productId);
    if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
    }
    const updatedVariants = existingProduct.variants.filter((variant) => variant._id != variantId);
    if(updatedVariants.length === existingProduct.variants.length){
        return res.status(404).json({ message: 'Variant not found' });
    }
    existingProduct.variants = updatedVariants;
    if(updatedVariants.length === 0){
        return res.status(400).json({message: 'Product must have atleast one variant'});
    }
    try{
        await existingProduct.save();
        return res.status(200).json({message: 'Variant deleted successfully', data : existingProduct});
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};


export  {addProduct, bulkAddProduct, updateProduct, getProduct, getFilteredProducts, deleteProduct, getReviews, addReview, updateReview, deleteReview, addVariant, updateVariant, deleteVariant, getSellerProducts};