import React from 'react';

/**
 * A reusable Dashboard KPI Card
 * @param {string} title - The metric title
 * @param {string|number} value - The main metric value
 * @param {React.ReactNode} icon - Optional icon
 * @param {string} trend - Optional trend text (e.g., "+12% from last month")
 * @param {boolean} isPositive - Whether the trend is positive (green) or negative (red)
 */
const DashboardCard = ({ title, value, icon, trend, isPositive = true, onClick }) => {
  return (
    <div 
      className={`card relative p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-primary-400' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        {icon && (
          <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
            {icon}
          </div>
        )}
      </div>
      
      <dd className="mt-4 flex items-baseline pb-1 sm:pb-2">
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
        
        {trend && (
          <p
            className={`ml-2 flex items-baseline text-sm font-semibold ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend}
          </p>
        )}
      </dd>
    </div>
  );
};

export default DashboardCard;
