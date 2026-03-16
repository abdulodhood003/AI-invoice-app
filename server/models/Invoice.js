import mongoose from 'mongoose';

// Define the schema for individual invoice items
const itemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Optional reference to the Product model for stock tracking
  },
  name: {
    type: String,
    required: [true, 'Please add an item name'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please add a quantity'],
    min: [0.01, 'Quantity must be strictly positive'],
  },
  unit: {
    type: String,
    default: 'qty',
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative'],
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
  },
  total: {
    type: Number,
    required: [true, 'Please add an item total'],
  },
});

// Define the main invoice schema
const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User who created the invoice
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client', // Reference to the Client receiving the invoice (optional if consumer)
    },
    consumerDetails: {
      name: { type: String, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
      address: { type: String, trim: true }
    },
    invoiceNumber: {
      type: String,
      required: [true, 'Please add an invoice number'],
      unique: true,
    },
    date: {
      type: Date,
      required: [true, 'Please add an invoice date'],
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    items: [itemSchema], // Embed the itemSchema as an array of objects
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },
    deliveryCharge: {
      type: Number,
      default: 0,
      min: [0, 'Delivery charge cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Please add the total amount'],
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending', 'Paid', 'Overdue'],
      default: 'Draft',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
