import axios from 'axios';
import { MOBILE_API_URL } from '../constants/config';

const api = axios.create({
  baseURL: MOBILE_API_URL,
  timeout: 30000,
});

export const checkoutApi = {
  /**
   * Create order and purchase tickets
   */
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/checkout/create-order', orderData);
      return response.data;
    } catch (error) {
      console.error('Create order error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * Get user's orders
   */
  getUserOrders: async (userId) => {
    try {
      const response = await api.get(`/checkout/orders/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get orders error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * Get single order details
   */
  getOrderDetails: async (orderId) => {
    try {
      const response = await api.get(`/checkout/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Get order error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * Get user's tickets
   */
  getUserTickets: async (userId, status = null) => {
    try {
      const url = status 
        ? `/checkout/tickets/${userId}?status=${status}`
        : `/checkout/tickets/${userId}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Get tickets error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * Cancel order
   */
  cancelOrder: async (orderId, userId) => {
    try {
      const response = await api.post('/checkout/cancel-order', {
        orderId,
        userId,
      });
      return response.data;
    } catch (error) {
      console.error('Cancel order error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};

export default checkoutApi;
