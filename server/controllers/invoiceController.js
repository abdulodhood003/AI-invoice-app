import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js'; // Import Product model explicitly

/**
 * Helper function to calculate the total amount of an invoice
 * @param {Array} items - Array of invoice items
 * @param {Number} tax - Tax amount
 * @param {Number} deliveryCharge - Optional delivery charge amount
 * @returns {Number} - The calculated total amount
 */
const calculateTotalAmount = (items, tax = 0, deliveryCharge = 0) => {
  const itemsTotal = items.reduce((acc, item) => {
    // Calculate base total for item
    const baseTotal = item.quantity * item.price;
    
    // Assign the correct base total to the item object itself (no tax mixed in)
    item.total = baseTotal; 
    return acc + baseTotal; // Only sum base totals here because 'tax' parameter contains the total tax sum
  }, 0);

  return itemsTotal + Number(deliveryCharge);
};

/**
 * @desc    Get all invoices for the logged-in user
 * @route   GET /api/invoices
 * @access  Private
 */
export const getInvoices = async (req, res, next) => {
  try {
    // Find invoices belonging to the user and populate the client details
    const invoices = await Invoice.find({ userId: req.user._id }).populate(
      'clientId',
      'name email company'
    ).sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(invoices);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single invoice by ID
 * @route   GET /api/invoices/:id
 * @access  Private
 */
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      'clientId',
      'name email company address phone'
    );

    if (!invoice) {
      res.status(404);
      throw new Error('Invoice not found');
    }

    // Security Check: Only the owner can view the invoice
    if (invoice.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to view this invoice');
    }

    res.status(200).json(invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new invoice
 * @route   POST /api/invoices
 * @access  Private
 */
export const createInvoice = async (req, res, next) => {
  try {
    const {
      clientId,
      consumerDetails,
      invoiceNumber,
      date,
      dueDate,
      items,
      tax,
      deliveryCharge,
      status,
    } = req.body;

    // Basic Validation
    if ((!clientId && !consumerDetails) || !invoiceNumber || !items || items.length === 0) {
      res.status(400);
      throw new Error('Please provide client/consumer, invoice number, and at least one item');
    }

    // Check if the invoice number already exists
    const invoiceExists = await Invoice.findOne({ invoiceNumber });
    if (invoiceExists) {
      res.status(400);
      throw new Error('Invoice with this number already exists');
    }

    // --- Stock Validation & Deduction Setup ---
    // We only decrement stock if an item has a valid productId and we find the product.
    for (const item of items) {
      if (item.productId) {
        const product = await Product.findById(item.productId);
        if (!product) {
          res.status(404);
          throw new Error(`Product not found for item: ${item.name}`);
        }
        if (product.stock < item.quantity) {
          res.status(400);
          throw new Error(`Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }
      }
    }

    // Calculate total amount safely on the backend
    const totalAmount = calculateTotalAmount(items, tax, deliveryCharge);

    // Create the invoice
    const invoiceData = {
      userId: req.user._id,
      invoiceNumber,
      date,
      dueDate,
      items,
      tax: tax || 0,
      deliveryCharge: deliveryCharge || 0,
      totalAmount,
      status: status || 'Draft',
    };

    if (clientId && clientId !== 'consumer') {
      invoiceData.clientId = clientId;
    } else if (consumerDetails) {
      invoiceData.consumerDetails = consumerDetails;
    }

    const invoice = await Invoice.create(invoiceData);

    // --- Execute Stock Deductions ---
    for (const item of items) {
      if (item.productId) {
        // Decrement stock by the validated invoice quantities
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing invoice
 * @route   PUT /api/invoices/:id
 * @access  Private
 */
export const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      res.status(404);
      throw new Error('Invoice not found');
    }

    // Security Check: Only the owner can update the invoice
    if (invoice.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to update this invoice');
    }

    // Destructure request body
    const { items, tax, deliveryCharge, consumerDetails, clientId } = req.body;

    // If items, tax, or deliveryCharge are being updated, we must recalculate the totalAmount
    let updatedFields = { ...req.body };
    if (items || tax !== undefined || deliveryCharge !== undefined) {
      const newItems = items || invoice.items;
      const newTax = tax !== undefined ? tax : invoice.tax;
      const newDeliveryCharge = deliveryCharge !== undefined ? deliveryCharge : invoice.deliveryCharge;
      
      updatedFields.items = newItems;
      updatedFields.tax = newTax;
      updatedFields.deliveryCharge = newDeliveryCharge;
      updatedFields.totalAmount = calculateTotalAmount(newItems, newTax, newDeliveryCharge);
    }
    
    // Explicitly handle clientId vs consumerDetails
    if (clientId === 'consumer' || (!clientId && consumerDetails)) {
      updatedFields.clientId = null;
      updatedFields.consumerDetails = consumerDetails;
    } else if (clientId && clientId !== 'consumer') {
      updatedFields.clientId = clientId;
      updatedFields.consumerDetails = { name: '', email: '', phone: '', address: '' };
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      {
        new: true,
        runValidators: true,
      }
    ).populate('clientId', 'name email company');

    res.status(200).json(updatedInvoice);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an invoice
 * @route   DELETE /api/invoices/:id
 * @access  Private
 */
export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      res.status(404);
      throw new Error('Invoice not found');
    }

    // Security Check: Only the owner can delete the invoice
    if (invoice.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to delete this invoice');
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.status(200).json({ id: req.params.id, message: 'Invoice removed' });
  } catch (error) {
    next(error);
  }
};
