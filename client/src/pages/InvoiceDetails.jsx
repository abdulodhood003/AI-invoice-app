import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Mail, ArrowLeft, Edit, Copy, Check, X, Loader2, Sparkles } from 'lucide-react';
import { useInvoicesData } from '../hooks/useInvoicesData';
import api from '../services/api';
import Loader from '../components/ui/Loader';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInvoiceById, updateInvoiceStatus } = useInvoicesData();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    const res = await updateInvoiceStatus(id, newStatus);
    if (res.success) {
      setInvoice({ ...invoice, status: newStatus });
    } else {
      alert(res.error || 'Failed to update status');
    }
  };

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

  const handleGenerateEmail = async () => {
    try {
      setIsDraftingEmail(true);
      setEmailError(null);
      setEmailDraft(null);
      
      const payload = {
        clientName: invoice.clientId?.name || invoice.consumerDetails?.name || 'Client',
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        dueDate: invoice.dueDate,
        companyName: 'Billora AI'
      };
      
      const res = await api.post('/ai/generate-email', payload);
      setEmailDraft(res.data.emailBody);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Failed to generate email via AI.';
      setEmailError(message);
    } finally {
      setIsDraftingEmail(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  if (error || !invoice) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Invoice not found</h3>
        <p className="mt-1 text-sm text-gray-500">{error || 'The requested invoice does not exist.'}</p>
        <button onClick={() => navigate('/invoices')} className="mt-6 btn-secondary">Go back to invoices</button>
      </div>
    );
  }

  // Helper formatting
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header & Actions */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate('/invoices')} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
           <ArrowLeft className="w-4 h-4 mr-1"/> Back
        </button>
      </div>

      <div className="sm:flex sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
          <select 
            value={invoice.status}
            onChange={handleStatusChange}
            className={`mt-2 outline-none cursor-pointer text-xs font-medium px-2.5 py-1 rounded-full appearance-none pr-3 ${
              invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
              invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
              invoice.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}
          >
             <option value="Draft">Draft</option>
             <option value="Pending">Pending</option>
             <option value="Paid">Paid</option>
             <option value="Overdue">Overdue</option>
          </select>
        </div>
        <div className="mt-4 flex gap-3 sm:mt-0 sm:ml-4 flex-wrap justify-end">
           <button 
             type="button" 
             onClick={() => navigate(`/invoices/${id}/edit`)} 
             className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-white flex items-center"
           >
             <Edit className="h-4 w-4 mr-2" /> Edit Invoice
           </button>
           <button type="button" onClick={() => window.print()} className="btn-secondary flex items-center">
             <Download className="h-4 w-4 mr-2" /> Download/Print
           </button>
           <button 
             type="button" 
             onClick={handleGenerateEmail} 
             disabled={isDraftingEmail}
             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-md shadow-indigo-200"
           >
             {isDraftingEmail 
               ? <><Loader2 className="h-4 w-4 animate-spin" /> Drafting...</> 
               : <><Sparkles className="h-4 w-4" /> AI Email Draft</>}
           </button>
        </div>
      </div>

      {/* AI Email Error Banner */}
      {emailError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-red-800">⚠️ Email Generation Failed</p>
            <p className="text-sm text-red-700 mt-1">{emailError}</p>
          </div>
          <button onClick={() => setEmailError(null)} className="text-red-400 hover:text-red-600 ml-4 flex-shrink-0"><X size={16}/></button>
        </div>
      )}

      {/* AI Email Draft Card */}
      {emailDraft && (
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-purple-50 to-white shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100 bg-white/60 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 rounded-lg">
                <Sparkles className="text-white" size={14} />
              </div>
              <span className="text-sm font-bold text-indigo-900">AI Generated Email Draft</span>
              <span className="text-xs text-indigo-400 font-medium ml-1">• Edit before sending</span>
            </div>
            <button 
              onClick={() => setEmailDraft(null)} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>
          {/* Editable Email Body */}
          <div className="p-6">
            <textarea 
              className="w-full h-52 p-4 text-sm text-gray-700 bg-white border border-indigo-100 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none leading-relaxed shadow-inner font-mono" 
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">✏️ You can edit the draft above before copying</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(emailDraft);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  copied 
                    ? 'bg-green-500 text-white shadow-md shadow-green-200' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
                }`}
              >
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy to Clipboard</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THE ACTUAL INVOICE PREVIEW */}
      <div className="mt-8 bg-white shadow-lg border border-gray-100 p-10 sm:p-14 rounded-xl print:shadow-none print:border-none">
          {/* Top Grid */}
         <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Billora AI</h2>
               <p className="text-gray-500 text-sm">123 Tech Lane, Suite 100</p>
               <p className="text-gray-500 text-sm">San Francisco, CA 94107</p>
            </div>
            <div className="text-right">
               <h3 className="text-gray-500 font-medium mb-1">Billed To</h3>
               
               {invoice.clientId ? (
                 <>
                   <p className="text-gray-900 font-semibold">{invoice.clientId.name}</p>
                   {invoice.clientId.company && <p className="text-gray-600 text-sm">{invoice.clientId.company}</p>}
                   {invoice.clientId.phone && <p className="text-gray-500 text-sm">{invoice.clientId.phone}</p>}
                   <p className="text-gray-500 text-sm">{invoice.clientId.email}</p>
                   <p className="text-gray-500 text-sm mt-1">{invoice.clientId.address}</p>
                 </>
               ) : invoice.consumerDetails?.name ? (
                 <>
                   <p className="text-gray-900 font-semibold">{invoice.consumerDetails.name}</p>
                   <p className="text-gray-600 text-sm italic">Walk-in Consumer</p>
                   {invoice.consumerDetails.phone && <p className="text-gray-500 text-sm">{invoice.consumerDetails.phone}</p>}
                   {invoice.consumerDetails.email && <p className="text-gray-500 text-sm">{invoice.consumerDetails.email}</p>}
                   {invoice.consumerDetails.address && <p className="text-gray-500 text-sm mt-1">{invoice.consumerDetails.address}</p>}
                 </>
               ) : (
                 <p className="text-gray-900 font-semibold">Unknown Client</p>
               )}
            </div>
         </div>

         {/* Meta Data */}
         <div className="grid grid-cols-3 gap-4 mb-10 py-4 border-y border-gray-200">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Invoice No.</p>
              <p className="font-medium text-gray-900 mt-1">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Date of Issue</p>
              <p className="font-medium text-gray-900 mt-1">{formatDate(invoice.date)}</p>
            </div>
            <div>
               <p className="text-xs font-semibold text-gray-500 uppercase">Due Date</p>
               <p className="font-medium text-gray-900 mt-1">{formatDate(invoice.dueDate)}</p>
            </div>
         </div>

         {/* Items Table */}
         <div className="mb-10">
           <table className="w-full text-left">
             <thead>
               <tr className="border-b border-gray-200 text-sm font-semibold text-gray-500 uppercase">
                 <th className="py-3 px-2">Description</th>
                 <th className="py-3 px-2 text-center w-24">QTY</th>
                 <th className="py-3 px-2 text-right w-24">Price</th>
                 <th className="py-3 px-2 text-right w-24">Tax</th>
                 <th className="py-3 px-2 text-right w-32">Total</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {invoice.items.map((item, idx) => (
                 <tr key={idx} className="text-sm">
                   <td className="py-4 px-2 text-gray-900">{item.name}</td>
                   <td className="py-4 px-2 text-center text-gray-600">
                     {item.quantity} {item.unit && item.unit !== 'qty' ? item.unit : ''}
                   </td>
                   <td className="py-4 px-2 text-right text-gray-600">{formatCurrency(item.price)}</td>
                   <td className="py-4 px-2 text-right text-gray-600">
                     {item.taxRate ? `${item.taxRate}%` : '0%'}
                   </td>
                   <td className="py-4 px-2 text-right text-gray-900 font-medium">
                     {formatCurrency(item.quantity * item.price)}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>

         {/* Totals Box */}
         <div className="flex justify-end pt-6 border-t border-gray-200">
           <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                 <span>Subtotal</span>
                 <span>{formatCurrency(invoice.totalAmount - (invoice.deliveryCharge || 0))}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                   <span>Tax</span>
                   <span>{formatCurrency(invoice.tax)}</span>
                </div>
              )}
              {invoice.deliveryCharge > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                   <span>Delivery</span>
                   <span>{formatCurrency(invoice.deliveryCharge)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                 <span>Total Due</span>
                 <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
           </div>
         </div>

      </div>
    </div>
  );
};

export default InvoiceDetails;
