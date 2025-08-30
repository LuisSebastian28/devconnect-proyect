// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../core/ProjectTypes.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/IUniversalProject.sol";
import "../utils/Pausable.sol";
import "../utils/ReentrancyGuard.sol";
import "../interfaces/IReputationSystem.sol";




/**
 * @title StakingCollateral
 * @dev Sistema de garantías y staking para proyectos de crowdlending
 */
contract StakingCollateral is IStaking, Pausable, ReentrancyGuard {
    using ProjectTypes for ProjectTypes.CollateralInfo;
    
    // ============ STATE VARIABLES ============
    
    address public platformFactory;
    address public reputationContract;
    
    uint256 public totalStaked;
    uint256 public totalSlashed;
    uint256 public insurancePoolBalance;
    
    // projectId -> organizer -> CollateralInfo
    mapping(uint256 => mapping(address => ProjectTypes.CollateralInfo)) public collateralInfo;
    
    // organizer -> total staked amount
    mapping(address => uint256) public totalStakedByOrganizer;
    
    // organizer -> total slashed amount
    mapping(address => uint256) public totalSlashedByOrganizer;
    
    // projectId -> slashing appeals
    mapping(uint256 => bool) public slashingAppeals;
    
    // ============ CONSTANTS ============
    
    uint256 public constant MIN_STAKING_DURATION = 90 days;
    uint256 public constant SLASHING_PERCENTAGE = 5000; // 50%
    uint256 public constant INSURANCE_FEE_PERCENTAGE = 100; // 1% of slashed amount
    
    // ============ MODIFIERS ============
    
    modifier onlyPlatform() {
        require(msg.sender == platformFactory, "Only platform factory");
        _;
    }
    
    modifier onlyProject(uint256 projectId) {
        require(_isValidProject(projectId), "Invalid project");
        _;
    }
    
    modifier onlyOrganizer(uint256 projectId, address organizer) {
        require(
            IUniversalProject(_getProjectAddress(projectId)).getProjectDetails(projectId).organizer == organizer,
            "Only project organizer"
        );
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _platformFactory) Pausable() {
        platformFactory = _platformFactory;
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Aportar garantía para un proyecto
     */
    function stakeCollateral(uint256 projectId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused
        onlyProject(projectId)
    {
        require(msg.value > 0, "Staking amount must be greater than 0");
        
        ProjectTypes.ProjectDetails memory project = IUniversalProject(_getProjectAddress(projectId)).getProjectDetails(projectId);
        require(project.organizer == msg.sender, "Only project organizer can stake");
        
        uint256 requiredCollateral = calculateRequiredCollateral(
            project.category,
            project.targetAmount,
            msg.sender
        );
        
        uint256 currentStaked = collateralInfo[projectId][msg.sender].stakedAmount;
        require(currentStaked + msg.value >= requiredCollateral, "Insufficient collateral");
        
        // Actualizar información de staking
        collateralInfo[projectId][msg.sender] = ProjectTypes.CollateralInfo({
            stakedAmount: currentStaked + msg.value,
            stakedAt: block.timestamp,
            unlockTime: block.timestamp + MIN_STAKING_DURATION,
            slashed: false,
            slashedAmount: 0
        });
        
        totalStaked += msg.value;
        totalStakedByOrganizer[msg.sender] += msg.value;
        
        emit CollateralStaked(projectId, msg.sender, msg.value);
    }
    
    /**
     * @dev Retirar garantía después del período de bloqueo
     */
    function unstakeCollateral(uint256 projectId) 
        external 
        nonReentrant 
        onlyProject(projectId)
        onlyOrganizer(projectId, msg.sender)
    {
        ProjectTypes.CollateralInfo storage collateral = collateralInfo[projectId][msg.sender];
        ProjectTypes.ProjectDetails memory project = IUniversalProject(_getProjectAddress(projectId)).getProjectDetails(projectId);
        
        require(collateral.stakedAmount > 0, "No collateral staked");
        require(block.timestamp >= collateral.unlockTime, "Collateral still locked");
        require(!collateral.slashed, "Collateral was slashed");
        
        // Verificar que el proyecto esté completado o cancelado
        require(
            project.status == ProjectTypes.ProjectStatus.Completed ||
            project.status == ProjectTypes.ProjectStatus.Cancelled ||
            project.status == ProjectTypes.ProjectStatus.Failed,
            "Project must be completed, cancelled or failed"
        );
        
        uint256 amountToReturn = collateral.stakedAmount;
        
        // Resetear información de staking
        collateral.stakedAmount = 0;
        totalStaked -= amountToReturn;
        totalStakedByOrganizer[msg.sender] -= amountToReturn;
        
        // Transferir fondos de vuelta
        payable(msg.sender).transfer(amountToReturn);
        
        emit CollateralUnstaked(projectId, msg.sender, amountToReturn);
    }
    
    /**
     * @dev Aplicar penalización por incumplimiento
     */
    function slashCollateral(
        uint256 projectId,
        uint256 slashAmount,
        string calldata reason
    ) external onlyPlatform onlyProject(projectId) {
        ProjectTypes.ProjectDetails memory project = IUniversalProject(_getProjectAddress(projectId)).getProjectDetails(projectId);
        ProjectTypes.CollateralInfo storage collateral = collateralInfo[projectId][project.organizer];
        
        require(collateral.stakedAmount >= slashAmount, "Insufficient collateral to slash");
        require(!collateral.slashed, "Collateral already slashed");
        
        uint256 actualSlashAmount = (slashAmount * SLASHING_PERCENTAGE) / 10000;
        uint256 insuranceFee = (actualSlashAmount * INSURANCE_FEE_PERCENTAGE) / 10000;
        uint256 netSlashAmount = actualSlashAmount - insuranceFee;
        
        // Actualizar información de slashing
        collateral.slashed = true;
        collateral.slashedAmount = actualSlashAmount;
        collateral.stakedAmount -= actualSlashAmount;
        
        // Actualizar totals
        totalStaked -= actualSlashAmount;
        totalSlashed += actualSlashAmount;
        totalSlashedByOrganizer[project.organizer] += actualSlashAmount;
        insurancePoolBalance += insuranceFee;
        
        // Transferir al insurance pool y al que reportó (platform)
        payable(platformFactory).transfer(netSlashAmount);
        
        emit CollateralSlashed(projectId, actualSlashAmount, reason);
        
        // Actualizar reputación
        if (reputationContract != address(0)) {
            IReputationSystem(reputationContract).updateReputation(
                project.organizer,
                projectId,
                false
            );
        }
    }
    
    /**
     * @dev Apelar una penalización
     */
    function appealSlashing(uint256 projectId) 
        external 
        onlyProject(projectId)
        onlyOrganizer(projectId, msg.sender)
    {
        ProjectTypes.CollateralInfo storage collateral = collateralInfo[projectId][msg.sender];
        
        require(collateral.slashed, "No slashing to appeal");
        require(!slashingAppeals[projectId], "Appeal already in progress");
        
        slashingAppeals[projectId] = true;
        
        emit SlashingAppealed(projectId);
    }
    
    /**
     * @dev Reclamar seguro por proyecto fallido
     */
    function claimInsurance(uint256 projectId, address investor) 
        external 
        override
        onlyPlatform
        onlyProject(projectId)
    {
        ProjectTypes.ProjectDetails memory project = IUniversalProject(_getProjectAddress(projectId)).getProjectDetails(projectId);
        
        require(
            project.status == ProjectTypes.ProjectStatus.Failed ||
            project.status == ProjectTypes.ProjectStatus.Cancelled,
            "Project must be failed or cancelled"
        );
        
        uint256 investorShare = IUniversalProject(_getProjectAddress(projectId)).getInvestmentInfo(projectId, investor).amount;
        require(investorShare > 0, "No investment to insure");
        
        uint256 insuranceAmount = (investorShare * insurancePoolBalance) / (project.currentAmount);
        
        require(insuranceAmount <= insurancePoolBalance, "Insufficient insurance funds");
        
        insurancePoolBalance -= insuranceAmount;
        payable(investor).transfer(insuranceAmount);
        
        emit InsuranceClaimed(projectId, investor, insuranceAmount);
    }
    
    /**
     * @dev Calcular garantía requerida basada en categoría y monto
     */
    function calculateRequiredCollateral(
        ProjectTypes.ProjectCategory category,
        uint256 targetAmount,
        address organizer
    ) public view override returns (uint256) {
        uint256 basePercentage;
        
        // Porcentaje base según categoría
        if (category == ProjectTypes.ProjectCategory.Electronics) {
            basePercentage = 3000; // 30%
        } else if (category == ProjectTypes.ProjectCategory.Fashion) {
            basePercentage = 2000; // 20%
        } else if (category == ProjectTypes.ProjectCategory.Health) {
            basePercentage = 2500; // 25%
        } else if (category == ProjectTypes.ProjectCategory.Sports) {
            basePercentage = 1500; // 15%
        } else {
            basePercentage = 2000; // 20% para otras categorías
        }
        
        // Ajustar según reputación si está disponible
        if (reputationContract != address(0)) {
            uint256 reputationScore = IReputationSystem(reputationContract).getReputationScore(organizer);
            if (reputationScore > 500) { // Buen historial
                basePercentage = (basePercentage * 8000) / 10000; // Reducción del 20%
            } else if (reputationScore < 200) { // Mal historial
                basePercentage = (basePercentage * 12000) / 10000; // Aumento del 20%
            }
        }
        
        return (targetAmount * basePercentage) / 10000;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getStakedAmount(uint256 projectId, address organizer) 
        external 
        view 
        override 
        returns (uint256) 
    {
        return collateralInfo[projectId][organizer].stakedAmount;
    }
    
    function getInsurancePoolBalance() 
        external 
        view 
        override 
        returns (uint256) 
    {
        return insurancePoolBalance;
    }
    
    function getOrganizerStakingInfo(address organizer) 
        external 
        view 
        returns (
            uint256 totalStaked,
            uint256 totalSlashed,
            uint256 activeProjects
        ) 
    {
        totalStaked = totalStakedByOrganizer[organizer];
        totalSlashed = totalSlashedByOrganizer[organizer];
        // Puedes implementar lógica para contar proyectos activos si es necesario
        activeProjects = 0;
    }
    
    // ============ FUNCIONES FALTANTES DE IStaking ============
    
    /**
     * @dev Actualizar reputación del organizador (implementación de IStaking)
     */
    function updateReputation(
        address organizer,
        uint256 projectId,
        bool success
    ) external override onlyPlatform {
        // Esta función delega al contrato de reputación si existe
        if (reputationContract != address(0)) {
            IReputationSystem(reputationContract).updateReputation(organizer, projectId, success);
        }
    }
    
    /**
     * @dev Obtener puntaje de reputación (implementación de IStaking)
     */
    function getReputationScore(address organizer) 
        external 
        view 
        override 
        returns (uint256) 
    {
        if (reputationContract != address(0)) {
            return IReputationSystem(reputationContract).getReputationScore(organizer);
        }
        return 500; // Puntaje por defecto si no hay contrato de reputación
    }
    
    /**
     * @dev Obtener nivel de reputación (implementación de IStaking)
     */
    function getReputationLevel(address organizer) 
        external 
        view 
        override 
        returns (string memory) 
    {
        if (reputationContract != address(0)) {
            return IReputationSystem(reputationContract).getReputationLevel(organizer);
        }
        return "Neutral"; // Nivel por defecto
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function setReputationContract(address _reputationContract) external onlyPlatform {
        reputationContract = _reputationContract;
    }
    
    function setPlatformFactory(address _platformFactory) external onlyPlatform {
        platformFactory = _platformFactory;
    }
    
    function withdrawInsurancePool(uint256 amount, address recipient) external onlyPlatform {
        require(amount <= insurancePoolBalance, "Insufficient insurance pool balance");
        insurancePoolBalance -= amount;
        payable(recipient).transfer(amount);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _isValidProject(uint256 projectId) internal view returns (bool) {
        return _getProjectAddress(projectId) != address(0);
    }
    
    function _getProjectAddress(uint256 projectId) internal view returns (address) {
        (bool success, bytes memory data) = platformFactory.staticcall(
            abi.encodeWithSignature("projects(uint256)", projectId)
        );
        
        if (success && data.length == 32) {
            return abi.decode(data, (address));
        }
        
        return address(0);
    }
    
    // ============ FALLBACK ============
    
    receive() external payable {
        // Aceptar ETH para staking
    }
}