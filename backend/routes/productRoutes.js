import express from 'express';
const router = express.Router();
import { authorizeUser } from '../utils/authFunctions.js';
import { addProduct, bulkAddProduct, updateProduct, getProduct, getFilteredProducts, deleteProduct, getReviews, addReview, updateReview, deleteReview, addVariant, updateVariant, deleteVariant,getSellerProducts } from '../controllers/productController.js';
import upload from '../multerConfig.js';

router.post('/add', authorizeUser(['seller']), addProduct); 
router.post('/bulkAdd', authorizeUser(['seller']), upload.single('file'), bulkAddProduct);
router.put('/:id/update', authorizeUser(['seller']), updateProduct); 
router.get('/:id', authorizeUser(['seller', 'consumer', 'admin']), getProduct); 
router.get('/seller/:sellerId', authorizeUser(['seller']), getSellerProducts); 
//router.get('/', authorizeUser(['consumer', 'seller', 'admin']), getFilteredProducts);
router.delete('/:id', authorizeUser(['seller', 'admin']), deleteProduct); 
// reviews
router.get('/:productId/reviews', authorizeUser(['seller', 'consumer', 'admin']), getReviews);
router.post('/:productId/reviews/add', authorizeUser(['consumer']), addReview);
router.put('/reviews/update/:reviewId', authorizeUser(['consumer']), updateReview);
router.delete('/reviews/delete/:reviewId', authorizeUser(['consumer']), deleteReview);
//variants
router.post('/:productId/variants/add', authorizeUser(['seller']), addVariant);
router.put('/:productId/variants/update', authorizeUser(['seller']), updateVariant);
router.delete('/:productId/variant/:variantId', authorizeUser(['seller']), deleteVariant);

//router.get('/:productId/similar', getSimilarProducts); -- recommendation engine


export default router;
//3. handle product and category image uploads -- cloud, will handle later


