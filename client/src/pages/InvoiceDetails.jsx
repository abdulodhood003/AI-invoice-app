import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Mail, ArrowLeft, Edit } from 'lucide-react';
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
      
      const payload = {
        clientName: invoice.clientId?.name || 'Client',
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        dueDate: invoice.dueDate,
        companyName: 'AI Invoicer App' // Default company name or dynamic from user context
      };
      
      const res = await api.post('/ai/generate-email', payload);
      setEmailDraft(res.data.emailBody);
    } catch (err) {
      alert('Failed to generate email via AI');
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
             className="btn-secondary flex items-center"
           >
             <Mail className="h-4 w-4 mr-2" /> {isDraftingEmail ? 'Drafting...' : 'AI Email Draft'}
           </button>
        </div>
      </div>

      {/* AI Draft Display Modal/Block */}
      {emailDraft && (
        <div className="mt-6 p-6 bg-primary-50 border border-primary-200 rounded-lg">
           <div className="flex justify-between items-start mb-4">
             <h3 className="text-sm font-semibold text-primary-900 flex items-center">
                AI Generated Email Draft
             </h3>
             <button onClick={() => setEmailDraft(null)} className="text-sm text-primary-600 hover:text-primary-800">Close</button>
           </div>
           <textarea 
             className="w-full h-48 p-4 text-sm bg-white border border-primary-100 rounded focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" 
             defaultValue={emailDraft}
             onChange={(e) => setEmailDraft(e.target.value)}
           />
           <div className="mt-3 flex justify-end">
             <button onClick={() => navigator.clipboard.writeText(emailDraft)} className="text-sm font-medium text-primary-700 bg-white border border-primary-200 px-3 py-1 rounded shadow-sm hover:bg-gray-50">
               Copy to Clipboard
             </button>
           </div>
        </div>
      )}

      {/* THE ACTUAL INVOICE PREVIEW */}
      <div className="mt-8 bg-white shadow-lg border border-gray-100 p-10 sm:p-14 rounded-xl print:shadow-none print:border-none">
          {/* Top Grid */}
         <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
               <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Invoicer App</h2>
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
