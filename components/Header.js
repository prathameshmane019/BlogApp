
// File: components/Header.js (Updated if needed)
'use client';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useAuth } from '@/app/context/Auth';

export default function Header({ setSidebarOpen }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">Welcome, {user?.name || user?.email}</span>
          <button
            onClick={logout}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}