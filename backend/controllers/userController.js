import UserModel from '../models/userModel.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { generateToken, matchPassword, generateAndSendOtp, verifyUserEmail, findorCreateOne} from '../utils/authFunctions.js';


const signup = async(req, res) => {
    // check if user exists
    const user =  await UserModel.findOne({email: req.body.email});
    if(user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // create user
    //sanitizeRequest(req.body);
    const newUser = new UserModel(req.body);

    try{
      await newUser.save();

      // send email verification
      await verifyUserEmail(newUser);
      res.status(201).json({ id:newUser._id, message: 'User created successfully. Verify your email to activate your account.' });
  }
    catch(err){
      res.status(500).json({ message: 'An error occurred', error: err.message });
  }
};
  
  const login = async(req, res) => {
    if(!req.body.email || !req.body.password){
      return res.status(400).json({ message: 'Email and Password are required' });
    }
    const user = await UserModel.findOne({email: req.body.email, googleId: null});
    if(user){
      if(!user.isEmailVerified){
        return res.status(401).json({ message: 'Please verify your email to log in.' });
      }
      const isMatch = await user.matchPassword(req.body.password);
      if(isMatch){
        const token =  generateToken(user._id, user.email, user.role);
        res.status(200).json({
          message: 'User logged in successfully',
          token: token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
      }
      else{
        res.status(401).json({ message: 'Wrong Password'});
      }
    }
    else{
      res.status(401).json({ message: 'User does not Exist with this login method.' });
    }
  };

  const getUser = async(req, res) => {
    const user = await UserModel.findById(req.params.id);
    if(user){
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;
      res.status(200).json(userWithoutPassword);
    }
    else{
      res.status(404).json({ message: 'User not found' });
    }
  };

  const updateUser = async(req, res) => {
    const user = await UserModel.findById(req.params.id);
    if(user){
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      console.log(req.body.phone);
      user.address = req.body.address || user.address;
      if(req.body.email && user.email !== req.body.email){
        return res.status(400).json({ message: 'Email cannot be updated' });
      }
      if(req.body.password){
        return res.status(400).json({ message: 'For changing password, go to reset password' });
      }
      try{
        await user.save();
        res.status(200).json({ message: 'User updated successfully' });
      }
      catch(err){
        res.status(500).json({ message: 'An error occurred', error: err.message });
      }
    }
    else{
      res.status(404).json({ message: 'User not found' });
    }
  };

  const sendResetOtp = async(req, res) => {
    const user = await UserModel.findOne({email: req.body.email});
    if(!user){
      return res.status(404).json({ message: 'User not found' });
    }
    // generate otp
    try{
      await generateAndSendOtp(user);
      res.status(200).json({ message: 'OTP sent to email' });
    }
    catch(err){
      res.status(500).json({ message: 'An error occurred', error: err.message });
    }
  };

  const EmailVerification = async(req, res) => {
    const {id, token} = req.params;
    const user = await UserModel.findById(id);
    if(!user){
      return res.status(404).json({ message: 'User not found' });
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    if (!user.emailVerificationToken || user.emailVerificationToken !== hashedToken || Date.now() > user.emailVerificationTokenExpiry) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    try{
      await user.save();
      res.status(200).json({ message: 'Email verified successfully' });
    }
    catch(err){
      res.status(500).json({ message: 'An error occurred', error: err.message });
    }
  };
  
  const resetPassword = async(req, res) => {
    const {id,otp, newPassword} = req.body;
    const user = await UserModel.findById(id);
    if(!user){
      return res.status(404).json({ message: 'User not found' });
    }
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    if(!user.resetOtp || user.resetOtp !== hashedOtp || Date.now() > user.resetOtpExpiry){
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    // update password
    user.password = newPassword;
    try{
      await user.save();
      res.status(200).json({ message: 'Password updated successfully' });
    }
    catch(err){
      res.status(500).json({ message: 'An error occurred', error: err.message });
    }
    

  };
  const handleOauth = async(req, res) =>{
    const googleAuthURL = 'https://accounts.google.com/o/oauth2/v2/auth';
    const random = crypto.randomBytes(16).toString('hex');
    const state = await jwt.sign({random}, process.env.CSRF_SECRET); //use authFunction method.
    
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      state: state
    });
    const authURL = `${googleAuthURL}?${params}`;
    res.redirect(authURL);
  };
  
  const handleGoogleCallback = async(req, res) => {
    // verify state
    const state = req.query.state;
    try{
      const decoded = jwt.verify(state, process.env.CSRF_SECRET);
    }
    catch(err){
      return res.status(400).json({ message: 'CSRF detected' });
    }
    //extract acess token
    const { code } = req.query;
    try {
       // make request to some uri for id token
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      });
      const decoded = jwt.decode(response.data.id_token);
      const {oldUser, user} = await findorCreateOne(decoded.email, decoded.sub, decoded.name);
      if(oldUser){
        const token = generateToken(user.id, user.email, user.role);
        res.status(200).json({
          message: 'User logged in successfully',
          token: token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
      }
      else{
        res.status(300).json({ message: 'Role is needed for new user', user:{email: user.email} });
      }
    }
    catch(err){
      console.log(err);
      if(err.code === '11000'){
        return res.status(400).json({ message: 'User already signup up with password.Please login using password.' });
      }
      res.status(500).json({ message: 'An error occurred while authenticating google user', error: err.message});
    }

  }
  const completeLoginWithGoogle = async(req, res) => {
    const {email, role} = req.body;
    try{
      const user = await UserModel.find({email: email});
      user.role = role;
      user.isEmailVerified = true;
      await user.save();
      const token = generateToken(user.id, user.email, user.role);
      res.status(200).json({
        message: 'User logged in successfully',
        token: token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }
    catch(err){
      res.status(500).json({ message: 'An error occurred while logging in google user', error: err.message });
    }

  };

  export { signup, login, getUser, updateUser, sendResetOtp, resetPassword, EmailVerification, handleOauth, handleGoogleCallback, completeLoginWithGoogle };
  // oath