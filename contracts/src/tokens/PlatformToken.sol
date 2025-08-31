// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title PlatformToken
 * @dev Token utility de la plataforma para fees, descuentos y recompensas
 */
contract PlatformToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    
    address public platformFactory;
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1B tokens
    
    event PlatformFactoryUpdated(address newFactory);
    
    modifier onlyPlatform() {
        require(msg.sender == platformFactory, "Only platform factory");
        _;
    }
    
    constructor(address _platformFactory) 
        ERC20("Crowdlend Platform Token", "CPT") 
        ERC20Permit("Crowdlend Platform Token")
        Ownable(msg.sender)
    {
        platformFactory = _platformFactory;
        _mint(_platformFactory, 100_000_000 * 10**18); // 100M initial supply
    }
    
    function mint(address to, uint256 amount) external onlyPlatform {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    function setPlatformFactory(address _platformFactory) external onlyOwner {
        platformFactory = _platformFactory;
        emit PlatformFactoryUpdated(_platformFactory);
    }
    
    function burnFrom(address account, uint256 amount) public override onlyPlatform {
        _burn(account, amount);
    }
}