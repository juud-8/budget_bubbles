import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../contexts/CategoryContext';
import { Edit, Trash2, Plus, Eye, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

const CategoryList = () => {
  const navigate = useNavigate();
  const { categories, deleteCategory, loading } = useCategories();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleEdit = (categoryId) => {
    navigate(`/categories/${categoryId}/edit`);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete all associated transactions.')) {
      try {
        await deleteCategory(categoryId);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const getStatusColor = (percentageUsed) => {
    if (percentageUsed >= 90) return 'text-red-600 bg-red-50';
    if (percentageUsed >= 75) return 'text-yellow-600 bg-yellow-50';
    if (percentageUsed >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusIcon = (percentageUsed) => {
    if (percentageUsed >= 90) return <AlertTriangle className="w-4 h-4" />;
    if (percentageUsed >= 75) return <TrendingUp className="w-4 h-4" />;
    return <Eye className="w-4 h-4" />;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Categories</h1>
            <p className="text-gray-600 mt-1">Manage your budget categories and track spending</p>
          </div>
          <button
            onClick={() => navigate('/categories/new')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-600 mb-4">Create your first budget category to get started</p>
            <button
              onClick={() => navigate('/categories/new')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(category.id)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Budget:</span>
                    <span className="font-medium text-gray-900">
                      ${category.budget_amount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Spent:</span>
                    <span className="font-medium text-gray-900">
                      ${category.total_spent.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Remaining:</span>
                    <span className={`font-medium ${
                      category.remaining_budget < 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      ${category.remaining_budget.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Usage:</span>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(category.percentage_used)}`}>
                        {getStatusIcon(category.percentage_used)}
                        <span>{category.percentage_used.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          category.percentage_used >= 90 ? 'bg-red-500' :
                          category.percentage_used >= 75 ? 'bg-yellow-500' :
                          category.percentage_used >= 50 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(category.percentage_used, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {categories.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Categories:</span>
                <span className="block font-medium">{categories.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Budget:</span>
                <span className="block font-medium">
                  ${categories.reduce((sum, cat) => sum + cat.budget_amount, 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total Spent:</span>
                <span className="block font-medium">
                  ${categories.reduce((sum, cat) => sum + cat.total_spent, 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Average Usage:</span>
                <span className="block font-medium">
                  {(categories.reduce((sum, cat) => sum + cat.percentage_used, 0) / categories.length).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList; 