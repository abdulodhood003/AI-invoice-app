import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useClientsData } from '../hooks/useClientsData';
import { useInvoicesData } from '../hooks/useInvoicesData';
import { useProductsData } from '../hooks/useProductsData';
import InvoiceForm from '../components/invoices/InvoiceForm';
import Loader from '../components/ui/Loader';

const PROMPT_EXAMPLES = [
  '5 kg rice at ₹60/kg and 2 L oil at ₹150 for John, due next week',
  'Invoice for web design service ₹25000 and hosting ₹5000 for Acme Corp',
  '3 items: milk 10 L ₹55/L, eggs 2 qty ₹120 each for walk-in customer',
];

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { clients, loading: clientsLoading } = useClientsData();
  const { products, loading: productsLoading } = useProductsData();
  const { createInvoice } = useInvoicesData();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [error, setError] = useState(null);

  // AI prompt state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiPromptError, setAiPromptError] = useState(null);
  // When set, it will pre-fill the form below
  const [aiGeneratedData, setAiGeneratedData] = useState(null);

  // --- Handlers ---
  const handleGenerateDescription = async (serviceName) => {
    try {
      setIsGeneratingAI(true);
      setError(null);
      const res = await api.post('/ai/generate-description', { serviceName });
      return res.data.description;
    } catch (err) {
      console.error('AI Generation failed:', err);
      alert('AI Generation temporarily unavailable. Please type manually.');
      return '';
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!aiPrompt.trim()) {
      setAiPromptError('Please describe the invoice first.');
      return;
    }
    try {
      setIsGeneratingInvoice(true);
      setAiPromptError(null);
      setAiGeneratedData(null);

      const clientNames = clients.map((c) => c.name);
      
      // Pass simple product list to the backend
      const productList = products.map((p) => ({
        name: p.name,
        price: p.price,
        id: p._id
      }));

      const res = await api.post('/ai/generate-invoice', {
        prompt: aiPrompt.trim(),
        clientNames,
        products: productList
      });

      const data = res.data.invoiceData;

      // Try to match the AI-returned clientName to an actual client in the list
      let matchedClientId = '';
      if (data.clientName) {
        const matched = clients.find(
          (c) =>
            c.name.toLowerCase().includes(data.clientName.toLowerCase()) ||
            data.clientName.toLowerCase().includes(c.name.toLowerCase())
        );
        if (matched) matchedClientId = matched._id;
      }

      setAiGeneratedData({
        clientId: matchedClientId,
        clientName: data.clientName || '',
        items: (data.items || []).map((item) => {
          // Try to match the item name against known products to get the productId
          let matchedProductId = null;
          let matchedPrice = Number(item.price) || 0;
          
          if (item.name) {
             const matchedProduct = products.find(p => 
               p.name.toLowerCase() === item.name.toLowerCase() ||
               item.name.toLowerCase().includes(p.name.toLowerCase()) ||
               p.name.toLowerCase().includes(item.name.toLowerCase())
             );
             
             if (matchedProduct) {
               matchedProductId = matchedProduct._id;
               if (!matchedPrice) {
                  matchedPrice = Number(matchedProduct.price);
               }
             }
          }

          return {
            name: item.name || '',
            quantity: Number(item.quantity) || 1,
            unit: item.unit || 'qty',
            price: matchedPrice,
            taxRate: Number(item.taxRate) || 0,
            productId: matchedProductId,
          };
        }),
        dueDate: data.dueDate || '',
        status: data.status || 'Pending',
      });
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || 'Failed to generate invoice.';
      setAiPromptError(message);
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleSubmit = async (invoiceData) => {
    setIsSubmitting(true);
    setError(null);

    const totalAmount =
      invoiceData.items.reduce((sum, item) => sum + item.quantity * item.price, 0) +
      Number(invoiceData.tax);

    const payload = { ...invoiceData, totalAmount };
    const result = await createInvoice(payload);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/invoices');
    } else {
      setError(result.error);
    }
  };

  if (clientsLoading || productsLoading) return <Loader fullScreen />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create New Invoice</h1>
          <p className="mt-1 text-sm text-gray-500">
            Describe your invoice in plain language and let AI fill it in — or build it manually below.
          </p>
        </div>
      </div>

      {/* ── AI Prompt Panel ── */}
      <div className="mb-6 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h2 className="text-sm font-semibold text-indigo-800">Generate Invoice with AI</h2>
        </div>

        <textarea
          rows={3}
          value={aiPrompt}
          onChange={(e) => {
            setAiPrompt(e.target.value);
            if (aiPromptError) setAiPromptError(null);
          }}
          placeholder={`Describe your invoice in plain language...\ne.g. "${PROMPT_EXAMPLES[0]}"`}
          className="w-full rounded-lg border border-indigo-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none shadow-inner"
        />

        {/* Example chips */}
        <div className="mt-2 flex flex-wrap gap-2">
          {PROMPT_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setAiPrompt(ex)}
              className="text-xs px-3 py-1 rounded-full bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              {ex.length > 50 ? ex.slice(0, 50) + '…' : ex}
            </button>
          ))}
        </div>

        {aiPromptError && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {aiPromptError}
          </p>
        )}

        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={handleGenerateInvoice}
            disabled={isGeneratingInvoice || !aiPrompt.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow"
          >
            {isGeneratingInvoice ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Invoice
              </>
            )}
          </button>
          {aiGeneratedData && (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              ✅ Invoice filled! Review and edit below, then save.
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 p-4 border-l-4 border-red-400">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ── Main Invoice Form ── */}
      <InvoiceForm
        clients={clients}
        products={products}
        onSubmit={handleSubmit}
        onGenerateDescription={handleGenerateDescription}
        isLoading={isSubmitting}
        isGeneratingAI={isGeneratingAI}
        initialData={aiGeneratedData}
      />
    </div>
  );
};

export default CreateInvoice;
