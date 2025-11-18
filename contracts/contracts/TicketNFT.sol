// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/**
 * @title TicketNFT
 * @dev NFT ticket với khả năng soulbound (không thể transfer) và royalty
 * @dev Supports ERC-2771 for gasless transactions via Account Abstraction
 */
contract TicketNFT is ERC2771Context, ERC721, ERC721URIStorage, ERC721Enumerable, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");

    Counters.Counter private _tokenIdCounter;

    struct TicketInfo {
        uint256 eventId;
        uint256 templateId;
        address organizer;
        bool isSoulbound;
        bool isCheckedIn;
        uint256 mintedAt;
    }

    struct EventInfo {
        string name;
        address organizer;
        uint256 royaltyFee; // basis points (e.g., 500 = 5%)
        bool isActive;
    }

    // Mappings
    mapping(uint256 => TicketInfo) public tickets;
    mapping(uint256 => EventInfo) public events;
    mapping(uint256 => bool) public transferLocked; // Soulbound tickets

    // Events
    event TicketMinted(uint256 indexed tokenId, uint256 indexed eventId, address indexed owner);
    event TicketCheckedIn(uint256 indexed tokenId, uint256 timestamp);
    event EventCreated(uint256 indexed eventId, address indexed organizer, string name);
    event TransferLocked(uint256 indexed tokenId, bool locked);

    constructor(
        address trustedForwarder
    ) ERC721("NFT Ticket", "NFTT") ERC2771Context(trustedForwarder) {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(MINTER_ROLE, _msgSender());
    }

    /**
     * @dev Tạo sự kiện mới
     */
    function createEvent(
        uint256 eventId,
        string memory name,
        uint256 royaltyFee
    ) external {
        require(events[eventId].organizer == address(0), "Event already exists");
        require(royaltyFee <= 1000, "Royalty fee too high"); // Max 10%

        events[eventId] = EventInfo({
            name: name,
            organizer: _msgSender(),
            royaltyFee: royaltyFee,
            isActive: true
        });

        _grantRole(ORGANIZER_ROLE, _msgSender());
        emit EventCreated(eventId, _msgSender(), name);
    }

    /**
     * @dev Mint vé cho user
     */
    function mintTicket(
        address to,
        uint256 eventId,
        uint256 templateId,
        string memory uri,
        bool isSoulbound
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        require(events[eventId].isActive, "Event not active");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        tickets[tokenId] = TicketInfo({
            eventId: eventId,
            templateId: templateId,
            organizer: events[eventId].organizer,
            isSoulbound: isSoulbound,
            isCheckedIn: false,
            mintedAt: block.timestamp
        });

        if (isSoulbound) {
            transferLocked[tokenId] = true;
            emit TransferLocked(tokenId, true);
        }

        emit TicketMinted(tokenId, eventId, to);
        return tokenId;
    }

    /**
     * @dev Batch mint nhiều vé
     */
    function batchMintTickets(
        address[] memory recipients,
        uint256 eventId,
        uint256 templateId,
        string memory baseURI,
        bool isSoulbound
    ) external onlyRole(MINTER_ROLE) {
        require(events[eventId].isActive, "Event not active");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            mintTicket(recipients[i], eventId, templateId, baseURI, isSoulbound);
        }
    }

    /**
     * @dev Check-in vé
     */
    function checkIn(uint256 tokenId) external {
        require(_exists(tokenId), "Token does not exist");
        require(!tickets[tokenId].isCheckedIn, "Already checked in");
        require(
            _msgSender() == tickets[tokenId].organizer || 
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "Not authorized"
        );

        tickets[tokenId].isCheckedIn = true;
        emit TicketCheckedIn(tokenId, block.timestamp);
    }

    /**
     * @dev Lock/unlock transfer cho soulbound
     */
    function setTransferLock(uint256 tokenId, bool locked) external {
        require(_exists(tokenId), "Token does not exist");
        require(
            _msgSender() == tickets[tokenId].organizer || 
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "Not authorized"
        );

        transferLocked[tokenId] = locked;
        tickets[tokenId].isSoulbound = locked;
        emit TransferLocked(tokenId, locked);
    }

    /**
     * @dev Override transfer để enforce soulbound
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Allow minting (from == address(0))
        if (from != address(0)) {
            require(!transferLocked[tokenId], "Token is soulbound and cannot be transferred");
        }
    }

    /**
     * @dev Get ticket info
     */
    function getTicketInfo(uint256 tokenId) external view returns (TicketInfo memory) {
        require(_exists(tokenId), "Token does not exist");
        return tickets[tokenId];
    }

    /**
     * @dev Get event info
     */
    function getEventInfo(uint256 eventId) external view returns (EventInfo memory) {
        return events[eventId];
    }

    /**
     * @dev Get all tickets owned by address
     */
    function getTicketsByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory result = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            result[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return result;
    }

    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override _msgSender to support ERC-2771 (gasless transactions)
     */
    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    /**
     * @dev Override _msgData to support ERC-2771
     */
    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    /**
     * @dev Override _contextSuffixLength for ERC-2771
     */
    function _contextSuffixLength() internal view virtual returns (uint256) {
        // Custom logic for _contextSuffixLength
        return 0; // Example return value
    }
}
