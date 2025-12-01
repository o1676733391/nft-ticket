export const MARKETPLACE_ABI = [
    "function list(uint256 tokenId, uint256 price)",
    "function unlist(uint256 tokenId)",
    "function buy(uint256 tokenId) payable",
    "function listings(uint256 tokenId) view returns (uint256 tokenId, address seller, uint256 price, bool isActive)",
    "function setRoyalty(uint256 tokenId, address recipient, uint256 fee)",
    "event Listed(uint256 indexed tokenId, address indexed seller, uint256 price)",
    "event Unlisted(uint256 indexed tokenId, address indexed seller)",
    "event Sold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)"
];
