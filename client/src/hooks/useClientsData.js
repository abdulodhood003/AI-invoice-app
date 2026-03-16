import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const useClientsData = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clients');
      setClients(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const addClient = async (clientData) => {
    try {
      const res = await api.post('/clients', clientData);
      setClients((prev) => [...prev, res.data]);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to add client' };
    }
  };

  const deleteClient = async (id) => {
    try {
      await api.delete(`/clients/${id}`);
      setClients((prev) => prev.filter((c) => c._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete client' };
    }
  };

  const updateClient = async (id, clientData) => {
    try {
      const res = await api.put(`/clients/${id}`, clientData);
      setClients((prev) => prev.map((c) => (c._id === id ? res.data : c)));
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update client' };
    }
  };

  return { clients, loading, error, refresh: fetchClients, addClient, deleteClient, updateClient };
};
