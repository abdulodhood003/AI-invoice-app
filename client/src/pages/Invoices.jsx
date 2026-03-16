import React, { useState } from 'react';
import { Plus, Download, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useInvoicesData } from '../hooks/useInvoicesData';
import InvoiceTable from '../components/invoices/InvoiceTable';
import Loader from '../components/ui/Loader';

const Invoices = () => {
  const { invoices, loading, error, deleteInvoice } = useInvoicesData();
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');

  const filteredInvoices = invoices.filter(invoice => {
    const matchId = invoice.invoiceNumber.toLowerCase().includes(searchId.toLowerCase());
    const clientName = invoice.clientId?.name || invoice.consumerDetails?.name || 'Walk-in';
    const matchName = clientName.toLowerCase().includes(searchName.toLowerCase());
    return matchId && matchName;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice(id);
    }
  };

  const exportToExcel = () => {
    const exportData = invoices.map(invoice => ({
      'Invoice Number': invoice.invoiceNumber,
      'Date': new Date(invoice.date).toLocaleDateString(),
      'Due Date': new Date(invoice.dueDate).toLocaleDateString(),
      'Client Name': invoice.clientId?.name || invoice.consumerDetails?.name || 'Walk-in',
      'Client Email': invoice.clientId?.email || invoice.consumerDetails?.email || '',
      'Status': invoice.status,
      'Total Amount': invoice.totalAmount,
      'Notes': invoice.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    XLSX.writeFile(workbook, "invoices_export.xlsx");
  };

  return (
    <div>
      <div className="sm:flex sm:items-center justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
          <p className="mt-2 text-sm text-gray-700">Manage, view, and create new invoices.</p>
        </div>
        <div className="mt-4 sm:flex-none sm:ml-16 flex gap-3">
          <button onClick={exportToExcel} className="btn-secondary inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
             <Download className="h-4 w-4 mr-2" /> Export to Excel
          </button>
          <Link to="/invoices/new" className="btn-primary inline-flex">
             <Plus className="h-4 w-4 mr-2" /> Create Invoice
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 bg-red-50 p-4 border-l-4 border-red-400">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-8 flex flex-col">
        {loading ? (
          <Loader />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {/* Search Filters */}
            {(invoices.length > 0 || searchId || searchName) && (
              <div className="p-4 border-b border-gray-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by Invoice ID..."
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by Client Name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                  />
                </div>
              </div>
            )}
            
            {invoices.length === 0 ? (
               <div className="px-6 py-12 text-center text-gray-500">
                 No invoices created yet. Click "Create Invoice" to start.
               </div>
            ) : filteredInvoices.length === 0 ? (
               <div className="px-6 py-12 text-center text-gray-500">
                 No invoices matched your search criteria.
               </div>
            ) : (
               <div className="w-full overflow-x-auto">
                 <InvoiceTable invoices={filteredInvoices} onDelete={handleDelete} />
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;
