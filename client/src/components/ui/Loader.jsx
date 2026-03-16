import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable full-page or container-level spinner and loading screen
 */
const Loader = ({ fullScreen = false }) => {
  const containerStyle = fullScreen 
    ? "fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center backdrop-blur-sm"
    : "w-full py-12 flex flex-col items-center justify-center";

  return (
    <div className={containerStyle}>
      <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">
        Loading...
      </p>
    </div>
  );
};

export default Loader;
