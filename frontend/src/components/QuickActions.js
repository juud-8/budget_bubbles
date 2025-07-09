import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, CreditCard, Target, BarChart3 } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      title: 'Add Category',
      description: 'Create a new budget category',
      icon: Target,
      link: '/categories/new',
      color: 'bg-blue-600 hover:bg-blue-700',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Add Transaction',
      description: 'Record a new expense',
      icon: CreditCard,
      link: '/transactions/new',
      color: 'bg-green-600 hover:bg-green-700',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'View Transactions',
      description: 'See all your transactions',
      icon: BarChart3,
      link: '/transactions',
      color: 'bg-purple-600 hover:bg-purple-700',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="group block p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all hover:shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div className={`${action.iconBg} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                <action.icon className={`w-5 h-5 ${action.iconColor}`} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;