import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import Product from '../models/Product.js';
import Client from '../models/Client.js'
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
  await Product.insertMany([
    {
      userId: user._id,
      name: 'Whole Milk 1L',
      category: 'Dairy',
      price: 60,
      stock: 50,
    },
    {
      userId: user._id,
      name: 'Brown Bread 400g',
      category: 'Bakery',
      price: 45,
      stock: 20,
    },
    {
      userId: user._id,
      name: 'Fresh Apples 1kg',
      category: 'Produce',
      price: 180,
      stock: 30,
    },
  ]);

  await Client.insertMany([
    {
      userId: user._id,
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '9876543210',
      address: 'Bangalore',
    },
    {
      userId: user._id,
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543211',
      address: 'Mumbai',
    },
  ]);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
}
  } catch (error) {
    res.status(500).json({message:error.message})
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
