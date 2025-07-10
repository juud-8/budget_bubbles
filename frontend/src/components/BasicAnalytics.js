import React from 'react';
import { useCategories } from '../contexts/CategoryContext';

const BasicAnalytics = () => {
  const { categories } = useCategories();
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget_amount, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.total_spent, 0);
  const avgUsage = categories.length > 0 ? (categories.reduce((sum, cat) => sum + cat.percentage_used, 0) / categories.length) : 0;

  // Dummy pie chart (replace with real chart lib if desired)
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-6">
      <h1 className="text-2xl font-bold mb-4">Basic Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-500">Total Budget</div>
          <div className="text-2xl font-bold text-blue-700">${totalBudget.toFixed(2)}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-500">Total Spent</div>
          <div className="text-2xl font-bold text-green-700">${totalSpent.toFixed(2)}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-500">Average Usage</div>
          <div className="text-2xl font-bold text-yellow-700">{avgUsage.toFixed(1)}%</div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-2">
          <span className="text-gray-400">[Pie Chart]</span>
        </div>
        <div className="text-gray-500 text-sm">Pie chart of category spending (coming soon)</div>
      </div>
    </div>
  );
};

export default BasicAnalytics; 