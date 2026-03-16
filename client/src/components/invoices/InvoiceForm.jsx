import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';

/**
 * Reusable dynamic form to build Invoices line by line
 */
const InvoiceForm = ({ 
  clients = [], 
  products = [],
  invoice = null,
  onSubmit, 
  onGenerateDescription, 
  isLoading = false,
  isGeneratingAI = false,
  storageKey = 'draft_invoice'
}) => {
  // Try to load cached draft data from localStorage, ONLY if we are NOT editing an existing invoice Let draft take over if we are creating new.
  const cachedDraftStr = !invoice ? localStorage.getItem(storageKey) : null;
  const cachedDraft = cachedDraftStr ? JSON.parse(cachedDraftStr) : null;

  const [formData, setFormData] = useState({
    clientId: invoice?.clientId?._id || invoice?.clientId || (cachedDraft?.formData?.clientId || (invoice?.consumerDetails?.name ? 'consumer' : '')),
    invoiceNumber: invoice?.invoiceNumber || cachedDraft?.formData?.invoiceNumber || `INV-${Math.floor(Math.random() * 100000)}`,
    date: invoice?.date ? new Date(invoice.date).toISOString().split('T')[0] : (cachedDraft?.formData?.date || new Date().toISOString().split('T')[0]),
    dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : (cachedDraft?.formData?.dueDate || ''),
    tax: invoice?.tax ?? cachedDraft?.formData?.tax ?? 0,
    hasDeliveryCharge: invoice?.deliveryCharge ? true : (cachedDraft?.formData?.hasDeliveryCharge ?? false),
    deliveryCharge: invoice?.deliveryCharge || cachedDraft?.formData?.deliveryCharge || 0,
    status: invoice?.status || cachedDraft?.formData?.status || 'Pending',
    consumerDetails: invoice?.consumerDetails || cachedDraft?.formData?.consumerDetails || { name: '', email: '', phone: '', address: '' }
  });

  const [items, setItems] = useState(
    invoice?.items?.length > 0 
      ? invoice.items 
      : (cachedDraft?.items?.length > 0 ? cachedDraft.items : [{ name: '', quantity: 1, unit: 'qty', price: 0, taxRate: 0, productId: null }])
  );

  // Auto-save draft to local storage so user doesn't lose data on navigation
  useEffect(() => {
    // Only cache if we aren't editing a live invoice (to prevent accidentally overwriting the real DB data cache if they back out)
    if (!invoice) {
       localStorage.setItem(storageKey, JSON.stringify({ formData, items }));
    }
  }, [formData, items, invoice, storageKey]);

  // Auto-calculate Total Tax whenever items change
  useEffect(() => {
    const totalCalculatedTax = items.reduce((sum, item) => {
      const itemSubtotal = Number(item.quantity) * Number(item.price);
      const itemTaxRate = Number(item.taxRate || 0);
      return sum + (itemSubtotal * (itemTaxRate / 100));
    }, 0);
    
    // Only update if it's different to prevent infinite loops, and round to 2 decimals
    if (Math.abs(formData.tax - totalCalculatedTax) > 0.01) {
      setFormData(prev => ({ ...prev, tax: Number(totalCalculatedTax.toFixed(2)) }));
    }
  }, [items, formData.tax]);

  // --- Handlers ---
  const handleFormChange = (e) => {
    // Also handle autofilling consumer details if a client is selected
    if (e.target.name === 'clientId') {
      const selectedId = e.target.value;
      if (selectedId && selectedId !== 'consumer') {
        const selectedClient = clients.find((c) => c._id === selectedId);
        if (selectedClient) {
          setFormData((prev) => ({
            ...prev,
            clientId: selectedId,
            consumerDetails: {
              name: selectedClient.name || '',
              email: selectedClient.email || '',
              phone: selectedClient.phone || '',
              address: selectedClient.address || ''
            }
          }));
          return;
        }
      } else {
        // Reset if "consumer" or empty is selected
        setFormData((prev) => ({
          ...prev,
          clientId: selectedId,
          consumerDetails: { name: '', email: '', phone: '', address: '' }
        }));
        return;
      }
    }
    
    // Delivery toggle handler
    if (e.target.name === 'hasDeliveryCharge') {
      const isEnabled = e.target.checked;
      setFormData(prev => ({ 
        ...prev, 
        hasDeliveryCharge: isEnabled,
        deliveryCharge: isEnabled ? 10 : 0 
      }));
      return;
    }

    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConsumerChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      consumerDetails: {
        ...prev.consumerDetails,
        [e.target.name]: e.target.value
      }
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { name: '', quantity: 1, unit: 'qty', price: 0, taxRate: 0, productId: null }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleAIHook = async (index, serviceName) => {
    if (!serviceName) return alert("Please enter a basic service name first.");
    const description = await onGenerateDescription(serviceName);
    if (description) handleItemChange(index, 'name', description);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
  };

  const clearDraft = () => {
    if (!invoice) localStorage.removeItem(storageKey);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Clear draft storage before submitting since we are successfully dispatching it
    clearDraft();
    // Pass the calculated items and total tax upward
    onSubmit({ ...formData, items });
  };

  const subtotal = calculateSubtotal();
  const total = subtotal + Number(formData.deliveryCharge || 0);


  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      {/* 1. Meta Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Client *</label>
          <select 
            name="clientId" 
            required 
            value={formData.clientId} 
            onChange={handleFormChange}
            className="mt-1 input-field"
          >
            <option value="">Select a client...</option>
            <option value="consumer" className="font-semibold text-primary-600">Walk-in Consumer</option>
            {clients.map(c => (
              <option key={c._id} value={c._id}>{c.name} ({c.company || 'Individual'})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice Number *</label>
          <input type="text" name="invoiceNumber" required value={formData.invoiceNumber} onChange={handleFormChange} className="mt-1 input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date *</label>
          <input type="date" name="date" required value={formData.date} onChange={handleFormChange} className="mt-1 input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input type="date" name="dueDate" value={formData.dueDate} onChange={handleFormChange} className="mt-1 input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status *</label>
          <select name="status" required value={formData.status} onChange={handleFormChange} className="mt-1 input-field">
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* 1.5. Dynamic Contact Details */}
      {(formData.clientId !== '') && (
        <div className="bg-primary-50 p-4 rounded-lg flex flex-col gap-4 border border-primary-100">
           <h3 className="text-sm font-medium text-primary-800 border-b border-primary-200 pb-2">
             {formData.clientId === 'consumer' ? 'Enter Consumer Details' : 'Client Contact Details'}
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div>
               <label className="block text-xs font-medium text-primary-700">Name / Company</label>
               <input 
                 type="text" name="name" 
                 value={formData.consumerDetails.name} 
                 onChange={handleConsumerChange} 
                 className={`mt-1 input-field text-sm ${formData.clientId !== 'consumer' ? 'bg-primary-50 text-gray-500 cursor-not-allowed border-transparent focus:ring-0 px-0' : 'bg-white'}`}
                 readOnly={formData.clientId !== 'consumer'}
                 placeholder="Name"
               />
             </div>
             <div>
               <label className="block text-xs font-medium text-primary-700">Phone</label>
               <input 
                 type="text" name="phone" 
                 value={formData.consumerDetails.phone} 
                 onChange={handleConsumerChange} 
                 className={`mt-1 input-field text-sm ${formData.clientId !== 'consumer' ? 'bg-primary-50 text-gray-500 cursor-not-allowed border-transparent focus:ring-0 px-0' : 'bg-white'}`}
                 readOnly={formData.clientId !== 'consumer'}
                 placeholder="Phone number"
               />
             </div>
             <div>
               <label className="block text-xs font-medium text-primary-700">Email</label>
               <input 
                 type="email" name="email" 
                 value={formData.consumerDetails.email} 
                 onChange={handleConsumerChange} 
                 className={`mt-1 input-field text-sm ${formData.clientId !== 'consumer' ? 'bg-primary-50 text-gray-500 cursor-not-allowed border-transparent focus:ring-0 px-0' : 'bg-white'}`}
                 readOnly={formData.clientId !== 'consumer'}
                 placeholder="Email address"
               />
             </div>
             <div>
               <label className="block text-xs font-medium text-primary-700">Address</label>
               <input 
                 type="text" name="address" 
                 value={formData.consumerDetails.address} 
                 onChange={handleConsumerChange} 
                 className={`mt-1 input-field text-sm ${formData.clientId !== 'consumer' ? 'bg-primary-50 text-gray-500 cursor-not-allowed border-transparent focus:ring-0 px-0' : 'bg-white'}`}
                 readOnly={formData.clientId !== 'consumer'}
                 placeholder="Physical address"
               />
             </div>
           </div>
        </div>
      )}

      {/* 2. Line Items */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
          <button type="button" onClick={addItem} className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
            <Plus className="w-4 h-4 mr-1"/> Add Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg relative group">
              
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Item / Service Array</label>
                <div className="flex flex-col gap-2">
                   {/* Product Dropdown Selector */}
                   <select
                     className="input-field text-sm bg-white"
                     value={items[index].productId || ''}
                     onChange={(e) => {
                       const selectedProdId = e.target.value;
                       if (selectedProdId) {
                         const prod = products.find(p => p._id === selectedProdId);
                         if (prod) {
                           handleItemChange(index, 'name', prod.name);
                           handleItemChange(index, 'price', prod.price);
                           handleItemChange(index, 'taxRate', prod.tax || 0); // Pull Tax from Product
                           handleItemChange(index, 'productId', prod._id);
                           
                           // Optional default sync: auto-set max quantity if selected is 1, but limit doesn't exist
                           if (items[index].quantity > prod.stock) {
                              handleItemChange(index, 'quantity', prod.stock);
                           }
                         }
                       } else {
                         handleItemChange(index, 'name', '');
                         handleItemChange(index, 'price', 0);
                         handleItemChange(index, 'taxRate', 0);
                         handleItemChange(index, 'productId', null);
                       }
                     }}
                   >
                     <option value="">-- Select Product from Inventory --</option>
                     {products.map(p => (
                       <option key={p._id} value={p._id} disabled={p.stock <= 0} className={p.stock <= 0 ? 'text-red-400 font-medium' : ''}>
                         {p.name} (₹{p.price}) {p.tax ? `+ ${p.tax}% Tax` : ''} {p.stock <= 0 ? ' - Out of Stock' : ` - ${p.stock} left`}
                       </option>
                     ))}
                   </select>
                   <div className="flex items-center w-full">
                     <span className="text-xs text-gray-400 mx-2">OR</span>
                     <div className="flex-1 h-[1px] bg-gray-200"></div>
                   </div>

                   {/* Fallback custom text area */}
                   <div className="flex gap-2">
                    <textarea 
                      rows={1}
                      required
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      className="input-field flex-1 text-sm bg-white" placeholder="Custom generic item/service..." 
                    />
                    {/* AI Hook Button */}
                    <button 
                      type="button"
                      onClick={() => handleAIHook(index, item.name)}
                      disabled={isGeneratingAI}
                      className="btn-secondary h-auto px-3 py-1 flex flex-col items-center justify-center gap-1 border-primary-200 text-primary-600 hover:bg-primary-50"
                      title="Write a short phrase and click to unleash AI"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="text-[10px]">AI Enhance</span>
                    </button>
                   </div>
                </div>
              </div>

              <div className="w-full md:w-36 flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                  <input type="number" min="0.01" step="any" required value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="input-field text-sm px-2" />
                </div>
                <div className="w-16">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
                  <select value={item.unit || 'qty'} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} className="input-field text-sm px-1 py-2">
                    <option value="qty">qty</option>
                    <option value="g">g</option>
                    <option value="mg">mg</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="L">L</option>
                  </select>
                </div>
              </div>

              <div className="w-full md:w-32">
                <label className="block text-xs font-medium text-gray-500 mb-1">Price (₹)</label>
                <input type="number" min="0" step="0.01" required value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} className="input-field text-sm" />
              </div>
              
              <div className="w-full md:w-20">
                <label className="block text-xs font-medium text-gray-500 mb-1">Tax (%)</label>
                <input type="number" min="0" step="0.01" value={item.taxRate || 0} onChange={(e) => handleItemChange(index, 'taxRate', e.target.value)} className="input-field text-sm px-2" />
              </div>

              {/* Dynamic Subtotal Display for Row */}
              <div className="w-full md:w-24 self-end pb-2 hidden md:block text-right font-medium text-gray-900">
                ₹{(item.quantity * item.price).toFixed(2)}
              </div>

              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(index)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4"/>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Totals */}
      <div className="pt-6 border-t border-gray-200 flex justify-end">
        <div className="w-full md:w-1/3 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 items-center">
            <span>Calculated Tax (₹):</span>
            <input 
              type="number" min="0" step="0.01" 
              value={formData.tax} 
              onChange={handleFormChange} 
              name="tax"
              className="input-field w-24 text-right py-1" 
            />
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
             <div className="flex items-center">
                <input 
                  type="checkbox" 
                  name="hasDeliveryCharge"
                  id="hasDeliveryCharge"
                  checked={formData.hasDeliveryCharge}
                  onChange={handleFormChange}
                  className="mr-2 rounded text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="hasDeliveryCharge" className="cursor-pointer">Add Delivery (₹)</label>
             </div>
             {formData.hasDeliveryCharge ? (
               <input 
                 type="number" min="0" step="0.01" 
                 value={formData.deliveryCharge} 
                 onChange={handleFormChange} 
                 name="deliveryCharge"
                 className="input-field w-24 text-right py-1" 
               />
             ) : (
               <span>₹0.00</span>
             )}
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
            <span>Total INR:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Submission */}
      <div className="flex justify-end pt-4">
        <button type="submit" disabled={isLoading} className="btn-primary w-full md:w-auto h-12 px-8 text-lg">
          {isLoading ? 'Processing...' : (invoice ? 'Update Invoice' : 'Save & Generate Invoice')}
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;
