import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useClientsData } from '../hooks/useClientsData';
import { useInvoicesData } from '../hooks/useInvoicesData';
import { useProductsData } from '../hooks/useProductsData';
import InvoiceForm from '../components/invoices/InvoiceForm';
import Loader from '../components/ui/Loader';

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, loading: clientsLoading } = useClientsData();
  const { products, loading: productsLoading } = useProductsData();
  const { getInvoiceById, updateInvoice } = useInvoicesData();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      const res = await getInvoiceById(id);
      if (res.success) {
        setInvoice(res.data);
      } else {
        setError(res.error);
      }
      setLoading(false);
    };
    fetchInvoice();
  }, [id]);

  // --- Handlers ---
  const handleGenerateDescription = async (serviceName) => {
    try {
      setIsGeneratingAI(true);
      setError(null);
      // Call the AI endpoint on our backend
      const res = await api.post('/ai/generate-description', { serviceName });
      return res.data.description;
    } catch (err) {
      console.error("AI Generation failed:", err);
      // Give the user a fallback option if the AI fails
      alert('AI Generation temporarily unavailable. Please type manually.');
      return '';
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (invoiceData) => {
    setIsSubmitting(true);
    setError(null);
    
    // Add up the items sum dynamically before submission
    const totalAmount = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) + Number(invoiceData.tax);
    
    const payload = {
      ...invoiceData,
      totalAmount
    };

    const result = await updateInvoice(id, payload);
    
    setIsSubmitting(false);

    if (result.success) {
      navigate(`/invoices/${id}`); // Redirect back to details page
    } else {
      setError(result.error);
    }
  };

  if (clientsLoading || productsLoading || loading) return <Loader fullScreen />;

  if (error && !invoice) {
    return (
      <div className="max-w-4xl mx-auto mt-6 bg-red-50 p-4 border-l-4 border-red-400">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Invoice</h1>
          <p className="mt-1 text-sm text-gray-500">
            Modify details for {invoice.invoiceNumber}.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 p-4 border-l-4 border-red-400">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Embedded Form Component populated with existing invoice */}
      <InvoiceForm 
        clients={clients} 
        products={products}
        invoice={invoice}
        onSubmit={handleSubmit} 
        onGenerateDescription={handleGenerateDescription}
        isLoading={isSubmitting}
        isGeneratingAI={isGeneratingAI}
      />
    </div>
  );
};

export default EditInvoice;
