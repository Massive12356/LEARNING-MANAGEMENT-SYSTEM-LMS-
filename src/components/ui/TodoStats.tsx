import React from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  PlayIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

interface TodoStatsProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    overdue: number;
    dueToday: number;
    completionRate: number;
  };
  className?: string;
}

export const TodoStats: React.FC<TodoStatsProps> = ({ stats, className = '' }) => {
  const statCards = [
    {
      title: 'Total',
      value: stats.total,
      icon: ListBulletIcon,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircleIcon,
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: PlayIcon,
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: ClockIcon,
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    },
    {
      title: 'Due Today',
      value: stats.dueToday,
      icon: ClockIcon,
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate max-w-full">
          Todo Overview
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.completionRate}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Completion Rate
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-green-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};