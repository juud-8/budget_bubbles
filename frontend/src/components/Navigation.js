import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, CreditCard, List, Circle } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bubble className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Budget Bubbles</span>
          </Link>

          <div className="flex space-x-1">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <Link
              to="/categories/new"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/categories/new') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Category</span>
            </Link>

            <Link
              to="/transactions/new"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/transactions/new') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Add Transaction</span>
            </Link>

            <Link
              to="/transactions"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/transactions') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Transactions</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;