import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CategoryContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Fetch categories with spending data
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/categories`);
      setCategories(response.data);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions
  const fetchTransactions = async (categoryId = null) => {
    setLoading(true);
    setError(null);
    try {
      const url = categoryId 
        ? `${API_BASE_URL}/api/transactions?category_id=${categoryId}`
        : `${API_BASE_URL}/api/transactions`;
      const response = await axios.get(url);
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const createCategory = async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/categories`, categoryData);
      await fetchCategories(); // Refresh categories
      return response.data;
    } catch (err) {
      setError('Failed to create category');
      console.error('Error creating category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async (id, categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/categories/${id}`, categoryData);
      await fetchCategories(); // Refresh categories
      return response.data;
    } catch (err) {
      setError('Failed to update category');
      console.error('Error updating category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/categories/${id}`);
      await fetchCategories(); // Refresh categories
    } catch (err) {
      setError('Failed to delete category');
      console.error('Error deleting category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create transaction
  const createTransaction = async (transactionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/transactions`, transactionData);
      await fetchCategories(); // Refresh categories to update spending
      await fetchTransactions(); // Refresh transactions
      return response.data;
    } catch (err) {
      setError('Failed to create transaction');
      console.error('Error creating transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update transaction
  const updateTransaction = async (id, transactionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/transactions/${id}`, transactionData);
      await fetchCategories(); // Refresh categories to update spending
      await fetchTransactions(); // Refresh transactions
      return response.data;
    } catch (err) {
      setError('Failed to update transaction');
      console.error('Error updating transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/transactions/${id}`);
      await fetchCategories(); // Refresh categories to update spending
      await fetchTransactions(); // Refresh transactions
    } catch (err) {
      setError('Failed to delete transaction');
      console.error('Error deleting transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get dashboard data
  const getDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard`);
      return response.data;
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get category by ID
  const getCategoryById = (id) => {
    return categories.find(cat => cat.id === id);
  };

  // Helper function to get transactions by category
  const getTransactionsByCategory = (categoryId) => {
    return transactions.filter(transaction => transaction.category_id === categoryId);
  };

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  const contextValue = {
    categories,
    transactions,
    loading,
    error,
    fetchCategories,
    fetchTransactions,
    createCategory,
    updateCategory,
    deleteCategory,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getDashboardData,
    getCategoryById,
    getTransactionsByCategory,
    setError // Allow components to clear errors
  };

  return (
    <CategoryContext.Provider value={contextValue}>
      {children}
    </CategoryContext.Provider>
  );
};