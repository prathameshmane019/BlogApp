'use client';
import { useContext, useState, useEffect } from 'react';
import { createContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '../services/blogApi';

// Configure axios base URL
const getAPIBaseURL = () => {
  // For production (deployed frontend)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://blog-backend-five-mu.vercel.app';
  }
  
  // For development (local frontend)
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

const API_BASE_URL = getAPIBaseURL();

axios.defaults.baseURL = API_BASE_URL;

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setUser(response.data.user); // Adjust based on verify response
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password }); // Updated to /api/auth/login
      console.log('Login response:', response.data);

      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data; // Destructure from response.data.data
        localStorage.setItem('token', token);
        console.log('Token saved to localStorage:', localStorage.getItem('token')); // Debug
        setUser(user);
        return { success: true };
      } else {
        console.error('Login response missing data:', response.data);
        return { success: false, error: response.data.message || 'Invalid response from server' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      console.error('Login error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      console.log('Register response:', response.data);
      if (response.status === 201) {
        return { success: true, message: 'Registration successful' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      console.error('Register error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}