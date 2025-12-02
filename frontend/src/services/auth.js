// src/services/auth.js
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectWallet } from './web3';

// Sign-In with Ethereum (SIWE)
export const signInWithEthereum = async (address, signature, message) => {
  try {
    const response = await api.post('/auth/verify', {
      address,
      signature,
      message,
    });

    const { token, user } = response.data;

    // Store token
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userAddress', address);

    return { token, user };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Get nonce for signing
export const getNonce = async (address) => {
  try {
    const response = await api.post('/auth/nonce', { address });
    return response.data.nonce;
  } catch (error) {
    console.error('Error getting nonce:', error);
    throw error;
  }
};

// Login with wallet
export const loginWithWallet = async () => {
  try {
    // Connect wallet
    const { address, signer } = await connectWallet();

    // Get nonce from backend
    const nonce = await getNonce(address);

    // Create message to sign
    const message = `Sign this message to authenticate with TicketBox.\n\nNonce: ${nonce}`;

    // Sign message
    const signature = await signer.signMessage(message);

    // Verify signature with backend
    const result = await signInWithEthereum(address, signature, message);

    return { ...result, address };
  } catch (error) {
    console.error('Error logging in with wallet:', error);
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userAddress');
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return null;

    const response = await api.get('/auth/me');
    return response.data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem('authToken');
  return !!token;
};

export default {
  signInWithEthereum,
  getNonce,
  loginWithWallet,
  logout,
  getCurrentUser,
  isAuthenticated,
};
