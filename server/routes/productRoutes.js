import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

const router = express.Router();

// Apply the 'protect' middleware to ALL routes in this file
router.use(protect);

// Route: GET /api/products (Get all products)
// Route: POST /api/products (Create a product)
router.route('/').get(getProducts).post(createProduct);

// Route: PUT /api/products/:id (Update a product)
// Route: DELETE /api/products/:id (Delete a product)
router.route('/:id').put(updateProduct).delete(deleteProduct);

export default router;
