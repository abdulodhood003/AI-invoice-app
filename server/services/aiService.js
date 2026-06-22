import { InferenceClient } from '@huggingface/inference';

// Primary model: Qwen2.5-72B — hosted directly by HuggingFace, very reliable on free tier
const PRIMARY_MODEL = 'Qwen/Qwen2.5-72B-Instruct';
// Fallback model if primary is unavailable
const FALLBACK_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';

// Initialize HF client
let hf = null;
if (process.env.HF_API_KEY) {
  try {
    hf = new InferenceClient(process.env.HF_API_KEY);
    console.log('HuggingFace InferenceClient initialized successfully.');
  } catch (error) {
    console.warn('HuggingFace init failed:', error.message);
  }
} else {
  console.warn('HF_API_KEY is not defined. AI features are disabled.');
}

/**
 * Core helper – sends a chat message to HF inference and returns trimmed response.
 * Tries PRIMARY_MODEL first, falls back to FALLBACK_MODEL on provider errors.
 * @param {string} userMessage
 * @param {number} maxTokens
 * @returns {Promise<string>}
 */
const callHF = async (userMessage, maxTokens = 512) => {
  if (!hf) throw new Error('AI features are disabled due to missing API key.');

  const tryModel = async (model) => {
    const result = await hf.chatCompletion({
      model,
      messages: [{ role: 'user', content: userMessage }],
      max_tokens: maxTokens,
      temperature: 0.7,
    });
    return result.choices[0].message.content.trim();
  };

  try {
    return await tryModel(PRIMARY_MODEL);
  } catch (primaryError) {
    const msg = primaryError.message || '';
    console.warn(`Primary model (${PRIMARY_MODEL}) failed: ${msg}. Trying fallback...`);

    // Only fall back on provider/network errors, not auth errors
    const isProviderError =
      msg.includes('HTTP error') ||
      msg.includes('provider') ||
      msg.includes('503') ||
      msg.includes('502') ||
      msg.includes('500') ||
      msg.includes('504');

    if (isProviderError) {
      try {
        return await tryModel(FALLBACK_MODEL);
      } catch (fallbackError) {
        console.error(`Fallback model (${FALLBACK_MODEL}) also failed: ${fallbackError.message}`);
        // Surface original error status for rate-limit detection
        primaryError.status =
          primaryError.status ||
          (primaryError.message?.includes('429') ? 429 : undefined);
        throw primaryError;
      }
    }

    // Non-provider errors (auth, quota) – rethrow immediately
    primaryError.status =
      primaryError.status ||
      (msg.includes('429') ? 429 : undefined);
    throw primaryError;
  }
};

/**
 * Check if an error is a rate-limit / quota error.
 */
const isQuotaError = (error) =>
  error.status === 429 ||
  (error.message &&
    (error.message.includes('429') ||
      error.message.toLowerCase().includes('rate limit') ||
      error.message.toLowerCase().includes('quota')));

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a professional description for an invoice item.
 * @param {string} serviceName
 * @returns {Promise<string>}
 */
export const generateInvoiceDescription = async (serviceName) => {
  const prompt = `You are a professional copywriter. Write a concise, professional, single-paragraph description (max 3 sentences) for an invoice line item based on this service name: "${serviceName}". Do not include greetings or pleasantries, just the description.`;

  try {
    return await callHF(prompt, 200);
  } catch (error) {
    console.error('Error generating description:', error.message);
    if (isQuotaError(error)) {
      throw new Error('AI quota exceeded. Please try again later.');
    }
    throw new Error('Failed to generate description from AI service: ' + error.message);
  }
};

/**
 * Generate a professional email to send along with an invoice.
 */
export const generateInvoiceEmail = async ({
  clientName,
  invoiceNumber,
  totalAmount,
  dueDate,
  companyName,
}) => {
  const prompt = `You are a professional business assistant. Draft a polite and professional email to a client for sending them an invoice.
Use the following details:
- Client Name: ${clientName}
- Invoice Number: ${invoiceNumber}
- Total Amount: ₹${totalAmount}
- Due Date: ${dueDate}
- Sender/Company Name: ${companyName}

The email should include a clear subject line at the top starting with "Subject: ...". Keep it concise, friendly, and professional. Do not include placeholder brackets — use the provided data directly. Output only the email text, no preamble.`;

  try {
    return await callHF(prompt, 400);
  } catch (error) {
    console.error('Error generating email:', error.message);
    if (isQuotaError(error)) {
      // Graceful fallback template
      return `Subject: Invoice ${invoiceNumber} from ${companyName} – Payment Due ${dueDate}

Dear ${clientName},

I hope this message finds you well. Please find attached Invoice #${invoiceNumber} for the amount of ₹${totalAmount}, due on ${dueDate}.

Kindly process the payment at your earliest convenience. If you have any questions, please don't hesitate to reach out.

Thank you for your continued business.

Warm regards,
${companyName}

---
(Note: AI generation temporarily unavailable. This is a pre-written template.)`;
    }
    throw new Error('Failed to generate email from AI service: ' + error.message);
  }
};

/**
 * Generate AI-powered business insights based on dashboard metrics.
 * @param {Object} data - Dashboard metrics.
 * @returns {Promise<string[]>}
 */
export const generateBusinessInsights = async (data) => {
  const prompt = `You are an expert business consultant. Analyze the following business dashboard data and provide exactly 4 unique, actionable insights. Keep each insight to one concise sentence. Output ONLY a numbered list (1. 2. 3. 4.), no introduction, no conclusion.

Current Data (${new Date().toISOString()}):
- This Month's Revenue: ₹${data.revenue?.thisMonth || 0}
- Last Month's Revenue: ₹${data.revenue?.lastMonth || 0}
- Revenue Growth: ${data.revenue?.growthPercentage || 0}%
- Top Client: ${data.topClient?.name || 'N/A'}
- Most Active Sales Day: ${data.mostCommonDay?.day || 'N/A'}
- Low Stock Products Count: ${data.lowStockProducts?.length || 0}
- Total Inventory Value: ₹${data.inventorySummary?.totalValue || 0}`;

  try {
    const text = await callHF(prompt, 300);
    const insights = text
      .split('\n')
      .map((line) => line.replace(/^[\d]+[\.)\s]+/, '').trim())
      .filter((line) => line.length > 10)
      .slice(0, 4);
    return insights.length > 0 ? insights : ['No actionable insights generated from current data.'];
  } catch (error) {
    console.error('Error generating insights:', error.message);
    if (isQuotaError(error)) {
      return [
        `Revenue is at ₹${data.revenue?.thisMonth || 0} this month (${data.revenue?.growthPercentage > 0 ? '+' : ''}${data.revenue?.growthPercentage || 0}%).`,
        data.lowStockProducts?.length > 0
          ? `${data.lowStockProducts.length} items are running low on stock — restock soon to avoid lost sales.`
          : 'Inventory levels are currently healthy.',
        data.topClient
          ? `${data.topClient.name} is your top purchasing client — consider rewarding them with a loyalty discount.`
          : 'No major client activity detected recently.',
        '(AI insights temporarily unavailable due to API limits. Showing standard metrics.)',
      ];
    }
    throw new Error('Failed to generate insights from AI: ' + error.message);
  }
};

/**
 * Parse a natural-language prompt into a structured invoice object.
 * @param {string} prompt - User's plain-text description of the invoice.
 * @param {string[]} clientNames - List of known client names.
 * @param {Array} products - List of known products with names and prices.
 * @returns {Promise<Object>}
 */
export const generateInvoiceFromPrompt = async (prompt, clientNames = [], products = []) => {
  const clientListText =
    clientNames.length > 0
      ? `Known clients: ${clientNames.join(', ')}.`
      : 'No known clients in the system.';
      
  const productListText = 
    products.length > 0
      ? `Known products/prices: ${products.map(p => `${p.name} (Price: ${p.price})`).join(', ')}.`
      : 'No known products in the system.';

  const today = new Date().toISOString().split('T')[0];

  const systemPrompt = `You are an invoice parsing assistant. Extract the details from the user's description and return ONLY a valid JSON object (no markdown, no code fences, no explanation):
{
  "clientName": "string or null",
  "items": [
    { "name": "string", "quantity": number, "unit": "qty|kg|g|mg|L|ml", "price": number, "taxRate": number }
  ],
  "dueDate": "YYYY-MM-DD or null",
  "status": "Pending"
}

Rules:
- "clientName" must match a known client if possible, else use what the user said.
- "quantity" and "price" must be plain numbers (no currency symbols).
- If the user omits the price for an item, but the item matches a known product, use the known product's price. If it doesn't match and no price is provided, use 0.
- "unit" must be one of: qty, kg, g, mg, L, ml. Default to "qty".
- "taxRate" defaults to 0 if not mentioned.
- "dueDate": calculate from today (${today}) if a relative date is given; null if not mentioned.
- Return ONLY the JSON object. Absolutely no other text.

${clientListText}
${productListText}

User input: "${prompt}"`;

  try {
    let rawText = await callHF(systemPrompt, 600);

    // Strip any accidental markdown code fences
    rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    // Extract the first JSON object found (in case the model added extra text)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new SyntaxError('No JSON object found in response.');

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating invoice from prompt:', error.message);
    if (isQuotaError(error)) {
      throw new Error('AI quota exceeded. Please try again later.');
    }
    if (error instanceof SyntaxError) {
      throw new Error('AI returned an unexpected format. Please rephrase your prompt and try again.');
    }
    throw new Error('Failed to generate invoice from AI: ' + error.message);
  }
};
