const express = require('express');
const router = express.Router();
const  auth  = require('../middleware/auth');

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  productPlaced,
   getUserOrders,
  getAllOrders
} = require('../controllers/productController');

// productPlaced route
console.log("222222222222222222222222222222")
router.post('/productPlaced', auth, productPlaced);
router.get('/my-orders', auth, getUserOrders);
router.get('/admin/all-orders', auth, getAllOrders);

// Product routes
router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);


module.exports = router;