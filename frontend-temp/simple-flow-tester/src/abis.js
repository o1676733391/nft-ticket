export const SystemTokenABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount) public" 
];

export const TicketNFTABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function getTicketsByOwner(address owner) view returns (uint256[])",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function setApprovalForAll(address operator, bool approved)"
];

export const MarketplaceABI = [
  "function list(uint256 tokenId, uint256 price)",
  "function unlist(uint256 tokenId)",
  "function buy(uint256 tokenId)",
  "function getActiveListing(uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, uint256 price, bool isActive))",
  "event Listed(uint256 indexed tokenId, address indexed seller, uint256 price)",
  "event Sold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)"
];
