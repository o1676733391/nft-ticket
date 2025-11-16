// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SystemToken
 * @dev Token riêng của hệ thống để thanh toán vé
 */
contract SystemToken is ERC20, Ownable {
    // Decimals mặc định là 18
    
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10**decimals());
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
        _mint(msg.sender, amount);
        emit TokensMinted(msg.sender, amount);
    }
}
