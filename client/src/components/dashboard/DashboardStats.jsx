import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({ title, value, icon, trend, isPositive, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50/50 border-blue-100',
    green: 'text-green-600 bg-green-50/50 border-green-100',
    red: 'text-red-600 bg-red-50/50 border-red-100',
    purple: 'text-purple-600 bg-purple-50/50 border-purple-100',
    orange: 'text-orange-600 bg-orange-50/50 border-orange-100',
    indigo: 'text-indigo-600 bg-indigo-50/50 border-indigo-100',
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-blue-50/50 transition-colors duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className={`p-4 rounded-2xl ${selectedColor.split(' ')[1]} ${selectedColor.split(' ')[0]} backdrop-blur-sm border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
            {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
          </div>
          {trend && (
            <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${isPositive === false ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {isPositive === false ? <ArrowDownRight size={14} className="mr-1" /> : <ArrowUpRight size={14} className="mr-1" />}
              {trend}
            </div>
          )}
        </div>
        <div className="mt-6">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">{title}</h3>
          <p className="mt-2 text-2xl font-black text-gray-900 tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
};
