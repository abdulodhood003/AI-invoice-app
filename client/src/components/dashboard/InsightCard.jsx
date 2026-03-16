import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * A stylized card for highlighting AI-driven insights
 */
const InsightCard = ({ title, content, actionText, onAction }) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-600 to-primary-900 p-6 text-white shadow-xl">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl filter"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-primary-100 font-medium tracking-wide text-sm mb-3">
          <Sparkles className="w-4 h-4" />
          <span>AI INSIGHT</span>
        </div>
        
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-primary-50 text-sm leading-relaxed mb-6 max-w-sm">
          {content}
        </p>
        
        {actionText && (
          <button 
            type="button"
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default InsightCard;
