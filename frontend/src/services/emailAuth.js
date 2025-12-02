// src/services/emailAuth.js
import api from './api';

/**
 * Register with email/password (mobile only)
 */
export const registerWithEmail = async (email, password, username) => {
  try {
    const response = await api.post('/auth/register', {
      email: email.toLowerCase(),
      password,
      username
    });

    return {
      user: response.data.user,
      message: response.data.message
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(error.response?.data?.error || 'Registration failed');
  }
};

/**
 * Login with email/password (mobile only)
 */
export const loginWithEmail = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email: email.toLowerCase(),
      password
    });

    return {
      user: response.data.user,
      message: response.data.message
    };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};
