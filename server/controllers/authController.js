import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate incoming data
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide all required fields: name, email, and password.');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User with this email already exists.');
    }

    // Create the new user. The pre('save') hook in the User model will hash the password.
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Respond with the created user data and a JWT token
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Failed to create user. Invalid user data.');
    }
  } catch (error) {
    // Pass the error to the global error handler middleware
    next(error);
  }
};

/**
 * @desc    Log in an existing user and get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate incoming data
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide both email and password.');
    }

    // Find the user by email. We must explicitly select '+password' because
    // it was excluded (`select: false`) in the User model definition.
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and if the provided password matches the hashed password
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password.');
    }
  } catch (error) {
    next(error);
  }
};
