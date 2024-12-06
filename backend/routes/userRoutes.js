import express from 'express';
const router = express.Router();
import { login, signup, getUser, updateUser, EmailVerification, sendResetOtp, resetPassword, handleOauth, handleGoogleCallback, completeLoginWithGoogle } from '../controllers/userController.js';
import { authorizeUser } from '../utils/authFunctions.js';

router.post('/signup', signup);
router.post('/login', login);
router.get('/user/:id',authorizeUser(['consumer', 'seller']), getUser);
router.put('/user/:id',authorizeUser(['consumer', 'seller']), updateUser);
router.get('/verify-email/:id/:token', EmailVerification);
router.post('/forgot-password',authorizeUser(['consumer', 'seller']), sendResetOtp);
router.post('/reset-password',authorizeUser(['consumer', 'seller']), resetPassword);
router.get('/oauth/google', handleOauth);
router.get('/auth/google/callback', handleGoogleCallback);
router.post('/user/getAdditionalInfo', completeLoginWithGoogle);

export default router;

