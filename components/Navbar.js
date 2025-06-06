'use client'
// components/Navbar.js
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/context/Auth'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold gradient-text">BlogSpace</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-violet-600 transition-colors font-medium">
              Home
            </Link>
            <Link href="/blogs" className="text-gray-700 hover:text-violet-600 transition-colors font-medium">
              Blogs
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-violet-600 transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-violet-600 transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-violet-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-violet-600 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-violet-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            <Link href="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              Home
            </Link>
            <Link href="/blogs" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              Blogs
            </Link>
            <Link href="/about" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              About
            </Link>
            <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              Contact
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Login
                </Link>
                <Link href="/register" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}