import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isMailIdValid, isPhoneValid, isDateOfBirthValid, isPasswordValid, isNameValid } from '../utils/validators.js';

const userSchema = new mongoose.Schema({
    name: { type: String},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: [{ type: String}],
    role: { type: String, default: 'consumer', required: true},
    address: [{
        street: { type: String},
        city: { type: String},
        state: { type: String},
        zipcode: { type: String}
    }],
    dateofbirth: { type: Date},
    cartId: { type: String}, // foreign key make it required
    resetOtp: { type: String},
    resetOtpExpiry: { type: Date},
    isEmailVerified: { type: Boolean, default: false},
    emailVerificationToken: {type: String},
    emailVerificationTokenExpiry: {type:Date},
    googleId : {type:String}
});

userSchema.pre('save', async function(next) {
    //console.log(this);
    // validation checks
    if(this.name && !isNameValid(this.name)) {
        return next(new Error('Name is invalid'));
    }
    if(this.phone && !isPhoneValid(this.phone)) {
        return next(new Error('Phone number is invalid'));
    }
    if(this.dateofbirth && !isDateOfBirthValid(this.dateofbirth)) {
        return next(new Error('Date of birth is invalid'));
    }
    if(this.isNew && !isMailIdValid(this.email)){
        return next(new Error('Email is not valid'));
    }
    else if(!this.isNew && this.isModified('email')){
        return next(new Error('Email cannot be updated'));
    }
    //password change is only for new users
    if(this.isNew && !isPasswordValid(this.password)) {
        return next(new Error('Password is invalid'));
    }
    else if(this.isNew){
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
});

userSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model('User', userSchema);
export default userModel;

