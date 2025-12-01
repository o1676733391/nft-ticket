import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env from the current directory (rest-api)

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

export const getSupabaseClient = () => supabase;
export const getProvider = () => provider;


// --- Contract Instances ---
const ticketNftAddress = process.env.TICKET_NFT_ADDRESS;
const marketplaceAddress = process.env.MARKETPLACE_ADDRESS;
const systemTokenAddress = process.env.SYSTEM_TOKEN_ADDRESS;

if (!ticketNftAddress || !marketplaceAddress || !systemTokenAddress) {
    throw new Error("Contract addresses are missing from environment variables.");
}

// You'll need the ABIs for your contracts
// For simplicity, we'll define minimal ABIs here.
// In a real project, you would import these from your `contracts` package artifacts.
const TICKET_NFT_ABI = [
  "function mintTicket(address to, uint256 eventId, uint256 templateId, string uri, bool isSoulbound) returns (uint256)",
  "function createEvent(uint256 eventId, string name, uint256 royaltyFee)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function checkIn(uint256 tokenId)",
  "function events(uint256) view returns (string name, address organizer, uint256 royaltyFee, bool isActive)"
];
const MARKETPLACE_ABI = [
  "function list(uint256 tokenId, uint256 price)",
  "function unlist(uint256 tokenId)",
  "function buy(uint256 tokenId)",
  "function updatePrice(uint256 tokenId, uint256 newPrice)",
  "function getActiveListing(uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, uint256 price, bool isActive))",
  "function setRoyalty(uint256 tokenId, address recipient, uint256 fee)",
  "function listings(uint256) view returns (uint256 tokenId, address seller, uint256 price, bool isActive)",
  "function royalties(uint256) view returns (address recipient, uint256 fee)",
  "function platformFee() view returns (uint256)"
];

export const ticketContract = new ethers.Contract(ticketNftAddress, TICKET_NFT_ABI, adminWallet);
export const marketplaceContract = new ethers.Contract(marketplaceAddress, MARKETPLACE_ABI, adminWallet);

// Export addresses for use in routes
export { ticketNftAddress, marketplaceAddress, systemTokenAddress };

// Debug logging
console.log('🔧 Contract Configuration:');
console.log('  Admin Wallet Address:', adminWallet.address);
console.log('  TicketNFT Address:', ticketNftAddress);
console.log('  Marketplace Address:', marketplaceAddress);
console.log('  RPC URL:', rpcUrl);
console.log('  Contract Runner:', ticketContract.runner ? 'Connected' : 'NOT CONNECTED');

// Verify the signer is properly connected
(async () => {
    try {
        const signerAddress = await adminWallet.getAddress();
        console.log('  Verified Signer Address:', signerAddress);
        
        // Test connection to blockchain
        const network = await provider.getNetwork();
        console.log('  Network Chain ID:', network.chainId.toString());
        
        const balance = await provider.getBalance(signerAddress);
        console.log('  Signer Balance:', ethers.formatEther(balance), 'ETH');
    } catch (error: any) {
        console.error('❌ Error connecting to blockchain:', error.message);
    }
})();
