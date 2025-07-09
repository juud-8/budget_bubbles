import React, { useState, useEffect } from 'react';
import { useCategories } from '../contexts/CategoryContext';
import BubbleCanvas from './BubbleCanvas';
import DashboardStats from './DashboardStats';
import QuickActions from './QuickActions';
import { AlertCircle, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { categories, loading, error, fetchCategories } = useCategories();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard`);
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, [categories]);

  const handleRefresh = () => {
    fetchCategories();
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your budget bubbles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-800">{error}</span>
          <button
            onClick={handleRefresh}
            className="ml-4 text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Budget Bubbles
        </h1>
        <p className="text-gray-600">
          Visualize your finances with interactive budget bubbles
        </p>
      </div>

      {/* Dashboard Stats */}
      {dashboardData && (
        <DashboardStats data={dashboardData} />
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Bubble Canvas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Your Budget Bubbles
          </h2>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No budget categories yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first budget category to start visualizing your finances
            </p>
            <button
              onClick={() => window.location.href = '/categories/new'}
              className="btn-primary"
            >
              Create First Category
            </button>
          </div>
        ) : (
          <BubbleCanvas categories={categories} />
        )}
      </div>

      {/* Recent Activity */}
      {categories.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Budget Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Budget:</span>
                    <span className="font-medium">${category.budget_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spent:</span>
                    <span className="font-medium">${category.total_spent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span className={`font-medium ${
                      category.remaining_budget >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${category.remaining_budget.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          category.percentage_used > 100 ? 'bg-red-500' : 
                          category.percentage_used > 80 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(category.percentage_used, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-center mt-1">
                      {category.percentage_used.toFixed(1)}% used
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;