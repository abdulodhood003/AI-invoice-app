import {
  generateInvoiceDescription,
  generateInvoiceEmail,
  generateBusinessInsights
} from '../services/aiService.js';

/**
 * @desc    Generate a professional item description using AI
 * @route   POST /api/ai/generate-description
 * @access  Private
 */
export const createDescription = async (req, res, next) => {
  try {
    const { serviceName } = req.body;

    if (!serviceName) {
      res.status(400);
      throw new Error('Please provide a service name to generate a description.');
    }

    // Call the external AI service to generate content
    const generatedDescription = await generateInvoiceDescription(serviceName);

    res.status(200).json({ description: generatedDescription });
  } catch (error) {
    if (error.message.includes('missing API key')) {
      res.status(503);
    }
    next(error);
  }
};

/**
 * @desc    Generate a professional email body using AI
 * @route   POST /api/ai/generate-email
 * @access  Private
 */
export const createEmail = async (req, res, next) => {
  try {
    const { clientName, invoiceNumber, totalAmount, dueDate, companyName } =
      req.body;

    // Validate that all necessary context is provided to the AI
    if (
      !clientName ||
      !invoiceNumber ||
      totalAmount === undefined ||
      !companyName
    ) {
      res.status(400);
      throw new Error('Please provide all necessary details to generate the email.');
    }

    // Default due date if missing
    const finalDueDate = dueDate || 'Upon Receipt';

    // Call the external AI service
    const generatedEmail = await generateInvoiceEmail({
      clientName,
      invoiceNumber,
      totalAmount,
      dueDate: finalDueDate,
      companyName,
    });

    res.status(200).json({ emailBody: generatedEmail });
  } catch (error) {
    if (error.message.includes('missing API key')) {
      res.status(503);
    }
    next(error);
  }
};

/**
 * @desc    Generate business insights based on dashboard data
 * @route   POST /api/ai/business-insights
 * @access  Private
 */
export const getBusinessInsights = async (req, res, next) => {
  try {
    const { dashboardData } = req.body;

    if (!dashboardData) {
      res.status(400);
      throw new Error('Please provide dashboard data to generate insights.');
    }

    const insights = await generateBusinessInsights(dashboardData);

    res.status(200).json({ insights });
  } catch (error) {
    if (error.message.includes('missing API key')) {
      res.status(503);
    }
    next(error);
  }
};
