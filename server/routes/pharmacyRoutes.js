const express = require('express');
const {
    getProducts,
    getMyProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    seedProducts
} = require('../controllers/pharmacyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// Public Routes
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

// Pharmacy Owner Only Routes
router.get('/my-products', protect, authorize('pharmacy'), getMyProducts);
router.post('/products', protect, authorize('pharmacy'), addProduct);
router.put('/products/:id', protect, authorize('pharmacy'), updateProduct);
router.delete('/products/:id', protect, authorize('pharmacy'), deleteProduct);

// Admin/Seed
router.post('/seed', protect, seedProducts);

module.exports = router;
