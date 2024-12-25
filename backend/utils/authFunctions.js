import crypto from 'crypto';
import nodemailer from 'nodemailer'; 
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';

//import UserModel from '../models/userModel.js';

const generateToken = (id, email, role) => {
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
        expiresIn: '24h'
    });
};

const matchPassword = async (password) => {
    return await bcrypt.compare(password, 10);
};

const authorizeUser = (roles) => {
    return (req, res, next) => {
        const authHeader = req.header('Authorization');
     if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not Authorized: Missing or malformed token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded || !roles.includes(decoded.role)){
            return res.status(401).json({ message: 'Not Authorized: invalid token or insufficient permissions' });
        }
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: err.message });
    }
    next();
    };
};

const generateAndSendOtp = async(user) =>{
    const {otp, hashedOtp} = generateOtp();

    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = Date.now() + 15 * 60 * 1000;
    // OTP valid for 15 minutes

    try{
        await user.save();

        //send mail
        const subject = 'Password Reset OTP';
        const body = `Your OTP for password reset is ${otp}. It is valid for 15 minutes.`;
        await sendEmail(user.email, subject, body);

    }
    catch(err){
        console.log(err);
        throw new Error('An error occurred while sending OTP'); 
    }
};

const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedOtp = crypto.createHash('sha256').update(otp.toString()).digest('hex');
    return {otp, hashedOtp};
};

const sendEmail = async(email, subject, body) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        text: body
    };

    try{
        await transporter.sendMail(mailOptions);
    }
    catch(err){
        console.log(err);
        throw new Error('An error occurred while sending email');
    }
};

const verifyUserEmail = async(user) => {
    const {otp, hashedOtp} = generateOtp(); 
    user.emailVerificationToken = hashedOtp;
    user.emailVerificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    try{
        await user.save();

        const verificationLink = `${process.env.CLIENT_URL}/api/users/verify-email/${user.id}/${otp}`;
        const subject = 'Email Verification';
        const body = `Click on the link to verify your email: ${verificationLink}\n\nThe link is valid for 24 hours.`;
        await sendEmail(user.email, subject, body);
    }
    catch(err){
        console.log(err);
        throw new Error('An error occurred while sending email verification link');
    }
}
const findorCreateOne = async(email, googleId, name) =>{
    try {
        const user = await UserModel.findOne({email: email, googleId: { $ne: null }});
        if (!user) {
          return {oldUser:false, user: await UserModel.create({ email, googleId, name, password: 'Ecom@1234' })};
        }
        return {oldUser:true, user:user};
      } catch (err) {
        throw err;
      }
};



export { generateToken, matchPassword, authorizeUser, generateAndSendOtp, verifyUserEmail,findorCreateOne };
