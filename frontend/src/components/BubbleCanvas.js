import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { useCategories } from '../contexts/CategoryContext';
import { Edit2, Trash2, Plus } from 'lucide-react';

const BubbleCanvas = ({ categories }) => {
  const [bubblePositions, setBubblePositions] = useState({});
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const canvasRef = useRef(null);
  const { deleteCategory } = useCategories();

  // Calculate bubble size based on budget amount
  const calculateBubbleSize = (budgetAmount) => {
    const minSize = 80;
    const maxSize = 200;
    const maxBudget = Math.max(...categories.map(cat => cat.budget_amount));
    const size = minSize + (budgetAmount / maxBudget) * (maxSize - minSize);
    return Math.max(minSize, Math.min(maxSize, size));
  };

  // Get bubble color based on category color and spending
  const getBubbleStyle = (category) => {
    const style = {
      background: category.color,
    };
    if (category.percentage_used > 100) {
      style.border = '3px solid #ff4d4f'; // Red border for overspent
    } else {
      style.border = 'none';
    }
    return style;
  };

  // Initialize bubble positions
  useEffect(() => {
    if (categories.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const canvasRect = canvas.getBoundingClientRect();
      const newPositions = {};

      categories.forEach((category, index) => {
        const angle = (index * 2 * Math.PI) / categories.length;
        const radius = Math.min(canvasRect.width, canvasRect.height) * 0.3;
        const centerX = canvasRect.width / 2;
        const centerY = canvasRect.height / 2;
        
        newPositions[category.id] = {
          x: centerX + Math.cos(angle) * radius - calculateBubbleSize(category.budget_amount) / 2,
          y: centerY + Math.sin(angle) * radius - calculateBubbleSize(category.budget_amount) / 2,
        };
      });

      setBubblePositions(newPositions);
    }
  }, [categories]);

  // Handle bubble click
  const handleBubbleClick = (category) => {
    setSelectedBubble(category);
    setShowEditModal(true);
  };

  // Handle bubble drag
  const handleBubbleDrag = (category, e, data) => {
    setBubblePositions(prev => ({
      ...prev,
      [category.id]: { x: data.x, y: data.y }
    }));
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete all associated transactions.')) {
      try {
        await deleteCategory(categoryId);
        setShowEditModal(false);
        setSelectedBubble(null);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  return (
    <div className="relative">
      <div 
        ref={canvasRef}
        className="bubble-container bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-200 relative overflow-hidden"
        style={{ height: '500px', minHeight: '400px' }}
      >
        {categories.map((category) => {
          const size = calculateBubbleSize(category.budget_amount);
          const position = bubblePositions[category.id] || { x: 0, y: 0 };
          return (
            <Draggable
              key={category.id}
              position={position}
              onDrag={(e, data) => handleBubbleDrag(category, e, data)}
              bounds="parent"
            >
              <div
                className="budget-bubble cursor-move"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  ...getBubbleStyle(category),
                }}
                onClick={() => handleBubbleClick(category)}
              >
                <div className="bubble-content">
                  <div className="bubble-name">{category.name}</div>
                  <div className="bubble-amount">
                    ${category.total_spent.toFixed(0)} / ${category.budget_amount.toFixed(0)}
                  </div>
                  <div className="bubble-percentage">
                    {category.percentage_used.toFixed(1)}%
                  </div>
                </div>
              </div>
            </Draggable>
          );
        })}

        {/* Empty state indicator */}
        {categories.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p>Your budget bubbles will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* Bubble Edit Modal */}
      {showEditModal && selectedBubble && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedBubble.name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Budget:</span>
                  <div className="font-medium">${selectedBubble.budget_amount.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Spent:</span>
                  <div className="font-medium">${selectedBubble.total_spent.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Remaining:</span>
                  <div className={`font-medium ${
                    selectedBubble.remaining_budget >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${selectedBubble.remaining_budget.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Used:</span>
                  <div className="font-medium">{selectedBubble.percentage_used.toFixed(1)}%</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => window.location.href = `/categories/${selectedBubble.id}/edit`}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteCategory(selectedBubble.id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                onClick={() => window.location.href = `/transactions/new?category=${selectedBubble.id}`}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Transaction</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BubbleCanvas;