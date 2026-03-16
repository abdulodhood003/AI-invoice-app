import { AlertTriangle, Clock, Users, Zap, Calendar, FileText, Activity } from 'lucide-react';

// Panel for Low Stock Products
export const LowStockPanel = ({ products }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={20} />
          Low Stock Warning
        </h3>
        <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{products.length} Products</span>
      </div>
      <div className="space-y-3">
        {products.length > 0 ? (
          products.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-red-100 transition-colors">
              <span className="text-sm font-medium text-gray-700">{p.name}</span>
              <span className="text-sm font-bold text-red-600">{p.stock} {p.unit || 'units'} left</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">All items are well stocked.</p>
        )}
      </div>
    </div>
  );
};

// Panel for Expiring Products
export const ExpiringProductsPanel = ({ products }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="text-orange-500" size={20} />
          Expiring Soon
        </h3>
        <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">Next 5 Days</span>
      </div>
      <div className="space-y-3">
        {products.length > 0 ? (
          products.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-orange-100 transition-colors">
              <span className="text-sm font-medium text-gray-700">{p.name}</span>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">Exp. in {p.daysLeft} days</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No products expiring soon.</p>
        )}
      </div>
    </div>
  );
};

// Panel for Top Customers
export const TopCustomersPanel = ({ customers }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <Users className="text-indigo-500" size={20} />
        Top Customers
      </h3>
      <div className="space-y-4">
        {customers.map((c, idx) => (
          <div key={c.id} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              idx === 0 ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'
            }`}>
              {c.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
              <p className="text-xs text-gray-500">{c.invoices} Invoices</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">₹{c.spent.toLocaleString()}</p>
              <p className="text-xs text-green-600 font-medium">Top Revenue</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// AI Insights Card - Redesigned for Clarity and Prominence
export const AIInsightsPanel = ({ insights, onRefresh, loading }) => {
  const icons = [
    <Activity className="text-blue-500" size={18} />,
    <Zap className="text-amber-500" size={18} />,
    <Users className="text-purple-500" size={18} />,
    <Clock className="text-rose-500" size={18} />
  ];

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
              <Zap className="text-white fill-white" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">AI Business Intelligence</h3>
              <p className="text-sm text-gray-500 font-medium">Smart recommendations for your supermarket</p>
            </div>
          </div>
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50 active:scale-95"
          >
            {loading ? <Zap size={16} className="animate-spin" /> : <Zap size={16} />}
            {loading ? 'Analyzing...' : 'Refresh Insights'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-gray-50 rounded-3xl animate-pulse border border-gray-100"></div>
            ))
          ) : (
            insights.map((insight, idx) => (
              <div key={idx} className="group p-5 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50 group-hover:scale-110 transition-transform">
                    {icons[idx % icons.length]}
                  </div>
                  <p className="text-sm font-semibold text-gray-700 leading-relaxed pt-1">
                    {insight}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Recent Invoices Table
export const RecentInvoicesTable = ({ invoices }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-50 text-green-700 border-green-100';
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'Overdue': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="text-blue-500" size={20} />
          Recent Invoices
        </h3>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-gray-900">{inv.invoiceNumber}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{inv.client}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-gray-900">₹{inv.amount.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(inv.status)}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{inv.date}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
