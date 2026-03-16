import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from '../controllers/invoiceController.js';

const router = express.Router();

// Apply the 'protect' middleware to ALL routes in this file
router.use(protect);

// Route: GET /api/invoices (Get all invoices)
// Route: POST /api/invoices (Create an invoice)
router.route('/').get(getInvoices).post(createInvoice);

// Route: GET /api/invoices/:id (Get invoice)
// Route: PUT /api/invoices/:id (Update an invoice)
// Route: DELETE /api/invoices/:id (Delete an invoice)
router.route('/:id').get(getInvoiceById).put(updateInvoice).delete(deleteInvoice);

export default router;
