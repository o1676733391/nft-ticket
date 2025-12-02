// src/services/walletAuth.js
import { ethers } from 'ethers';
import api from './api';

/**
 * Connect wallet and authenticate with backend
 * For Web: Uses MetaMask (window.ethereum)
 * For Mobile: Manual wallet address input (simplified for course project)
 */
export const connectWallet = async () => {
  try {
    // Check if running on web with MetaMask
    if (typeof window !== 'undefined' && window.ethereum) {
      return await connectMetaMask();
    } else {
      // For mobile or no MetaMask: return null, we'll handle manually
      throw new Error('MetaMask not available. Please use web browser with MetaMask extension.');
    }
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

/**
 * Connect MetaMask wallet (Web only)
 */
async function connectMetaMask() {
  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Create provider and signer (ethers v5 syntax)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    return { provider, signer, address };
  } catch (error) {
    console.error('MetaMask connection error:', error);
    throw new Error('Failed to connect MetaMask wallet');
  }
}

/**
 * Sign message with wallet (SIWE - Sign-In With Ethereum)
 */
export const signMessage = async (signer, address) => {
  try {
    const message = `Sign this message to authenticate with TicketBox.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;
    const signature = await signer.signMessage(message);
    
    return { message, signature };
  } catch (error) {
    console.error('Error signing message:', error);
    throw new Error('Failed to sign message');
  }
};

/**
 * Authenticate with backend using wallet signature
 */
export const authenticateWithBackend = async (message, signature, address) => {
  try {
    const response = await api.post('/auth/verify', {
      message,
      signature,
      address,
    });

    return response.data;
  } catch (error) {
    console.error('Backend authentication error:', error);
    throw new Error('Authentication failed with backend');
  }
};

/**
 * Complete wallet authentication flow
 */
export const loginWithWallet = async () => {
  try {
    // Step 1: Connect wallet
    const { signer, address } = await connectWallet();

    // Step 2: Sign authentication message
    const { message, signature } = await signMessage(signer, address);

    // Step 3: Verify with backend
    const authData = await authenticateWithBackend(message, signature, address);

    return {
      user: authData.user,
      address,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Manual wallet address authentication (for testing/mobile)
 * Simplified version - just creates/gets user by address without signature
 */
export const loginWithAddress = async (address) => {
  try {
    // Validate address format
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      throw new Error('Invalid wallet address format');
    }

    // For demo purposes, create a mock signature
    const mockMessage = `Demo login for ${address}`;
    const mockSignature = '0x' + '0'.repeat(130); // Mock signature
    
    try {
      const response = await api.post('/auth/verify', {
        message: mockMessage,
        signature: mockSignature,
        address,
      });

      return {
        user: response.data.user,
        address,
      };
    } catch (apiError) {
      // If API fails, use demo mode (for testing without backend)
      console.warn('API authentication failed, using demo mode:', apiError.message);
      return {
        user: {
          id: address,
          name: `User ${address.slice(0, 6)}`,
          walletAddress: address,
        },
        address,
      };
    }
  } catch (error) {
    console.error('Address login error:', error);
    throw error;
  }
};
