import Product from '../models/Product.js';

/**
 * @desc    Get all products for the logged-in user
 * @route   GET /api/products
 * @access  Private
 */
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, stock, barcode, expiryDate, supplier, tax } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      res.status(400);
      throw new Error('Please provide all required fields: name, category, price, stock');
    }

    const product = await Product.create({
      userId: req.user._id,
      name,
      category,
      price,
      stock,
      barcode,
      expiryDate,
      supplier,
      tax,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Security Check
    if (product.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to update this product');
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Security Check
    if (product.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to delete this product');
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ id: req.params.id, message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};
