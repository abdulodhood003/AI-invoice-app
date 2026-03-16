import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';

const router = express.Router();

// Apply the 'protect' middleware to ALL routes in this file
// This ensures that only authenticated users can access the client endpoints
router.use(protect);

// Route: GET /api/clients (Get all clients)
// Route: POST /api/clients (Create a client)
router.route('/').get(getClients).post(createClient);

// Route: PUT /api/clients/:id (Update a client)
// Route: DELETE /api/clients/:id (Delete a client)
router.route('/:id').put(updateClient).delete(deleteClient);

export default router;
