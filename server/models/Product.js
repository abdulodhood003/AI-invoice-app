import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User who created the product
    },
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a product category'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      required: false,
      default: 'pcs',
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
      default: '', // Optional but useful for supermarkets
    },
    expiryDate: {
      type: Date,
      required: false, // Optional if it's not a perishable good
    },
    supplier: {
      type: String,
      trim: true,
      default: '',
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
