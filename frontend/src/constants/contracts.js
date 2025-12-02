// src/constants/contracts.js

// Contract ABIs
const TICKET_NFT_ABI = [
  // Event creation
  "function createEvent(uint256 eventId, string memory name, uint256 royaltyFee)",
  "function events(uint256 eventId) view returns (string name, address organizer, uint256 royaltyFee, bool isActive)",
  
  // Minting
  "function mintTicket(address to, uint256 eventId, uint256 templateId, string memory uri, bool isSoulbound) returns (uint256)",
  "function batchMintTickets(address[] memory recipients, uint256 eventId, uint256 templateId, string memory baseURI, bool isSoulbound)",
  
  // Ticket management
  "function checkIn(uint256 tokenId)",
  "function setTransferLock(uint256 tokenId, bool locked)",
  "function getTicketInfo(uint256 tokenId) view returns (uint256 eventId, uint256 templateId, address organizer, bool isSoulbound, bool isCheckedIn, uint256 mintedAt)",
  "function getEventInfo(uint256 eventId) view returns (string name, address organizer, uint256 royaltyFee, bool isActive)",
  "function getTicketsByOwner(address owner) view returns (uint256[] memory)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  
  // Transfer
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  
  // Events
  "event TicketMinted(uint256 indexed tokenId, uint256 indexed eventId, address indexed owner)",
  "event TicketCheckedIn(uint256 indexed tokenId, uint256 timestamp)",
  "event EventCreated(uint256 indexed eventId, address indexed organizer, string name)",
  "event TransferLocked(uint256 indexed tokenId, bool locked)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

const MARKETPLACE_ABI = [
  "function listTicket(uint256 tokenId, uint256 price)",
  "function cancelListing(uint256 listingId)",
  "function buyTicket(uint256 listingId)",
  "function listings(uint256 listingId) view returns (uint256 tokenId, address seller, uint256 price, bool isActive)",
  "function getActiveListings() view returns (uint256[] memory)",
  
  // Events
  "event TicketListed(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 price)",
  "event TicketSold(uint256 indexed listingId, uint256 indexed tokenId, address indexed buyer, uint256 price)",
  "event ListingCancelled(uint256 indexed listingId, uint256 indexed tokenId)"
];

const SYSTEM_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// Contract addresses from deployments.json
const CONTRACT_ADDRESSES = {
  TicketNFT: process.env.EXPO_PUBLIC_TICKET_NFT_ADDRESS || "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  Marketplace: process.env.EXPO_PUBLIC_MARKETPLACE_ADDRESS || "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
  SystemToken: process.env.EXPO_PUBLIC_SYSTEM_TOKEN_ADDRESS || "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
};

// Export contracts configuration
export const CONTRACTS = {
  TicketNFT: {
    address: CONTRACT_ADDRESSES.TicketNFT,
    abi: TICKET_NFT_ABI,
  },
  Marketplace: {
    address: CONTRACT_ADDRESSES.Marketplace,
    abi: MARKETPLACE_ABI,
  },
  SystemToken: {
    address: CONTRACT_ADDRESSES.SystemToken,
    abi: SYSTEM_TOKEN_ABI,
  },
};

export default CONTRACTS;
