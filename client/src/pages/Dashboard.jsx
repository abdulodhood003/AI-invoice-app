import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Activity, 
  Users, 
  Package, 
  Calendar,
  Layers,
  AlertCircle
} from 'lucide-react';
import { StatCard } from '../components/dashboard/DashboardStats';
import { 
  RevenueLineChart, 
  ProductBarChart, 
  InvoicePieChart, 
  InventoryDonutChart 
} from '../components/dashboard/DashboardCharts';
import { 
  LowStockPanel, 
  ExpiringProductsPanel, 
  TopCustomersPanel, 
  AIInsightsPanel,
  RecentInvoicesTable
} from '../components/dashboard/DashboardPanels';
import Loader from '../components/ui/Loader';
import { useDashboardData } from '../hooks/useDashboardData';
import api from '../services/api';

const Dashboard = () => {
  const { data, loading, error } = useDashboardData();
  const [aiInsights, setAiInsights] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Formatting helpers - defined early
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);

  const fetchAIInsights = async () => {
    if (!data || !data.revenue) return;
    try {
      setAiLoading(true);
      const res = await api.post('/ai/business-insights', { dashboardData: data });
      if (res.data && res.data.insights) {
        setAiInsights(res.data.insights);
      }
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
      // Fallback to basic insights if AI fails
      setAiInsights([
        `Revenue is at ${formatCurrency(data?.revenue?.thisMonth)} this month.`,
        data?.lowStockProducts?.length > 0 ? `${data.lowStockProducts.length} items are low on stock.` : "Inventory is healthy.",
        "Generate a new report for detailed AI analysis."
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && data) {
      fetchAIInsights();
    }
  }, [loading, data]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader /></div>;

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6 rounded-r-xl">
        <div className="flex items-center">
          <AlertCircle className="text-red-400 mr-3" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Business Analytics</h1>
          <p className="text-gray-500 mt-1 font-medium">Real-time data from your supermarket inventory and sales.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(data.revenue.grandTotalRevenue)} 
          icon={<DollarSign />} 
          trend={`+${data.revenue.growthPercentage}%`}
          color="blue"
        />
        <StatCard 
          title="Total Paid" 
          value={formatCurrency(data.revenue.grandTotalPaid)} 
          icon={<CreditCard />} 
          color="green"
        />
        <StatCard 
          title="Pending" 
          value={formatCurrency(data.revenue.grandTotalUnpaid)} 
          icon={<Activity />} 
          color="red"
        />
        <StatCard 
          title="Top Client" 
          value={data.topClient ? data.topClient.name.split(' ')[0] : "N/A"} 
          icon={<Users />} 
          color="purple"
        />
        <StatCard 
          title="Invoices Today" 
          value={data.todaysInvoicesCount || 0} 
          icon={<Layers />} 
          color="indigo"
        />
        <StatCard 
          title="Active Day" 
          value={data.mostCommonDay ? data.mostCommonDay.day : "N/A"} 
          icon={<Calendar />} 
          color="orange"
        />
      </div>

      {/* Smart Analysis Section - Prominent & Full Width */}
      <div className="space-y-4">
        <AIInsightsPanel 
          insights={aiInsights} 
          onRefresh={fetchAIInsights}
          loading={aiLoading}
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Left Column: Revenue & Sales Performance (8 Columns) */}
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-4">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Financial Performance</h4>
            <RevenueLineChart data={data.revenue.trend} />
          </section>
          
          <section className="space-y-4">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Product & Invoice Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ProductBarChart data={data.topProducts} />
              <InvoicePieChart data={data.invoiceStatusData} />
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Recent Transactions</h4>
            <RecentInvoicesTable invoices={data.recentInvoices} />
          </section>
        </div>

        {/* Right Column: Inventory & Customers (4 Columns) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Inventory Strategy Group */}
          <section className="space-y-6">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Inventory Intelligence</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all group">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Total Stock</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{data.inventorySummary.totalQuantity}</p>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">Available Inventory</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all group">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">Stock Value</p>
                  <p className="text-3xl font-black text-indigo-600 mt-1">{formatCurrency(data.inventorySummary.totalValue).replace('.00', '')}</p>
                  <p className="text-[10px] text-indigo-400 mt-2 font-medium">Estimated Asset</p>
              </div>
            </div>

            <InventoryDonutChart data={data.inventoryDistData} />
            
            <div className="space-y-6">
              <LowStockPanel products={data.lowStockProducts} />
              <ExpiringProductsPanel products={data.expiringProducts} />
            </div>
          </section>
          
          {/* Customer Insights Group */}
          <section className="space-y-6">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Market Leadership</h4>
            <TopCustomersPanel customers={data.topCustomers} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
