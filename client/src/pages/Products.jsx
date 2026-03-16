import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useProductsData } from '../hooks/useProductsData';
import Loader from '../components/ui/Loader';
import { Plus, Trash2, Edit, Package, Calendar, AlertCircle, Download, Search } from 'lucide-react';

const Products = () => {
  const { products, loading, error, createProduct, updateProduct, deleteProduct } = useProductsData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    unit: 'pcs',
    barcode: '',
    expiryDate: '',
    supplier: '',
    tax: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      tax: formData.tax ? Number(formData.tax) : 0,
      // If expiry date is empty string, make it undefined so it correctly omits in MongoDB
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined
    };

    const result = editingId
      ? await updateProduct(editingId, payload)
      : await createProduct(payload);
    
    setSubmitting(false);

    if (result.success) {
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ name: '', category: '', price: '', stock: '', barcode: '', expiryDate: '', supplier: '', tax: '' });
    } else {
      setFormError(result.error);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      unit: product.unit || 'pcs',
      barcode: product.barcode || '',
      expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
      supplier: product.supplier || '',
      tax: product.tax || ''
    });
    setFormError('');
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you confirm you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const exportToExcel = () => {
    const exportData = products.map((product) => ({
      'Product Name': product.name,
      'Category': product.category,
      'Price (₹)': product.price,
      'Stock': product.stock,
      'Unit': product.unit,
      'Barcode': product.barcode || '',
      'Status': product.stock < 10 ? 'Low Stock' : 'In Stock',
      'Tax (%)': product.tax || 0,
      'Expiry Date': product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A',
      'Supplier': product.supplier || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products_inventory_export.xlsx");
  };

  // Helper to safely format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading && products.length === 0) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-primary-600" /> Products
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your supermarket inventory items.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button onClick={exportToExcel} className="btn-secondary flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
             <Download className="w-4 h-4" /> Export to Excel
          </button>
          <button 
            onClick={() => {
              const closing = isFormOpen;
              setIsFormOpen(!isFormOpen);
              if (closing) {
                setEditingId(null);
                setFormData({ name: '', category: '', price: '', stock: '', barcode: '', expiryDate: '', supplier: '', tax: '' });
              }
            }} 
            className="btn-primary flex items-center justify-center gap-2"
          >
            {isFormOpen ? 'Cancel' : <><Plus className="w-5 h-5"/> Add Product</>}
          </button>
        </div>
      </div>

      {!isFormOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
              <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                 <Package size={14}/> Active Inventory
              </div>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Stock Units</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                 {products.reduce((acc, p) => acc + (p.stock || 0), 0)}
              </p>
              <div className="mt-2 text-xs text-indigo-400 font-medium">Available for sale</div>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inventory Value</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                 ₹{products.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0)), 0).toLocaleString()}
              </p>
              <div className="mt-2 text-xs text-green-500 font-medium">Estimated value</div>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Low Stock items</p>
              <p className="text-2xl font-bold text-red-500 mt-1">
                 {products.filter(p => p.stock < 10).length}
              </p>
              <div className="mt-2 text-xs text-red-400 font-medium flex items-center gap-1">
                 <AlertCircle size={14}/> Requires attention
              </div>
           </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 border-l-4 border-red-400">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Slide-Down Form Overlay */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in slide-in-from-top flex flex-col gap-4">
          <h2 className="text-xl font-medium text-gray-900 border-b border-gray-100 pb-2">
            {editingId ? 'Edit Product' : 'New Product'}
          </h2>
          
          {formError && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{formError}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="mt-1 input-field" placeholder="E.g. Full Cream Milk 1L" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <input type="text" name="category" required value={formData.category} onChange={handleInputChange} className="mt-1 input-field" placeholder="E.g. Dairy" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (₹) *</label>
              <input type="number" step="0.01" min="0" name="price" required value={formData.price} onChange={handleInputChange} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock Quantity *</label>
              <input type="number" min="0" name="stock" required value={formData.stock} onChange={handleInputChange} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit (e.g., kg, pcs) *</label>
              <input type="text" name="unit" required value={formData.unit} onChange={handleInputChange} className="mt-1 input-field" placeholder="E.g. pcs or L" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Barcode</label>
              <input type="text" name="barcode" value={formData.barcode} onChange={handleInputChange} className="mt-1 input-field" placeholder="Scan or enter code" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tax (%)</label>
              <input type="number" step="0.01" min="0" name="tax" value={formData.tax} onChange={handleInputChange} className="mt-1 input-field" placeholder="E.g. 5" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Supplier</label>
              <input type="text" name="supplier" value={formData.supplier} onChange={handleInputChange} className="mt-1 input-field" placeholder="E.g. Local Farms Co." />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
             <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto min-w-[120px]">
               {submitting ? 'Saving...' : 'Save Product'}
             </button>
          </div>
        </form>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by product name or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    {searchTerm ? "No products matched your search." : "No products added yet. Click 'Add Product' to get started."}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{product.barcode || 'No barcode'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium whitespace-nowrap">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {product.stock} {product.unit || 'units'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium whitespace-nowrap">
                      {product.tax ? `${product.tax}%` : '0%'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.expiryDate ? (
                         <div className="flex items-center gap-1">
                           <Calendar className="w-4 h-4 text-gray-400"/>
                           {formatDate(product.expiryDate)}
                         </div>
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(product)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-md transition-colors mr-2">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
