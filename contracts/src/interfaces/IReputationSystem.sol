// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title IReputationSystem
 * @dev Interfaz para el sistema de reputación
 */
interface IReputationSystem {
    function updateReputation(address organizer, uint256 projectId, bool success) external;
    function getReputationScore(address organizer) external view returns (uint256);
    function getReputationLevel(address organizer) external view returns (string memory);
    function addBadge(address organizer, string calldata badge) external;
    function removeBadge(address organizer, string calldata badge) external;
    function hasBadge(address organizer, string calldata badge) external view returns (bool);
    
    // Eventos
    event ReputationUpdated(address indexed organizer, uint256 newScore);
    event BadgeAdded(address indexed organizer, string badge);
    event BadgeRemoved(address indexed organizer, string badge);
}