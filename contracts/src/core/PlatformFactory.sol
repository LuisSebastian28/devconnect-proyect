// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./UniversalProject.sol";
import "./ProjectTypes.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/IRevenue.sol";
import "../utils/Pausable.sol";
import "../utils/ReentrancyGuard.sol";

/**
 * @title PlatformFactory
 * @dev Fábrica para crear y gestionar proyectos de crowdlending
 */
contract PlatformFactory is Pausable, ReentrancyGuard {
    using ProjectTypes for ProjectTypes.ProjectDetails;
    using ProjectTypes for ProjectTypes.CategoryParams;

    // ============ STATE VARIABLES ============
    
    address public admin;
    address public stakingContract;
    address public revenueContract;
    
    uint256 public totalProjects;
    uint256 public totalInvestments;
    uint256 public totalVolume;
    
    mapping(uint256 => address) public projects; // projectId -> projectAddress
    mapping(address => uint256[]) public userProjects; // user -> projectIds
    mapping(ProjectTypes.ProjectCategory => ProjectTypes.CategoryParams) public categoryParams;
    
    // ============ EVENTS ============
    
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed projectAddress,
        address indexed organizer,
        ProjectTypes.ProjectCategory category,
        uint256 targetAmount
    );
    
    event CategoryParamsUpdated(
        ProjectTypes.ProjectCategory category,
        uint256 minStakingPercentage,
        uint256 maxFundingTarget,
        uint256 platformFee
    );
    
    event ContractsUpdated(
        address indexed stakingContract,
        address indexed revenueContract
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier validCategory(ProjectTypes.ProjectCategory category) {
        require(uint256(category) <= uint256(ProjectTypes.ProjectCategory.Other), "Invalid category");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor()  {
        admin = msg.sender;
        _initializeDefaultCategories();
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Crea un nuevo proyecto
     */
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
    ) external whenNotPaused nonReentrant returns (address) {
        // Validar parámetros de la categoría
        ProjectTypes.CategoryParams memory params = categoryParams[category];
        require(targetAmount <= params.maxFundingTarget, "Target exceeds category limit");
        require(duration >= params.minDuration && duration <= params.maxDuration, "Invalid duration");
        require(projectedROI <= 5000, "ROI too high"); // Máximo 50%
        
        // Crear nuevo contrato de proyecto
        UniversalProject newProject = new UniversalProject(address(this));
        
        // Configurar contratos dependientes
        newProject.setStakingContract(stakingContract);
        newProject.setRevenueContract(revenueContract);
        
        // Obtener ID del proyecto
        totalProjects++;
        uint256 projectId = totalProjects;
        
        // Registrar proyecto
        projects[projectId] = address(newProject);
        userProjects[msg.sender].push(projectId);
        
        // Inicializar proyecto
        newProject.createProject(
            name,
            description,
            category,
            productName,
            targetAmount,
            projectedROI,
            duration,
            marketAnalysis,
            supplierInfo,
            logisticsPlan
        );
        
        emit ProjectCreated(
            projectId,
            address(newProject),
            msg.sender,
            category,
            targetAmount
        );
        
        return address(newProject);
    }
    
    /**
     * @dev Actualiza parámetros de categoría
     */
    function updateCategoryParams(
        ProjectTypes.ProjectCategory category,
        uint256 minStakingPercentage,
        uint256 maxFundingTarget,
        uint256 platformFee,
        uint256 minDuration,
        uint256 maxDuration,
        string[] memory requiredDocuments
    ) external onlyAdmin validCategory(category) {
        categoryParams[category] = ProjectTypes.CategoryParams({
            riskLevel: _getRiskLevel(category),
            minStakingPercentage: minStakingPercentage,
            maxFundingTarget: maxFundingTarget,
            platformFee: platformFee,
            minDuration: minDuration,
            maxDuration: maxDuration,
            requiredDocuments: requiredDocuments
        });
        
        emit CategoryParamsUpdated(category, minStakingPercentage, maxFundingTarget, platformFee);
    }
    
    /**
     * @dev Configura contratos externos
     */
    function setExternalContracts(address _stakingContract, address _revenueContract) external onlyAdmin {
        require(_stakingContract != address(0), "Invalid staking contract");
        require(_revenueContract != address(0), "Invalid revenue contract");
        
        stakingContract = _stakingContract;
        revenueContract = _revenueContract;
        
        emit ContractsUpdated(_stakingContract, _revenueContract);
    }
    
    /**
     * @dev Obtiene todos los proyectos de un usuario
     */
    function getUserProjects(address user) external view returns (uint256[] memory) {
        return userProjects[user];
    }
    
    /**
     * @dev Obtiene detalles de múltiples proyectos
     */
    function getProjectsDetails(uint256[] memory projectIds) external view returns (
        address[] memory projectAddresses,
        ProjectTypes.ProjectStatus[] memory statuses,
        uint256[] memory currentAmounts
    ) {
        projectAddresses = new address[](projectIds.length);
        statuses = new ProjectTypes.ProjectStatus[](projectIds.length);
        currentAmounts = new uint256[](projectIds.length);
        
        for (uint256 i = 0; i < projectIds.length; i++) {
            address projectAddress = projects[projectIds[i]];
            if (projectAddress != address(0)) {
                // SOLUCIÓN: Usar una interfaz en lugar de conversión directa
                IUniversalProject universalProject = IUniversalProject(projectAddress);
                projectAddresses[i] = projectAddress;
                statuses[i] = universalProject.getProjectStatus(projectIds[i]);
                
                ProjectTypes.ProjectDetails memory details = universalProject.getProjectDetails(projectIds[i]);
                currentAmounts[i] = details.currentAmount;
            }
        }
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Inicializa categorías con valores por defecto
     */
    function _initializeDefaultCategories() internal {
        // Electronics - Alto riesgo
        categoryParams[ProjectTypes.ProjectCategory.Electronics] = ProjectTypes.CategoryParams({
            riskLevel: ProjectTypes.RiskLevel.High,
            minStakingPercentage: 3000, // 30%
            maxFundingTarget: 100 ether,
            platformFee: 500, // 5%
            minDuration: 30 days,
            maxDuration: 90 days,
            requiredDocuments: new string[](2)
        });
        
        // Fashion - Medio riesgo
        categoryParams[ProjectTypes.ProjectCategory.Fashion] = ProjectTypes.CategoryParams({
            riskLevel: ProjectTypes.RiskLevel.Medium,
            minStakingPercentage: 2000, // 20%
            maxFundingTarget: 50 ether,
            platformFee: 400, // 4%
            minDuration: 30 days,
            maxDuration: 60 days,
            requiredDocuments: new string[](1)
        });
        
        // Health - Medio riesgo
        categoryParams[ProjectTypes.ProjectCategory.Health] = ProjectTypes.CategoryParams({
            riskLevel: ProjectTypes.RiskLevel.Medium,
            minStakingPercentage: 2500, // 25%
            maxFundingTarget: 75 ether,
            platformFee: 450, // 4.5%
            minDuration: 45 days,
            maxDuration: 90 days,
            requiredDocuments: new string[](3)
        });
        
        // Sports - Bajo riesgo
        categoryParams[ProjectTypes.ProjectCategory.Sports] = ProjectTypes.CategoryParams({
            riskLevel: ProjectTypes.RiskLevel.Low,
            minStakingPercentage: 1500, // 15%
            maxFundingTarget: 30 ether,
            platformFee: 300, // 3%
            minDuration: 30 days,
            maxDuration: 60 days,
            requiredDocuments: new string[](1)
        });
        
        // Other - Riesgo personalizado
        categoryParams[ProjectTypes.ProjectCategory.Other] = ProjectTypes.CategoryParams({
            riskLevel: ProjectTypes.RiskLevel.Medium,
            minStakingPercentage: 2000, // 20%
            maxFundingTarget: 40 ether,
            platformFee: 400, // 4%
            minDuration: 30 days,
            maxDuration: 90 days,
            requiredDocuments: new string[](2)
        });
    }
    
    /**
     * @dev Determina el nivel de riesgo basado en la categoría
     */
    function _getRiskLevel(ProjectTypes.ProjectCategory category) internal pure returns (ProjectTypes.RiskLevel) {
        if (category == ProjectTypes.ProjectCategory.Electronics) {
            return ProjectTypes.RiskLevel.High;
        } else if (
            category == ProjectTypes.ProjectCategory.Fashion ||
            category == ProjectTypes.ProjectCategory.Health ||
            category == ProjectTypes.ProjectCategory.Business
        ) {
            return ProjectTypes.RiskLevel.Medium;
        } else {
            return ProjectTypes.RiskLevel.Low;
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Transfiere administración
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin address");
        admin = newAdmin;
    }
    
    /**
     * @dev Recupera ETH atrapado en el contrato
     */
    function recoverETH(uint256 amount) external onlyAdmin {
        payable(admin).transfer(amount);
    }
    
    /**
     * @dev Pausa/despausa la fábrica
     */
    function setPaused(bool paused) external onlyAdmin {
        if (paused) {
            _pause();
        } else {
            _unpause();
        }
    }
}

// ============ INTERFACE PARA UNIVERSAL PROJECT ============

/**
 * @title IUniversalProject
 * @dev Interfaz para interactuar con contratos UniversalProject
 */
interface IUniversalProject {
    function getProjectDetails(uint256 projectId) external view returns (ProjectTypes.ProjectDetails memory);
    function getProjectStatus(uint256 projectId) external view returns (ProjectTypes.ProjectStatus);
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
    function setStakingContract(address _stakingContract) external;
    function setRevenueContract(address _revenueContract) external;
}