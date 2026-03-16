import { GoogleGenAI } from '@google/genai';

// Initialize the Google GenAI SDK conditionally.
// It automatically looks for `GEMINI_API_KEY` in environment variables.
let ai = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (error) {
    console.warn("GoogleGenAI initialization failed:", error.message);
  }
} else {
  console.warn("GEMINI_API_KEY is not defined in environment variables. AI features are disabled.");
}

/**
 * Generate a professional description for an invoice item based on a short service name.
 * @param {string} serviceName - The short name of the service (e.g., "Web Design").
 * @returns {Promise<string>} - The generated description.
 */
export const generateInvoiceDescription = async (serviceName) => {
  if (!ai) {
    throw new Error('AI features are disabled due to missing API key.');
  }

  try {
    const prompt = `You are a professional copywriter. Write a concise, professional, and detailed single-paragraph description (max 3 sentences) for an invoice line item based on this service name: "${serviceName}". Do not include greetings or pleasantries, just the description.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error('Error generating description:', error.message);
    throw new Error('Failed to generate description from AI service: ' + error.message);
  }
};

/**
 * Generate a professional email to send along with an invoice.
 * @param {Object} emailDetails - Details required to draft the email.
 * @param {string} emailDetails.clientName - The name of the client.
 * @param {string} emailDetails.invoiceNumber - The invoice number.
 * @param {string} emailDetails.totalAmount - The total amount due.
 * @param {string} emailDetails.dueDate - The due date of the invoice.
 * @param {string} emailDetails.companyName - The sender's company name.
 * @returns {Promise<string>} - The generated email body.
 */
export const generateInvoiceEmail = async ({
  clientName,
  invoiceNumber,
  totalAmount,
  dueDate,
  companyName,
}) => {
  if (!ai) {
    throw new Error('AI features are disabled due to missing API key.');
  }

  try {
    const prompt = `You are a professional assistant. Draft a polite and professional email to a client sending them an invoice. 
    Use the following details:
    - Client Name: ${clientName}
    - Invoice Number: ${invoiceNumber}
    - Total Amount: $${totalAmount}
    - Due Date: ${dueDate}
    - Sender/Company Name: ${companyName}
    
    The email should include a clear subject line at the top (Subject: ...). Keep it concise, friendly, and clear about the payment expectations. Do not include placeholder brackets, use the provided data directly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error('Error generating email:', error.message);
    throw new Error('Failed to generate email from AI service: ' + error.message);
  }
};
/**
 * Generate AI-powered business insights based on dashboard metrics.
 * @param {Object} data - The dashboard metrics and data.
 * @returns {Promise<string[]>} - An array of insight strings.
 */
export const generateBusinessInsights = async (data) => {
  if (!ai) {
    throw new Error('AI features are disabled due to missing API key.');
  }

  try {
    const prompt = `You are an expert business consultant. Analyze the following supermarket dashboard data and provide 4 unique, fresh, and actionable insights or observations. 
    Avoid repeating the same obvious points. Look for different angles (e.g., comparing metrics, suggesting specific actions, identifying hidden risks).
    Keep each insight to one concise sentence.
    
    Current Data (Request Time: ${new Date().toISOString()}):
    - This Month's Revenue: ₹${data.revenue.thisMonth}
    - Last Month's Revenue: ₹${data.revenue.lastMonth}
    - Revenue Growth: ${data.revenue.growthPercentage}%
    - Top Client: ${data.topClient?.name || 'N/A'}
    - Most Active Sales Day: ${data.mostCommonDay?.day || 'N/A'}
    - Low Stock Products Count: ${data.lowStockProducts.length}
    - Total Inventory Value: ₹${data.inventorySummary.totalValue}
    
    Output the insights as a bulleted list of 4 items. Do not include introductory text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.9,
      }
    });

    const text = response.text.trim();
    // Simple parsing of bulleted list
    const insights = text.split('\n')
      .map(line => line.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 4);

    return insights.length > 0 ? insights : ["No insights generated."];
  } catch (error) {
    console.error('Error generating business insights:', error.message);
    
    // Provide a graceful fallback if the Gemini API rate limit is exceeded
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
      return [
        `Revenue is at ₹${data.revenue.thisMonth} this month (${data.revenue.growthPercentage > 0 ? '+' : ''}${data.revenue.growthPercentage}%).`,
        data.lowStockProducts.length > 0 ? `${data.lowStockProducts.length} items are currently running low on stock.` : "Inventory levels are currently healthy.",
        data.topClient ? `${data.topClient.name} is your top purchasing client right now.` : "No major client activity detected recently.",
        "(AI insights are temporarily unavailable due to API rate limits. Showing standard metrics.)"
      ];
    }
    
    throw new Error('Failed to generate insights from AI: ' + error.message);
  }
};
