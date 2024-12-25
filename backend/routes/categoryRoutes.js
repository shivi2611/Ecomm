import express from 'express';
const router = express.Router();
import { authorizeUser } from '../utils/authFunctions.js';
import {getAllCategory, addCategory, updateCategory, deleteCategory, getCategory} from '../controllers/categoryController.js';

router.get('/getAll/:filter', authorizeUser(['seller', 'consumer', 'admin']), getAllCategory); 
router.get('/getOne/:id', authorizeUser(['seller', 'consumer', 'admin']), getCategory); 
router.post('/add', authorizeUser(['admin']), addCategory);
router.put('/update/:id', authorizeUser(['admin']), updateCategory);
router.delete('/delete/:id', authorizeUser(['admin']), deleteCategory);

export default router;