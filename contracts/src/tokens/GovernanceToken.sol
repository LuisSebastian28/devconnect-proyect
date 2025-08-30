// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GovernanceToken
 * @dev Token de gobernanza para la plataforma de crowdlending
 * Implementa ERC20Votes para snapshot voting y delegación
 */
contract GovernanceToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    // ============ STATE VARIABLES ============
    
    address public platformFactory;
    uint256 public maxSupply;
    
    // Mappings para recompensas y staking
    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public rewards;
    
    // ============ CONSTANTS ============
    
    uint256 public constant INITIAL_SUPPLY = 10_000_000 * 10**18; // 10M tokens
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100M tokens máximo
    
    // ============ EVENTS ============
    
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event PlatformFactoryUpdated(address newFactory);
    
    // ============ MODIFIERS ============
    
    modifier onlyPlatform() {
        require(msg.sender == platformFactory, "Only platform factory");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _platformFactory) 
        ERC20("Crowdlend Governance Token", "CGT") 
        ERC20Permit("Crowdlend Governance Token")
        Ownable(msg.sender)
    {
        platformFactory = _platformFactory;
        maxSupply = MAX_SUPPLY;
        
        // Mint initial supply to platform factory
        _mint(_platformFactory, INITIAL_SUPPLY);
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Mint nuevos tokens (solo platform factory)
     */
    function mint(address to, uint256 amount) external onlyPlatform {
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Quemar tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Añadir recompensas por participación
     */
    function addRewards(address user, uint256 amount) external onlyPlatform {
        rewards[user] += amount;
    }
    
    /**
     * @dev Reclamar recompensas acumuladas
     */
    function claimRewards() external {
        require(rewards[msg.sender] > 0, "No rewards to claim");
        require(block.timestamp >= lastClaimTime[msg.sender] + 7 days, "Claim cooldown active");
        
        uint256 amount = rewards[msg.sender];
        rewards[msg.sender] = 0;
        lastClaimTime[msg.sender] = block.timestamp;
        
        _mint(msg.sender, amount);
        emit RewardsClaimed(msg.sender, amount);
    }
    
    /**
     * @dev Actualizar platform factory address
     */
    function setPlatformFactory(address _platformFactory) external onlyOwner {
        require(_platformFactory != address(0), "Invalid factory address");
        platformFactory = _platformFactory;
        emit PlatformFactoryUpdated(_platformFactory);
    }
    
    /**
     * @dev Obtener voting power para una address
     */
    function getVotingPower(address account) external view returns (uint256) {
        return getVotes(account);
    }
    
    /**
     * @dev Obtener balance con voting power
     */
    function getBalanceWithVotingPower(address account) external view returns (uint256 balance, uint256 votingPower) {
        return (balanceOf(account), getVotes(account));
    }
    
    // ============ OVERRIDE FUNCTIONS ============
    
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }
    
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Ajustar max supply (solo owner)
     */
    function setMaxSupply(uint256 newMaxSupply) external onlyOwner {
        require(newMaxSupply >= totalSupply(), "New max supply too low");
        maxSupply = newMaxSupply;
    }
    
    /**
     * @dev Recuperar tokens ERC20 accidentalmente enviados
     */
    function recoverERC20(address tokenAddress, uint256 amount) external onlyOwner {
        IERC20(tokenAddress).transfer(owner(), amount);
    }
}