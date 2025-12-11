import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as mobileApi from '../services/mobileApi';

const AuthContext = createContext({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Only check mobile auth for mobile platforms
      if (Platform.OS !== 'web') {
        const storedUser = await mobileApi.getCurrentUser();
        const token = await mobileApi.getAuthToken();
        
        if (storedUser && token) {
          // Use stored user directly, don't verify with API on startup
          // This prevents app from hanging if backend is down
          setUser(storedUser);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login with email/password (mobile)
  const login = async (email, password) => {
    try {
      const result = await mobileApi.login(email, password);
      setUser(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  // Register with email/password (mobile)
  // Accepts object: { email, password, username, fullName, isOrganizer, organizationName, organizationDescription }
  const register = async (params) => {
    try {
      const result = await mobileApi.register(params);
      setUser(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Register error:', error);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  // Logout
  const logout = async () => {
    try {
      await mobileApi.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading,
        isAuthenticated: !!user,
        isOrganizer: user?.acc_type === 'organizer' || user?.accType === 'organizer',
        login, 
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
