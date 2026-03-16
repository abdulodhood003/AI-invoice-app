import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, PlusCircle, LogOut, X, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Main application Sidebar navigation.
 * Handles both desktop (always visible) and mobile (collapsible) views.
 */
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Products', path: '/products', icon: ShoppingCart },
    { label: 'Clients', path: '/clients', icon: Users },
    { label: 'Invoices', path: '/invoices', icon: FileText },
    { label: 'Create Invoice', path: '/invoices/new', icon: PlusCircle },
  ];

  // Mobile off-canvas menu overlay classes
  const mobileContainerClasses = isOpen 
    ? 'fixed inset-0 flex z-40 md:hidden' 
    : 'hidden md:hidden';

  const NavigationLinks = () => (
    <nav className="mt-8 flex-1 px-2 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        // Check if the current route starts with the item's path to mark it active
        const isActive = location.pathname.startsWith(item.path);
        
        return (
          <Link
            key={item.label}
            to={item.path}
            onClick={onClose} // Auto-close on mobile after clicking
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon
              className={`mr-3 flex-shrink-0 h-5 w-5 ${
                isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* --- Mobile Sidebar Overlay --- */}
      <div className={mobileContainerClasses} role="dialog" aria-modal="true">
        {/* Background Overlay */}
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true" />
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white pt-5 pb-4">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={onClose}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex-shrink-0 flex items-center px-4">
            <div className="h-8 w-8 rounded bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">AI Invoicer</span>
          </div>
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <NavigationLinks />
          </div>
          {/* User Profile Mobile */}
           <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button onClick={logout} className="flex-shrink-0 group block text-left w-full hover:bg-gray-50 rounded-md p-2">
              <div className="flex items-center">
                <div>
                  <div className="inline-block h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="ml-3 text-sm font-medium text-gray-700">Logout</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* --- Desktop Static Sidebar --- */}
      <div className="hidden md:flex md:flex-shrink-0 h-full">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-full border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="h-8 w-8 rounded bg-primary-600 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xl uppercase">{user?.name?.charAt(0) || 'A'}</span>
                </div>
                <span className="ml-3 text-xl font-extrabold tracking-tight text-gray-900">AI Invoicer</span>
              </div>
              <NavigationLinks />
            </div>
            {/* User Profile Desktop */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button onClick={logout} className="flex-shrink-0 w-full group block text-left transition-colors hover:bg-red-50 p-2 rounded-md">
                <div className="flex items-center">
                  <div>
                    <div className="inline-block h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold uppercase">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-red-900">
                      {user?.name || 'User Settings'}
                    </p>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-red-700 flex items-center mt-1">
                      <LogOut className="h-3 w-3 mr-1" /> Logout
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
