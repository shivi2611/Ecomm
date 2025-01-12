import productModel from '../models/productModel.js';
import {checkProductValidation} from './validators.js';

const bulkAddProductsLogic = async(products) => {
    let failedProducts = [];
    let addedProducts = 0;
    let insertedProducts = [];
    let validProducts = [];
    let preparedProducts = [];
    try {
        preparedProducts = products.map((product) => {
            return new productModel({...product, uniqueIdentifier: `${product.name}-${product.brand}`});
        });
        const validationResults = await Promise.all(
            preparedProducts.map(async (product) => {
                const { result, message } = await checkProductValidation(product);
                return { product, result, message };
            })
        );
        validProducts = validationResults
            .filter(({ result }) => result)
            .map(({ product }) => product);

        failedProducts = validationResults
            .filter(({ result }) => !result)
            .map(({ product, message }) => ({ product, message }));

        insertedProducts = await productModel.insertMany(validProducts, { ordered: false });
        addedProducts = insertedProducts.length;
    } catch (error) {
        console.log(error);
            error.writeErrors.forEach((writeError) => {
                const failedProductIndex = writeError.index;
                failedProducts.push({
                    product: validProducts[failedProductIndex],
                    message: writeError.err.errmsg || "Unknown error during insert",
                });
            });
           addedProducts = preparedProducts.length - failedProducts.length;
    }
    return {
        addedProducts,
        failedProducts,
    };
};


export { bulkAddProductsLogic };

