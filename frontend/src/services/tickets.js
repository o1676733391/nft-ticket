// src/services/tickets.js
import api from './api';
import { getContractWithSigner, getContract, parseEther, waitForTransaction } from './web3';

// Get tickets for a user
export const getUserTickets = async (address) => {
  try {
    const response = await api.get(`/tickets?owner=${address}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
};

// Get ticket by ID
export const getTicketById = async (ticketId) => {
  try {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw error;
  }
};

// Mint ticket (buy ticket)
export const mintTicket = async (eventId, templateId, metadata = {}) => {
  try {
    // Get SystemToken contract
    const tokenContract = getContractWithSigner('SystemToken');
    
    // Get TicketNFT contract
    const ticketContract = getContractWithSigner('TicketNFT');

    // Get ticket price from template
    const response = await api.get(`/ticket-templates/${templateId}`);
    const template = response.data;
    const price = parseEther(template.price);

    // Approve token spending
    const approveTx = await tokenContract.approve(ticketContract.target, price);
    await approveTx.wait();

    // Mint ticket
    const mintTx = await ticketContract.mintTicket(
      await ticketContract.runner.getAddress(), // to
      eventId,
      templateId,
      JSON.stringify(metadata), // uri/metadata
      false // isSoulbound
    );

    const receipt = await mintTx.wait();

    // Get token ID from event
    const mintEvent = receipt.logs.find(log => log.fragment?.name === 'TicketMinted');
    const tokenId = mintEvent?.args?.tokenId;

    return {
      success: true,
      tokenId: tokenId?.toString(),
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error('Error minting ticket:', error);
    throw error;
  }
};

// Transfer ticket
export const transferTicket = async (tokenId, toAddress) => {
  try {
    const ticketContract = getContractWithSigner('TicketNFT');
    const fromAddress = await ticketContract.runner.getAddress();

    const tx = await ticketContract.transferFrom(fromAddress, toAddress, tokenId);
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error('Error transferring ticket:', error);
    throw error;
  }
};

// Check-in ticket
export const checkInTicket = async (tokenId) => {
  try {
    const response = await api.post('/checkin', {
      tokenId,
    });

    return response.data;
  } catch (error) {
    console.error('Error checking in ticket:', error);
    throw error;
  }
};

// Get ticket templates for an event
export const getTicketTemplates = async (eventId) => {
  try {
    const response = await api.get(`/ticket-templates?event_id=${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket templates:', error);
    throw error;
  }
};

// Verify ticket ownership
export const verifyTicketOwnership = async (tokenId, address) => {
  try {
    const ticketContract = getContract('TicketNFT');
    const owner = await ticketContract.ownerOf(tokenId);
    return owner.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Error verifying ticket ownership:', error);
    return false;
  }
};

export default {
  getUserTickets,
  getTicketById,
  mintTicket,
  transferTicket,
  checkInTicket,
  getTicketTemplates,
  verifyTicketOwnership,
};
