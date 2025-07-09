import React from 'react';
import { DollarSign, TrendingUp, Target, Activity } from 'lucide-react';

const DashboardStats = ({ data }) => {
  const stats = [
    {
      title: 'Total Budget',
      value: `$${data.total_budget.toFixed(2)}`,
      icon: Target,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Spent',
      value: `$${data.total_spent.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Remaining',
      value: `$${data.remaining_budget.toFixed(2)}`,
      icon: TrendingUp,
      color: data.remaining_budget >= 0 ? 'bg-green-500' : 'bg-red-500',
      bgColor: data.remaining_budget >= 0 ? 'bg-green-50' : 'bg-red-50',
      textColor: data.remaining_budget >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Categories',
      value: data.categories_count.toString(),
      icon: Activity,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-full`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
          
          {/* Progress bar for budget percentage */}
          {stat.title === 'Total Budget' && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Budget Used</span>
                <span>{data.percentage_used.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    data.percentage_used > 100 ? 'bg-red-500' : 
                    data.percentage_used > 80 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(data.percentage_used, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;