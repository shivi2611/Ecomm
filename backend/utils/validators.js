import  categoryModel  from '../models/categoryModel.js';
import userModel from '../models/userModel.js';

//user validation
function isNameValid(name) {
    const nameRegex = /^[a-zA-Z ]{2,30}$/;
    return nameRegex.test(name);
};
function isMailIdValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

function isPhoneValid(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    for(let num of phone){
        if(num.length !=10 || !phoneRegex.test(num)){
            return false;
        } 
    }
    return true;
};

function isDateOfBirthValid(dateOfBirth) {
    return dateOfBirth <= new Date();
};

// Validate password (at least 8 characters, including uppercase, lowercase, digits, and special characters)
function isPasswordValid(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

// product validation 
function isProductNameValid(name) {
    const nameRegex = /^[a-zA-Z0-9 ]{2,30}$/;
    return nameRegex.test(name);
};
function isDescriptionValid(description) {
    const descriptionRegex = /^[a-zA-Z0-9 ,.()'"\-]{2,1000}$/;
    return descriptionRegex.test(description);
};

async function checkProductValidation(product){
    if(!product.name || !isProductNameValid(product.name)){
        return {result: false, message: 'Invalid Name'};
    }
    if(!product.brand || !isNameValid(product.brand)){
        return {result: false, message: 'Invalid Brand'};
    }
    if(product.description && !isDescriptionValid(product.description)){
        return {result: false, message: 'Invalid Description'};
    }
    if(product.category == null){
        //undefined is allowed but null is not by mongoose
        //product.category = undefined => no category has been added.
        //product.category = null => category has been added but it is faulty.
        return {result : false, message: 'Invalid Category'};
    }
    else{
        const categoryExists = await categoryModel.exists({_id: product.category, isActive: true});
        if(!categoryExists){
            return {result: false, message: 'Invalid Category'};
        }
    }
    if(!product.price || product.price < 0){
        return {result: false, message: 'Invalid Price'};
    }
    if(!product.variants || product.variants.length === 0){
        return {result: false, message: 'No Variants'};
    }
    if(!product.seller){
        return {result: false, message: 'Invalid Seller'};
    }
    else{
        const sellerExists = await userModel.exists({_id: product.seller, role: 'seller'});
        if(!sellerExists){
            return {result: false, message: 'Invalid Seller'};
        }
    }
    return {result: true, message: 'Valid Product'};
};

async function isParentCategoryValid(categoryId, parentCategoryId, checkOnlyCategory){
    if(checkOnlyCategory){
        const categoryExists = await categoryModel.exists({_id: categoryId});
        return categoryExists;
    }
    if(parentCategoryId){
        const parentCategoryExists = await categoryModel.exists({_id: parentCategoryId});
        if(!parentCategoryExists){
            return {result: false, message: 'Invalid Parent Category'};
        }
        if(parentCategoryId === categoryId){
            return {result: false, message: 'Parent Category cannot be same as Category'};
        }
    }
    return {result: true, message: 'Valid Parent Category'};
};
async function isCategoryValid(category){
    if(!category.name || !isNameValid(category.name)){
        return {result: false, message: 'Invalid Name'};
    }
    if(category.description && !isDescriptionValid(category.description)){
        return {result: false, message: 'Invalid Description'};
    }
    const {result, message} = await isParentCategoryValid(category._id, category.parentCategory, false);
    if(category.parentCategory && !result){
        return {result: false, message: message};
    }
    return {result: true, message: 'Valid Category'};
}

export { isMailIdValid, isPhoneValid, isDateOfBirthValid, isPasswordValid, isNameValid, checkProductValidation,isCategoryValid };