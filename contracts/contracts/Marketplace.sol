// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Marketplace
 * @dev Marketplace để mua bán vé NFT với royalty
 */
contract Marketplace is ReentrancyGuard, Ownable {
    IERC721 public ticketNFT;
    IERC20 public systemToken;

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isActive;
    }

    struct RoyaltyInfo {
        address recipient;
        uint256 fee; // basis points (500 = 5%)
    }

    // Platform fee (basis points)
    uint256 public platformFee = 250; // 2.5%
    address public feeRecipient;

    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => RoyaltyInfo) public royalties;

    // Events
    event Listed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event Unlisted(uint256 indexed tokenId, address indexed seller);
    event Sold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    event RoyaltySet(uint256 indexed tokenId, address recipient, uint256 fee);

    constructor(
        address _ticketNFT,
        address _systemToken
    ) Ownable(msg.sender) {
        ticketNFT = IERC721(_ticketNFT);
        systemToken = IERC20(_systemToken);
        feeRecipient = msg.sender;
    }

    /**
     * @dev Set royalty cho token
     */
    function setRoyalty(
        uint256 tokenId,
        address recipient,
        uint256 fee
    ) external {
        require(fee <= 1000, "Royalty fee too high"); // Max 10%
        require(
            ticketNFT.ownerOf(tokenId) == msg.sender || 
            msg.sender == owner(),
            "Not authorized"
        );

        royalties[tokenId] = RoyaltyInfo({
            recipient: recipient,
            fee: fee
        });

        emit RoyaltySet(tokenId, recipient, fee);
    }

    /**
     * @dev List vé để bán
     */
    function list(uint256 tokenId, uint256 price) external nonReentrant {
        require(ticketNFT.ownerOf(tokenId) == msg.sender, "Not owner");
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].isActive, "Already listed");

        // Transfer NFT to marketplace
        ticketNFT.transferFrom(msg.sender, address(this), tokenId);

        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isActive: true
        });

        emit Listed(tokenId, msg.sender, price);
    }

    /**
     * @dev Hủy listing
     */
    function unlist(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Not listed");
        require(listing.seller == msg.sender, "Not seller");

        listing.isActive = false;

        // Return NFT to seller
        ticketNFT.transferFrom(address(this), msg.sender, tokenId);

        emit Unlisted(tokenId, msg.sender);
    }

    /**
     * @dev Mua vé
     */
    function buy(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Not listed");
        require(msg.sender != listing.seller, "Cannot buy own listing");

        uint256 price = listing.price;
        address seller = listing.seller;

        // Calculate fees
        uint256 platformAmount = (price * platformFee) / 10000;
        uint256 royaltyAmount = 0;
        address royaltyRecipient = address(0);

        if (royalties[tokenId].recipient != address(0)) {
            royaltyAmount = (price * royalties[tokenId].fee) / 10000;
            royaltyRecipient = royalties[tokenId].recipient;
        }

        uint256 sellerAmount = price - platformAmount - royaltyAmount;

        // Transfer tokens
        require(
            systemToken.transferFrom(msg.sender, seller, sellerAmount),
            "Transfer to seller failed"
        );

        if (platformAmount > 0) {
            require(
                systemToken.transferFrom(msg.sender, feeRecipient, platformAmount),
                "Transfer platform fee failed"
            );
        }

        if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
            require(
                systemToken.transferFrom(msg.sender, royaltyRecipient, royaltyAmount),
                "Transfer royalty failed"
            );
        }

        // Mark as sold
        listing.isActive = false;

        // Transfer NFT to buyer
        ticketNFT.transferFrom(address(this), msg.sender, tokenId);

        emit Sold(tokenId, seller, msg.sender, price);
    }

    /**
     * @dev Update listing price
     */
    function updatePrice(uint256 tokenId, uint256 newPrice) external {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Not listed");
        require(listing.seller == msg.sender, "Not seller");
        require(newPrice > 0, "Price must be greater than 0");

        listing.price = newPrice;
        emit Listed(tokenId, msg.sender, newPrice);
    }

    /**
     * @dev Get active listings
     */
    function getActiveListing(uint256 tokenId) external view returns (Listing memory) {
        require(listings[tokenId].isActive, "Not listed");
        return listings[tokenId];
    }

    /**
     * @dev Update platform fee
     */
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        platformFee = _fee;
    }

    /**
     * @dev Update fee recipient
     */
    function setFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid address");
        feeRecipient = _recipient;
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw(uint256 tokenId) external onlyOwner {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Not listed");

        listing.isActive = false;
        ticketNFT.transferFrom(address(this), listing.seller, tokenId);

        emit Unlisted(tokenId, listing.seller);
    }
}
