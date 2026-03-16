import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for the user.
 * @param {string} id - The user's ID
 * @returns {string} - The generated JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

export default generateToken;
