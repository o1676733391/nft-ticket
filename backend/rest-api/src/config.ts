import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Assuming .env is in the rest-api directory

// --- Supabase Client ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL or Service Role Key is missing from environment variables.");
}
export const supabase = createClient(supabaseUrl, supabaseServiceKey);


// --- Ethers.js Provider and Wallet ---
const rpcUrl = process.env.RPC_URL;
const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;

if (!rpcUrl || !adminPrivateKey) {
    throw new Error("RPC URL or Admin Private Key is missing from environment variables.");
}

export const provider = new ethers.JsonRpcProvider(rpcUrl);
export const adminWallet = new ethers.Wallet(adminPrivateKey, provider);


// --- Contract Instances ---
const ticketNftAddress = process.env.TICKET_NFT_ADDRESS;
const marketplaceAddress = process.env.MARKETPLACE_ADDRESS;

if (!ticketNftAddress || !marketplaceAddress) {
    throw new Error("Contract addresses are missing from environment variables.");
}

// You'll need the ABIs for your contracts
// For simplicity, we'll define minimal ABIs here.
// In a real project, you would import these from your `contracts` package artifacts.
const TICKET_NFT_ABI = [
  "function mint(address to, uint256 eventId) returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function checkIn(uint256 tokenId)"
];
const MARKETPLACE_ABI = [
  "function getListing(uint256 tokenId) view returns (tuple(address seller, uint256 price))"
];

export const ticketContract = new ethers.Contract(ticketNftAddress, TICKET_NFT_ABI, adminWallet);
export const marketplaceContract = new ethers.Contract(marketplaceAddress, MARKETPLACE_ABI, provider);
