import React, { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook to encapsulate fetching the complex Dashboard data.
 */
export const useDashboardData = () => {
  const [data, setData] = useState({
    revenue: { 
      thisMonth: 0, 
      lastMonth: 0, 
      grandTotalRevenue: 0,
      grandTotalPaid: 0,
      grandTotalUnpaid: 0,
      growthPercentage: 0,
      trend: []
    },
    topClient: null,
    mostCommonDay: null,
    topProducts: [],
    invoiceStatusData: [],
    inventoryDistData: [],
    topCustomers: [],
    lowStockProducts: [],
    expiringProducts: [],
    recentInvoices: [],
    todaysInvoicesCount: 0,
    inventorySummary: {
      totalQuantity: 0,
      totalValue: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await api.get('/insights');
        setData(res.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard insights');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return { data, loading, error };
};
