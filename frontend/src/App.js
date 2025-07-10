import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CategoryForm from './components/CategoryForm';
import CategoryList from './components/CategoryList';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import BasicAnalytics from './components/BasicAnalytics';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import CashFlow from './components/CashFlow';
import Expenses from './components/Expenses';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Navigation from './components/Navigation';
import { CategoryProvider } from './contexts/CategoryContext';
import './App.css';

function App() {
  return (
    <CategoryProvider>
      <Router>
        <div className="App min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/categories/new" element={<CategoryForm />} />
              <Route path="/categories/:id/edit" element={<CategoryForm />} />
              <Route path="/transactions/new" element={<TransactionForm />} />
              <Route path="/transactions/:id/edit" element={<TransactionForm />} />
              <Route path="/transactions" element={<TransactionList />} />
              <Route path="/analytics/basic" element={<BasicAnalytics />} />
              <Route path="/analytics/advanced" element={<AdvancedAnalytics />} />
              <Route path="/cashflow" element={<CashFlow />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CategoryProvider>
  );
}

export default App;