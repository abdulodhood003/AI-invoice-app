import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// Route: POST /api/auth/register
// Desc: Register a new user and return a JWT
router.post('/register', registerUser);

// Route: POST /api/auth/login
// Desc: Authenticate an existing user and return a JWT
router.post('/login', loginUser);

export default router;
