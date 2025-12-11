// src/services/mobileApi.js
// Mobile API service - No blockchain, traditional database
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL configuration
const getBaseURL = () => {
  const envURL = process.env.EXPO_PUBLIC_API_URL;
  
  // Base API URL (without /mobile)
  let baseUrl;
  if (envURL) {
    baseUrl = envURL;
    if (Platform.OS === 'android' && envURL.includes('localhost')) {
      baseUrl = envURL.replace('localhost', '10.0.2.2');
    }
  } else {
    baseUrl = Platform.OS === 'android'
      ? 'http://10.0.2.2:3001/api'
      : 'http://localhost:3001/api';
  }
  
  // Always append /mobile for mobile API
  return baseUrl.endsWith('/mobile') ? baseUrl : `${baseUrl}/mobile`;
};

const API_URL = getBaseURL();
console.log('Mobile API URL:', API_URL);

// Create axios instance for mobile API
const mobileApi = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage keys
const TOKEN_KEY = 'mobile_auth_token';
const USER_KEY = 'mobile_user';

// Request interceptor - Add auth token
mobileApi.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
mobileApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    }
    console.error('Mobile API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// =============================================
// AUTH FUNCTIONS
// =============================================

export const register = async ({ 
  email, 
  password, 
  username, 
  fullName = null,
  isOrganizer = false,
  organizationName = null,
  organizationDescription = null,
}) => {
  try {
    const response = await mobileApi.post('/auth/register', {
      email,
      password,
      username,
      fullName,
      isOrganizer,
      organizationName,
      organizationDescription,
    });

    const { token, user } = response.data;

    // Only store if we have valid data
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
    if (user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return response.data;
  } catch (error) {
    console.error('Register API error:', error.response?.data || error.message);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await mobileApi.post('/auth/login', { email, password });

    const { token, user } = response.data;

    // Only store if we have valid data
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
    if (user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return response.data;
  } catch (error) {
    console.error('Login API error:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
};

export const getCurrentUser = async () => {
  const userJson = await AsyncStorage.getItem(USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

export const getAuthToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return !!token;
};

export const getProfile = async () => {
  const response = await mobileApi.get('/auth/me');
  return response.data.user;
};

export const updateProfile = async (data) => {
  const response = await mobileApi.put('/auth/profile', data);

  // Update stored user
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

  return response.data;
};

// =============================================
// EVENTS FUNCTIONS
// =============================================

export const getEvents = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.category) params.append('category', filters.category);
  if (filters.location) params.append('location', filters.location);
  if (filters.search) params.append('search', filters.search);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.freeOnly) params.append('freeOnly', 'true');
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const url = `/events?${params.toString()}`;
  
  const response = await mobileApi.get(url);
  // console.log('getEvents: Success, count:', response.data.events?.length || 0);
  
  return response.data;
};

export const getEventById = async (eventId) => {
  const response = await mobileApi.get(`/events/${eventId}`);
  return response.data;
};

export const getFeaturedEvents = async () => {
  const response = await mobileApi.get('/featured');
  return response.data;
};

// =============================================
// ORDERS FUNCTIONS
// =============================================

export const createOrder = async (eventId, templateId, quantity = 1, paymentMethod = 'card') => {
  const response = await mobileApi.post('/orders', {
    eventId,
    templateId,
    quantity,
    paymentMethod,
  });
  return response.data;
};

export const getOrders = async () => {
  const response = await mobileApi.get('/orders');
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await mobileApi.get(`/orders/${orderId}`);
  return response.data;
};

// =============================================
// TICKETS FUNCTIONS
// =============================================

export const getMyTickets = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.upcoming) params.append('upcoming', 'true');

  const response = await mobileApi.get(`/tickets?${params.toString()}`);
  return response.data;
};

export const getTicketById = async (ticketId) => {
  const response = await mobileApi.get(`/tickets/${ticketId}`);
  return response.data;
};

// =============================================
// CHECK-IN FUNCTIONS
// =============================================

export const checkInTicket = async (ticketCode, deviceInfo = null) => {
  const response = await mobileApi.post('/checkin', {
    ticketCode,
    deviceInfo,
  });
  return response.data;
};

export const checkInByQR = async (qrData, deviceInfo = null) => {
  const response = await mobileApi.post('/checkin', {
    qrData,
    deviceInfo,
  });
  return response.data;
};

// =============================================
// ORGANIZER FUNCTIONS
// =============================================

// Get organizer by ID
export const getOrganizerById = async (organizerId) => {
  const response = await mobileApi.get(`/organizers/${organizerId}`);
  return response.data;
};

// Get organizer dashboard data (stats + recent events)
export const getOrganizerDashboard = async () => {
  const response = await mobileApi.get('/organizer/dashboard');
  return response.data;
};

// Get organizer's events
export const getOrganizerEvents = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const url = `/organizer/events${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await mobileApi.get(url);
  return response.data;
};

// Create new event
export const createEvent = async (eventData) => {
  const response = await mobileApi.post('/organizer/events', eventData);
  return response.data;
};

// Update event
export const updateEvent = async (eventId, updates) => {
  const response = await mobileApi.put(`/organizer/events/${eventId}`, updates);
  return response.data;
};

// Publish event
export const publishEvent = async (eventId) => {
  const response = await mobileApi.put(`/organizer/events/${eventId}/publish`);
  return response.data;
};

// Get tickets for an event (organizer view)
export const getEventTickets = async (eventId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const url = `/organizer/events/${eventId}/tickets${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await mobileApi.get(url);
  return response.data;
};

// Get event stats (organizer view)
export const getEventStats = async (eventId) => {
  const response = await mobileApi.get(`/organizer/events/${eventId}/stats`);
  return response.data;
};

// =============================================
// FAVORITES FUNCTIONS (if implemented)
// =============================================

export const addFavorite = async (eventId) => {
  const response = await mobileApi.post('/favorites', { eventId });
  return response.data;
};

export const removeFavorite = async (eventId) => {
  const response = await mobileApi.delete(`/favorites/${eventId}`);
  return response.data;
};

export const getFavorites = async () => {
  const response = await mobileApi.get('/favorites');
  return response.data;
};

// =============================================
// IMAGE UPLOAD
// =============================================

// Upload image to Supabase Storage via backend
export const uploadImage = async (localUri, folder = 'events') => {
  try {
    // Create form data
    const formData = new FormData();
    
    // Get filename from URI
    const filename = localUri.split('/').pop();
    
    // Infer the type of the image
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    // Append file to form data
    formData.append('file', {
      uri: localUri,
      name: filename,
      type,
    });
    formData.append('folder', folder);
    
    console.log('Uploading image:', { filename, type, folder });
    
    const response = await mobileApi.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for upload
    });
    
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Upload image error:', error);
    throw error;
  }
};

// Upload multiple images
export const uploadImages = async (localUris, folder = 'events') => {
  const results = [];
  for (const uri of localUris) {
    if (uri && uri.startsWith('file://')) {
      const result = await uploadImage(uri, folder);
      results.push(result);
    } else {
      results.push({ url: uri }); // Already a URL
    }
  }
  return results;
};

// Export the api instance for custom requests
export default mobileApi;
