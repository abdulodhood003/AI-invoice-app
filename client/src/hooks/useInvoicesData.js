import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const useInvoicesData = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices');
      setInvoices(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getInvoiceById = async (id) => {
    try {
      const res = await api.get(`/invoices/${id}`);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch invoice details' };
    }
  };

  const createInvoice = async (invoiceData) => {
    try {
      const res = await api.post('/invoices', invoiceData);
      setInvoices((prev) => [res.data, ...prev]);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to create invoice' };
    }
  };

  const deleteInvoice = async (id) => {
    try {
      await api.delete(`/invoices/${id}`);
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete invoice' };
    }
  };

  const updateInvoiceStatus = async (id, status) => {
    try {
      const res = await api.put(`/invoices/${id}`, { status });
      setInvoices((prev) => prev.map((inv) => (inv._id === id ? res.data : inv)));
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update invoice status' };
    }
  };

  const updateInvoice = async (id, invoiceData) => {
    try {
      const res = await api.put(`/invoices/${id}`, invoiceData);
      setInvoices((prev) => prev.map((inv) => (inv._id === id ? res.data : inv)));
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update invoice' };
    }
  };

  return { 
    invoices, 
    loading, 
    error, 
    refresh: fetchInvoices, 
    getInvoiceById,
    createInvoice, 
    deleteInvoice,
    updateInvoiceStatus,
    updateInvoice
  };
};
