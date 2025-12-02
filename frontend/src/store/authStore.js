// src/store/authStore.js
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  walletAddress: null,
  isAuthenticated: false,
  isLoading: false,

  // Actions
  setUser: (user, walletAddress) => {
    set({ 
      user, 
      walletAddress: walletAddress?.toLowerCase(),
      isAuthenticated: true 
    });
    // Persist to AsyncStorage
    if (user && walletAddress) {
      AsyncStorage.setItem('user', JSON.stringify(user));
      AsyncStorage.setItem('walletAddress', walletAddress.toLowerCase());
    }
  },

  logout: async () => {
    set({ 
      user: null, 
      walletAddress: null, 
      isAuthenticated: false 
    });
    // Clear AsyncStorage
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('walletAddress');
  },

  setLoading: (isLoading) => set({ isLoading }),

  // Load user from AsyncStorage on app start
  loadUser: async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const walletAddress = await AsyncStorage.getItem('walletAddress');
      
      if (userStr && walletAddress) {
        const user = JSON.parse(userStr);
        set({ 
          user, 
          walletAddress,
          isAuthenticated: true 
        });
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
  },
}));
