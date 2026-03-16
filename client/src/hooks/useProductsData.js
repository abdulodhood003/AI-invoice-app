import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook to manage fetching and mutating Products data
 */
export const useProductsData = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch immediately on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (productData) => {
    try {
      const res = await api.post('/products', productData);
      setProducts([res.data, ...products]);
      return { success: true, data: res.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create product';
      return { success: false, error: errorMsg };
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const res = await api.put(`/products/${id}`, productData);
      setProducts(products.map(p => p._id === id ? res.data : p));
      return { success: true, data: res.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update product';
      return { success: false, error: errorMsg };
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete product';
      return { success: false, error: errorMsg };
    }
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
