// src/services/marketplace.js
import api from './api';
import { getContractWithSigner, getContract, parseEther, formatEther } from './web3';

// Get all marketplace listings
export const getListings = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/marketplace/listings?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};

// Get listing by ID
export const getListingById = async (listingId) => {
  try {
    const response = await api.get(`/marketplace/listings/${listingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }
};

// List ticket on marketplace
export const listTicket = async (tokenId, price) => {
  try {
    const ticketContract = getContractWithSigner('TicketNFT');
    const marketplaceContract = getContractWithSigner('Marketplace');

    // Approve marketplace to transfer NFT
    const approveTx = await ticketContract.approve(marketplaceContract.target, tokenId);
    await approveTx.wait();

    // List on marketplace
    const priceInWei = parseEther(price.toString());
    const listTx = await marketplaceContract.listTicket(tokenId, priceInWei);
    const receipt = await listTx.wait();

    // Get listing ID from event
    const listEvent = receipt.logs.find(log => log.fragment?.name === 'TicketListed');
    const listingId = listEvent?.args?.listingId;

    return {
      success: true,
      listingId: listingId?.toString(),
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error('Error listing ticket:', error);
    throw error;
  }
};

// Buy ticket from marketplace
export const buyTicket = async (listingId) => {
  try {
    const marketplaceContract = getContractWithSigner('Marketplace');
    const tokenContract = getContractWithSigner('SystemToken');

    // Get listing details
    const listing = await marketplaceContract.listings(listingId);
    const price = listing.price;

    // Approve token spending
    const approveTx = await tokenContract.approve(marketplaceContract.target, price);
    await approveTx.wait();

    // Buy ticket
    const buyTx = await marketplaceContract.buyTicket(listingId);
    const receipt = await buyTx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error('Error buying ticket:', error);
    throw error;
  }
};

// Cancel listing
export const cancelListing = async (listingId) => {
  try {
    const marketplaceContract = getContractWithSigner('Marketplace');

    const tx = await marketplaceContract.cancelListing(listingId);
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error('Error canceling listing:', error);
    throw error;
  }
};

// Get user's listings
export const getUserListings = async (address) => {
  try {
    const response = await api.get(`/marketplace/listings?seller=${address}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user listings:', error);
    throw error;
  }
};

// Get marketplace statistics
export const getMarketplaceStats = async () => {
  try {
    const response = await api.get('/marketplace/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching marketplace stats:', error);
    throw error;
  }
};

export default {
  getListings,
  getListingById,
  listTicket,
  buyTicket,
  cancelListing,
  getUserListings,
  getMarketplaceStats,
};
