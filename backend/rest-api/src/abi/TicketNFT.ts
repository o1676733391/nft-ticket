export const TICKET_NFT_ABI = [
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
    
    // Transfer
    "function safeTransferFrom(address from, address to, uint256 tokenId)",
    
    // Events
    "event TicketMinted(uint256 indexed tokenId, uint256 indexed eventId, address indexed owner)",
    "event TicketCheckedIn(uint256 indexed tokenId, uint256 timestamp)",
    "event EventCreated(uint256 indexed eventId, address indexed organizer, string name)",
    "event TransferLocked(uint256 indexed tokenId, bool locked)"
];

