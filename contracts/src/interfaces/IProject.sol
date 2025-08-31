// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../core/ProjectTypes.sol";

/**
 * @title IProject
 * @dev Interfaz para el contrato UniversalProject
 */
interface IProject {
    // ============ FUNCIONES DE ESTADO ============
    
    function getProjectDetails(uint256 projectId) 
        external 
        view 
        returns (ProjectTypes.ProjectDetails memory);
    
    function getProjectStatus(uint256 projectId) 
        external 
        view 
        returns (ProjectTypes.ProjectStatus);
    
    function getInvestmentInfo(uint256 projectId, address investor) 
        external 
        view 
        returns (ProjectTypes.Investment memory);
    
    function getProjectInvestors(uint256 projectId) 
        external 
        view 
        returns (address[] memory);
    
    // ============ FUNCIONES DE INVERSIÓN ============
    
    function invest(uint256 projectId) 
        external 
        payable;
    
    function withdrawInvestment(uint256 projectId) 
        external;
    
    function claimReturns(uint256 projectId) 
        external;
    
    // ============ FUNCIONES DEL ORGANIZADOR ============
    
    function updateProgress(string calldata progressReport) 
        external;
    
    function completeProject() 
        external;
    
    function cancelProject() 
        external;
    
    function withdrawFunds() 
        external;
    
    // ============ EVENTOS ============
    
    event ProjectFunded(uint256 indexed projectId, uint256 totalRaised);
    event InvestmentWithdrawn(uint256 indexed projectId, address indexed investor, uint256 amount);
    event ReturnsClaimed(uint256 indexed projectId, address indexed investor, uint256 amount);
    event ProgressUpdated(uint256 indexed projectId, string progressReport);
    event ProjectCompleted(uint256 indexed projectId, uint256 totalReturns);
    event ProjectCancelled(uint256 indexed projectId);
}