// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../core/ProjectTypes.sol";

/**
 * @title IStaking
 * @dev Interfaz para el sistema de staking y garantías
 */
interface IStaking {
    // ============ FUNCIONES DE STAKING ============
    
    function stakeCollateral(uint256 projectId) external payable;
    
    function unstakeCollateral(uint256 projectId) external;
    
    function getStakedAmount(uint256 projectId, address organizer) external view returns (uint256);
    
    function calculateRequiredCollateral(
        ProjectTypes.ProjectCategory category,
        uint256 targetAmount,
        address organizer
    ) external view returns (uint256);
    
    // ============ FUNCIONES DE SLASHING ============
    
    function slashCollateral(
        uint256 projectId,
        uint256 slashAmount,
        string calldata reason
    ) external;
    
    function appealSlashing(uint256 projectId) external;
    
    // ============ FUNCIONES DE REPUTACIÓN ============
    
    function updateReputation(
        address organizer,
        uint256 projectId,
        bool success
    ) external;
    
    function getReputationScore(address organizer) external view returns (uint256);
    
    function getReputationLevel(address organizer) external view returns (string memory);
    
    // ============ FUNCIONES DEL INSURANCE POOL ============
    
    function claimInsurance(uint256 projectId, address investor) external;
    
    function getInsurancePoolBalance() external view returns (uint256);
    
    // ============ EVENTOS ============
    
    event CollateralStaked(uint256 indexed projectId, address indexed organizer, uint256 amount);
    event CollateralUnstaked(uint256 indexed projectId, address indexed organizer, uint256 amount);
    event CollateralSlashed(uint256 indexed projectId, uint256 amount, string reason);
    event SlashingAppealed(uint256 indexed projectId);
    event ReputationUpdated(address indexed organizer, uint256 newScore);
    event InsuranceClaimed(uint256 indexed projectId, address indexed investor, uint256 amount);
}