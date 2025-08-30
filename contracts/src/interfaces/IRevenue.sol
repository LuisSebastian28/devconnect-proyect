// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../core/ProjectTypes.sol";

/**
 * @title IRevenue
 * @dev Interfaz para el sistema de revenue distribution y fee management
 */
interface IRevenue {
    // ============ FUNCIONES DE FEE MANAGEMENT ============
    
    function calculatePlatformFee(uint256 amount, ProjectTypes.ProjectCategory category) 
        external 
        view 
        returns (uint256);
    
    function calculateSuccessFee(uint256 profits) 
        external 
        view 
        returns (uint256);
    
    function getFeeStructure(ProjectTypes.ProjectCategory category) 
        external 
        view 
        returns (
            uint256 platformFee,
            uint256 successFee,
            uint256 minFee,
            uint256 maxFee
        );
    
    // ============ FUNCIONES DE REVENUE DISTRIBUTION ============
    
    function distributeRevenue(
        uint256 projectId,
        uint256 totalRevenue,
        uint256 totalInvested
    ) external returns (uint256 platformShare, uint256 investorShare, uint256 organizerShare);
    
    function claimPlatformRevenue() 
        external;
    
    function getPlatformRevenue() 
        external 
        view 
        returns (uint256);
    
    function getInvestorShare(uint256 projectId, address investor) 
        external 
        view 
        returns (uint256);
    
    // ============ FUNCIONES DE TREASURY ============
    
    function withdrawTreasury(uint256 amount, address recipient) 
        external;
    
    function getTreasuryBalance() 
        external 
        view 
        returns (uint256);
    
    // ============ FUNCIONES DE DISCOUNTS ============
    
    function getFeeDiscount(address user) 
        external 
        view 
        returns (uint256 discountPercentage);
    
    function updateFeeDiscount(address user, uint256 newDiscount) 
        external;
    
    // ============ EVENTOS ============
    
    event PlatformFeeCalculated(uint256 amount, uint256 fee);
    event SuccessFeeCalculated(uint256 profits, uint256 fee);
    event RevenueDistributed(
        uint256 indexed projectId,
        uint256 platformShare,
        uint256 investorShare,
        uint256 organizerShare
    );
    event PlatformRevenueClaimed(address indexed claimer, uint256 amount);
    event TreasuryWithdrawn(address indexed recipient, uint256 amount);
    event FeeDiscountUpdated(address indexed user, uint256 newDiscount);
}