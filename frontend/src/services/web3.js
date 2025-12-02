// src/services/web3.js
import { ethers } from 'ethers';
import { CONTRACTS } from '../constants/contracts';
import { CHAIN_CONFIG } from '../constants/config';

let provider = null;
let signer = null;

// Initialize provider
export const initProvider = () => {
  if (provider) return provider;

  const rpcUrl = process.env.EXPO_PUBLIC_RPC_URL || CHAIN_CONFIG.rpcUrl;
  provider = new ethers.JsonRpcProvider(rpcUrl);
  return provider;
};

// Get provider
export const getProvider = () => {
  if (!provider) {
    initProvider();
  }
  return provider;
};

// Connect wallet (for web)
export const connectWallet = async () => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Create provider and signer
    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    signer = await browserProvider.getSigner();
    const address = await signer.getAddress();

    return { address, signer };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

// Get signer (requires wallet connection)
export const getSigner = () => {
  if (!signer) {
    throw new Error('Wallet not connected. Call connectWallet() first.');
  }
  return signer;
};

// Get contract instance (read-only)
export const getContract = (contractName) => {
  const contractInfo = CONTRACTS[contractName];
  if (!contractInfo) {
    throw new Error(`Contract ${contractName} not found`);
  }

  const currentProvider = getProvider();
  return new ethers.Contract(
    contractInfo.address,
    contractInfo.abi,
    currentProvider
  );
};

// Get contract instance with signer (for write operations)
export const getContractWithSigner = (contractName) => {
  const contractInfo = CONTRACTS[contractName];
  if (!contractInfo) {
    throw new Error(`Contract ${contractName} not found`);
  }

  const currentSigner = getSigner();
  return new ethers.Contract(
    contractInfo.address,
    contractInfo.abi,
    currentSigner
  );
};

// Format ether value
export const formatEther = (value) => {
  return ethers.formatEther(value);
};

// Parse ether value
export const parseEther = (value) => {
  return ethers.parseEther(value.toString());
};

// Get balance
export const getBalance = async (address) => {
  const currentProvider = getProvider();
  const balance = await currentProvider.getBalance(address);
  return formatEther(balance);
};

// Wait for transaction
export const waitForTransaction = async (txHash) => {
  const currentProvider = getProvider();
  const receipt = await currentProvider.waitForTransaction(txHash);
  return receipt;
};

export default {
  initProvider,
  getProvider,
  connectWallet,
  getSigner,
  getContract,
  getContractWithSigner,
  formatEther,
  parseEther,
  getBalance,
  waitForTransaction,
};
