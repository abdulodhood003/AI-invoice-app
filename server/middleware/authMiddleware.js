import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes that require authentication.
 * It checks for a valid JWT in the Authorization header.
 * If valid, it attaches the user object to the request.
 */
export const protect = async (req, res, next) => {
  let token;

  // Check if the authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from the database and exclude the password field
      // Attach the user to the request object so subsequent controllers can use it
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Proceed to the next middleware or controller
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('Not authorized, no token provided'));
  }
};
