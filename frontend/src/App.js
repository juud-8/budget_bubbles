import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CategoryForm from './components/CategoryForm';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Navigation from './components/Navigation';
import { CategoryProvider } from './contexts/CategoryContext';
import './App.css';

function App() {
  return (
    <CategoryProvider>
      <Router>
        <div className="App min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/categories/new" element={<CategoryForm />} />
              <Route path="/categories/:id/edit" element={<CategoryForm />} />
              <Route path="/transactions/new" element={<TransactionForm />} />
              <Route path="/transactions/:id/edit" element={<TransactionForm />} />
              <Route path="/transactions" element={<TransactionList />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CategoryProvider>
  );
}

export default App;