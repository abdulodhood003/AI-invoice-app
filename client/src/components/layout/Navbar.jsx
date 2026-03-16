import React from 'react';
import { Menu, Bell } from 'lucide-react';

/**
 * Top Navigation Bar primarily for mobile view and global actions (e.g. notifications)
 */
const Navbar = ({ onMenuClick }) => {
  return (
    <div className="md:hidden flex-shrink-0 flex h-16 bg-white border-b border-gray-200">
      {/* Mobile Menu Toggle */}
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex-1 flex justify-between px-4 sm:px-6">
        <div className="flex-1 flex items-center">
          <span className="text-xl font-bold text-gray-900">AI Invoicer</span>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          {/* Notifications Button */}
          <button
            type="button"
            className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
