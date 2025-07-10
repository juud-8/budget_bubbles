import React from 'react';
import { useCategories } from '../contexts/CategoryContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

// Helper to generate dummy monthly trend data
function getMonthlyTrend(categories) {
  // For demo, just sum total spent per month for the last 6 months
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d.toLocaleString('default', { month: 'short', year: '2-digit' });
  });
  // Dummy: spread total spent randomly
  const totalSpent = categories.reduce((sum, cat) => sum + cat.total_spent, 0);
  return months.map((m, i) => ({
    month: m,
    spent: Math.round((totalSpent / 6) * (0.8 + 0.4 * Math.random())),
  }));
}

const AdvancedAnalytics = () => {
  const { categories } = useCategories();
  const overspent = categories.filter(cat => cat.percentage_used > 100);
  const topOverspent = overspent.sort((a, b) => b.percentage_used - a.percentage_used).slice(0, 3);

  // Bar chart data: spending by category
  const barData = categories.map(cat => ({
    name: cat.name,
    spent: cat.total_spent,
    budget: cat.budget_amount,
  }));

  // Line chart data: monthly trend (dummy)
  const trendData = getMonthlyTrend(categories);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-6">
      <h1 className="text-2xl font-bold mb-4">Advanced Analytics</h1>
      {/* Top Overspent Categories */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Top Overspent Categories</h2>
        {topOverspent.length === 0 ? (
          <div className="text-gray-500">No overspent categories 🎉</div>
        ) : (
          <ul className="space-y-2">
            {topOverspent.map(cat => (
              <li key={cat.id} className="flex justify-between items-center bg-red-50 rounded-lg p-3">
                <span className="font-medium text-red-700">{cat.name}</span>
                <span className="text-red-600 font-bold">{cat.percentage_used.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Monthly Spending Trend */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Monthly Spending Trend</h2>
        <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="spent" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spending by Category */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Spending by Category</h2>
        <div className="w-full h-72 bg-gray-50 rounded-lg flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="spent" fill="#3B82F6" name="Spent" />
              <Bar dataKey="budget" fill="#F59E0B" name="Budget" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* More Analytics Coming Soon */}
      <div>
        <h2 className="text-lg font-semibold mb-2">More Analytics Coming Soon</h2>
        <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
          [Future Charts Placeholder]
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics; 