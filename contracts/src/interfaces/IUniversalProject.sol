// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../core/ProjectTypes.sol";

/**
 * @title IUniversalProject
 * @dev Interfaz para interactuar con contratos UniversalProject
 */
interface IUniversalProject {
    function getProjectDetails(uint256 projectId) external view returns (ProjectTypes.ProjectDetails memory);
    function getProjectStatus(uint256 projectId) external view returns (ProjectTypes.ProjectStatus);
    function getInvestmentInfo(uint256 projectId, address investor) external view returns (ProjectTypes.Investment memory);
    function getProjectInvestors(uint256 projectId) external view returns (address[] memory);
    
    function createProject(
        string memory name,
        string memory description,
        ProjectTypes.ProjectCategory category,
        string memory productName,
        uint256 targetAmount,
        uint256 projectedROI,
        uint256 duration,
        string memory marketAnalysis,
        string memory supplierInfo,
        string memory logisticsPlan
    ) external returns (uint256);
    
    function invest(uint256 projectId) external payable;
    function startProject(uint256 projectId) external;
    function completeProject(uint256 projectId, uint256 totalRevenue) external;
    function claimReturns(uint256 projectId) external;
    function cancelProject(uint256 projectId) external;
    
    function setStakingContract(address _stakingContract) external;
    function setRevenueContract(address _revenueContract) external;
    function pause() external;
    function unpause() external;
}