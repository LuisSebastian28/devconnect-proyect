// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../core/ProjectTypes.sol";
import "../interfaces/IReputationSystem.sol";
import "../utils/Pausable.sol";

/**
 * @title ReputationSystem
 * @dev Sistema de reputación para organizadores de proyectos
 */
contract ReputationSystem is IReputationSystem, Pausable {
    // ============ STATE VARIABLES ============
    
    address public platformFactory;
    address public stakingContract;
    
    // organizer -> ReputationInfo
    mapping(address => ProjectTypes.ReputationInfo) public reputationInfo;
    
    // organizer -> badges
    mapping(address => string[]) public organizerBadges;
    
    // badge -> requirements
    mapping(string => uint256) public badgeRequirements;
    
    // ============ CONSTANTS ============
    
    uint256 public constant INITIAL_REPUTATION = 500;
    uint256 public constant MAX_REPUTATION = 1000;
    uint256 public constant MIN_REPUTATION = 0;
    
    uint256 public constant SUCCESS_BONUS = 50;
    uint256 public constant FAILURE_PENALTY = 100;
    
    // ============ MODIFIERS ============
    
    modifier onlyPlatform() {
        require(msg.sender == platformFactory, "Only platform factory");
        _;
    }
    
    modifier onlyStaking() {
        require(msg.sender == stakingContract, "Only staking contract");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _platformFactory)  {
        platformFactory = _platformFactory;
        _initializeBadgeRequirements();
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Actualizar reputación basado en resultado de proyecto
     */
    function updateReputation(
        address organizer,
        uint256 projectId,
        bool success
    ) external override onlyStaking {
        ProjectTypes.ReputationInfo storage repInfo = reputationInfo[organizer];
        
        // Inicializar si es la primera vez
        if (repInfo.totalProjects == 0) {
            repInfo.score = INITIAL_REPUTATION;
            repInfo.level = "Novice";
        }
        
        if (success) {
            repInfo.score = min(repInfo.score + SUCCESS_BONUS, MAX_REPUTATION);
            repInfo.successfulProjects++;
        } else {
            repInfo.score = max(repInfo.score - FAILURE_PENALTY, MIN_REPUTATION); // ✅ Corregido
            repInfo.failedProjects++;
        }
        
        repInfo.totalProjects++;
        repInfo.lastUpdated = block.timestamp;
        
        // Actualizar nivel basado en nuevo score
        repInfo.level = calculateLevel(repInfo.score);
        
        // Verificar y asignar badges
        checkAndAssignBadges(organizer, repInfo.score);
        
        emit ReputationUpdated(organizer, repInfo.score);
    }
    
    /**
     * @dev Obtener puntaje de reputación
     */
    function getReputationScore(address organizer) 
        external 
        view 
        override 
        returns (uint256) 
    {
        return reputationInfo[organizer].score;
    }
    
    /**
     * @dev Obtener nivel de reputación
     */
    function getReputationLevel(address organizer) 
        external 
        view 
        override 
        returns (string memory) 
    {
        return reputationInfo[organizer].level;
    }
    
    /**
     * @dev Añadir badge to organizador
     */
    function addBadge(address organizer, string calldata badge) 
        external 
        override 
        onlyPlatform 
    {
        require(bytes(badge).length > 0, "Invalid badge name");
        require(!_hasBadge(organizer, badge), "Organizer already has this badge");
        
        organizerBadges[organizer].push(badge);
        reputationInfo[organizer].badgeCount++;
        
        emit BadgeAdded(organizer, badge);
    }
    
    /**
     * @dev Remover badge de organizador
     */
    function removeBadge(address organizer, string calldata badge) 
        external 
        override 
        onlyPlatform 
    {
        require(_hasBadge(organizer, badge), "Organizer doesn't have this badge");
        
        string[] storage badges = organizerBadges[organizer];
        for (uint256 i = 0; i < badges.length; i++) {
            if (compareStrings(badges[i], badge)) {
                badges[i] = badges[badges.length - 1];
                badges.pop();
                reputationInfo[organizer].badgeCount--;
                break;
            }
        }
        
        emit BadgeRemoved(organizer, badge);
    }
    
    /**
     * @dev Verificar si organizador tiene un badge
     */
    function hasBadge(address organizer, string calldata badge) 
        external 
        view 
        override 
        returns (bool) 
    {
        return _hasBadge(organizer, badge);
    }
    
    /**
     * @dev Obtener información completa de reputación
     */
    function getReputationInfo(address organizer) 
        external 
        view 
        returns (ProjectTypes.ReputationInfo memory) 
    {
        return reputationInfo[organizer];
    }
    
    /**
     * @dev Obtener todos los badges de un organizador
     */
    function getOrganizerBadges(address organizer) 
        external 
        view 
        returns (string[] memory) 
    {
        return organizerBadges[organizer];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function setStakingContract(address _stakingContract) external onlyPlatform {
        stakingContract = _stakingContract;
    }
    
    function setBadgeRequirement(string calldata badge, uint256 requirement) 
        external 
        onlyPlatform 
    {
        badgeRequirements[badge] = requirement;
    }
    
    // ============ PUBLIC/INTERNAL FUNCTIONS ============
    
    /**
     * @dev Calcular nivel basado en score
     */
    function calculateLevel(uint256 score) public pure returns (string memory) {
        if (score >= 900) return "Legendary";
        if (score >= 800) return "Elite";
        if (score >= 700) return "Expert";
        if (score >= 600) return "Advanced";
        if (score >= 500) return "Intermediate";
        if (score >= 300) return "Beginner";
        return "Novice";
    }
    
    function min(uint256 a, uint256 b) public pure returns (uint256) {
        return a < b ? a : b;
    }
    
    function max(uint256 a, uint256 b) public pure returns (uint256) {
        return a > b ? a : b;
    }
    
    function compareStrings(string memory a, string memory b) public pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _initializeBadgeRequirements() internal {
        badgeRequirements["Verified"] = 300;
        badgeRequirements["Trusted"] = 600;
        badgeRequirements["Elite"] = 800;
        badgeRequirements["TopPerformer"] = 900;
        badgeRequirements["Legendary"] = 950;
    }
    
    function checkAndAssignBadges(address organizer, uint256 score) internal {
        string[5] memory badges = ["Verified", "Trusted", "Elite", "TopPerformer", "Legendary"];
        
        for (uint256 i = 0; i < badges.length; i++) {
            if (score >= badgeRequirements[badges[i]] && !_hasBadge(organizer, badges[i])) {
                organizerBadges[organizer].push(badges[i]);
                reputationInfo[organizer].badgeCount++;
                emit BadgeAdded(organizer, badges[i]);
            }
        }
    }
    
    function _hasBadge(address organizer, string memory badge) internal view returns (bool) {
        string[] memory badges = organizerBadges[organizer];
        for (uint256 i = 0; i < badges.length; i++) {
            if (compareStrings(badges[i], badge)) {
                return true;
            }
        }
        return false;
    }
    
    // ============ ELIMINAR LA SECCIÓN DE EVENTOS REDUNDANTES ============
    // Los eventos ya están definidos en IReputationSystem
}