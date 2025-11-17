// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/**
 * @title SystemToken
 * @dev Token riêng của hệ thống để thanh toán vé
 * @dev Supports ERC-2771 for gasless transactions via Account Abstraction
 */
contract SystemToken is ERC2771Context, ERC20, Ownable {
    // Decimals mặc định là 18
    
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        address trustedForwarder
    ) ERC2771Context(trustedForwarder) ERC20(name, symbol) Ownable() {
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    /**
     * @dev Mint tokens cho user (có thể dùng để airdrop, faucet testnet)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Faucet cho testnet - cho phép user claim token miễn phí
     */
    function faucet(uint256 amount) external {
        require(amount <= 1000 * 10**decimals(), "Maximum 1000 tokens per claim");
        _mint(_msgSender(), amount);
        emit TokensMinted(_msgSender(), amount);
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
