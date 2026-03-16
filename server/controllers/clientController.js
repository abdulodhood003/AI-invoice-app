import Client from '../models/Client.js';

/**
 * @desc    Get all clients for the logged-in user
 * @route   GET /api/clients
 * @access  Private
 */
export const getClients = async (req, res, next) => {
  try {
    // Only fetch clients associated with the currently authenticated user
    const clients = await Client.find({ userId: req.user._id });
    res.status(200).json(clients);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new client
 * @route   POST /api/clients
 * @access  Private
 */
export const createClient = async (req, res, next) => {
  try {
    const { name, email, phone, company, address } = req.body;

    // Basic validation
    if (!name || !email) {
      res.status(400);
      throw new Error('Please provide at least a name and email for the client.');
    }

    // Check if the client email already exists for THIS user
    const clientExists = await Client.findOne({ email, userId: req.user._id });
    if (clientExists) {
      res.status(400);
      throw new Error('A client with this email already exists in your account.');
    }

    // Create the client and attach the logged-in user's ID
    const client = await Client.create({
      userId: req.user._id,
      name,
      email,
      phone,
      company,
      address,
    });

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing client
 * @route   PUT /api/clients/:id
 * @access  Private
 */
export const updateClient = async (req, res, next) => {
  try {
    // Find the client by ID
    let client = await Client.findById(req.params.id);

    // If client does not exist, throw an error
    if (!client) {
      res.status(404);
      throw new Error('Client not found');
    }

    // Security Check: Ensure the logged-in user actually owns this client
    if (client.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to update this client');
    }

    // Update the client and return the new document
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the modified document rather than the original
        runValidators: true, // Ensure mongoose validation rules still apply
      }
    );

    res.status(200).json(updatedClient);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a client
 * @route   DELETE /api/clients/:id
 * @access  Private
 */
export const deleteClient = async (req, res, next) => {
  try {
    // Find the client by ID
    const client = await Client.findById(req.params.id);

    if (!client) {
      res.status(404);
      throw new Error('Client not found');
    }

    // Security Check: Ensure the logged-in user actually owns this client
    if (client.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to delete this client');
    }

    // Delete the client
    await Client.findByIdAndDelete(req.params.id);

    res.status(200).json({ id: req.params.id, message: 'Client removed' });
  } catch (error) {
    next(error);
  }
};
