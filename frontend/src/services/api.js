// src/services/api.js
import axios from 'axios';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 to reach host machine's localhost
const getBaseURL = () => {
  const envURL = process.env.EXPO_PUBLIC_API_URL;
  if (envURL) {
    // If running on Android emulator, replace localhost with 10.0.2.2
    if (Platform.OS === 'android' && envURL.includes('localhost')) {
      return envURL.replace('localhost', '10.0.2.2');
    }
    return envURL;
  }
  // Default fallback
  return Platform.OS === 'android' 
    ? 'http://10.0.2.2:3001/api'
    : 'http://localhost:3001/api';
};

const API_URL = getBaseURL();
console.log('API Base URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Can add headers if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

export default api;
