import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bookmark, LayoutDashboard, Code2 } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl text-gray-900 tracking-tight">CF Explorer</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <NavLink 
              to="/" 
              className={({isActive}) => `flex items-center gap-1.5 text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Home className="h-4 w-4" />
              <span>Explorer</span>
            </NavLink>
            <NavLink 
              to="/bookmarks" 
              className={({isActive}) => `flex items-center gap-1.5 text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Bookmark className="h-4 w-4" />
              <span>Bookmarks</span>
            </NavLink>
            <NavLink 
              to="/dashboard" 
              className={({isActive}) => `flex items-center gap-1.5 text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
