// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./ProjectTypes.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/IRevenue.sol";
import "../utils/Pausable.sol";
import "../utils/ReentrancyGuard.sol";

/**
 * @title UniversalProject
 * @dev Contrato principal que gestiona el ciclo de vida completo de cada proyecto
 */
contract UniversalProject is Pausable, ReentrancyGuard {
    using ProjectTypes for ProjectTypes.ProjectDetails;
    using ProjectTypes for ProjectTypes.Investment;
    
    // ============ STATE VARIABLES ============
    
    uint256 private _projectIdCounter;
    address public platformFactory;
    address public stakingContract;
    address public revenueContract;
    
    mapping(uint256 => ProjectTypes.ProjectDetails) public projects;
    mapping(uint256 => mapping(address => ProjectTypes.Investment)) public investments;
    mapping(uint256 => address[]) public projectInvestors;
    mapping(uint256 => ProjectTypes.ReturnDetails) public returnDetails;
    
    // ============ EVENTS ============
    
    event ProjectCreated(uint256 indexed projectId, address indexed organizer);
    event ProjectFunded(uint256 indexed projectId, uint256 totalRaised);
    event InvestmentMade(uint256 indexed projectId, address indexed investor, uint256 amount);
    event StatusUpdated(uint256 indexed projectId, ProjectTypes.ProjectStatus newStatus);
    event ProjectCompleted(uint256 indexed projectId, uint256 totalRevenue);
    event ProjectCancelled(uint256 indexed projectId);
    event ReturnsClaimed(uint256 indexed projectId, address indexed investor, uint256 amount);
    event ProgressUpdated(uint256 indexed projectId, string progressReport);
    
    // ============ MODIFIERS ============
    
    modifier onlyOrganizer(uint256 projectId) {
        require(
            projects[projectId].organizer == msg.sender,
            "Only project organizer"
        );
        _;
    }
    
    modifier onlyPlatform() {
        require(msg.sender == platformFactory, "Only platform");
        _;
    }
    
    modifier validProject(uint256 projectId) {
        require(projectId <= _projectIdCounter && projectId > 0, "Invalid project ID");
        _;
    }
    
    modifier inStatus(uint256 projectId, ProjectTypes.ProjectStatus status) {
        require(projects[projectId].status == status, "Invalid project status");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _platformFactory) {
        platformFactory = _platformFactory;
        _projectIdCounter = 0;
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
    ) external whenNotPaused returns (uint256) {
        require(targetAmount > 0, "Target amount must be positive");
        require(duration >= 30 days, "Duration too short");
        require(projectedROI <= 5000, "ROI too high");
        require(stakingContract != address(0), "Staking contract not set");
        
        _projectIdCounter++;
        uint256 newProjectId = _projectIdCounter;
        
        projects[newProjectId] = ProjectTypes.ProjectDetails({
            id: newProjectId,
            name: name,
            description: description,
            category: category,
            productName: productName,
            targetAmount: targetAmount,
            currentAmount: 0,
            projectedROI: projectedROI,
            duration: duration,
            marketAnalysis: marketAnalysis,
            organizer: msg.sender,
            status: ProjectTypes.ProjectStatus.Draft,
            createdAt: block.timestamp,
            deadline: block.timestamp + duration,
            investorCount: 0,
            supplierInfo: supplierInfo,
            logisticsPlan: logisticsPlan
        });
        
        // Calcular y requerir garantía inicial
        uint256 requiredCollateral = IStaking(stakingContract).calculateRequiredCollateral(
            category,
            targetAmount,
            msg.sender
        );
        
        require(
            IStaking(stakingContract).getStakedAmount(newProjectId, msg.sender) >= requiredCollateral,
            "Insufficient collateral"
        );
        
        // Cambiar estado a Active después de verificar garantía
        projects[newProjectId].status = ProjectTypes.ProjectStatus.Active;
        
        emit ProjectCreated(newProjectId, msg.sender);
        emit StatusUpdated(newProjectId, ProjectTypes.ProjectStatus.Active);
        
        return newProjectId;
    }
    
    /**
     * @dev Invertir en un proyecto
     */
    function invest(uint256 projectId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused
        validProject(projectId)
        inStatus(projectId, ProjectTypes.ProjectStatus.Active)
    {
        ProjectTypes.ProjectDetails storage project = projects[projectId];
        
        require(block.timestamp < project.deadline, "Funding period ended");
        require(msg.value >= ProjectTypes.MIN_INVESTMENT, "Investment too small");
        require(msg.value <= ProjectTypes.MAX_INVESTMENT, "Investment too large");
        require(project.currentAmount + msg.value <= project.targetAmount, "Target exceeded");
        
        // Registrar inversión
        if (investments[projectId][msg.sender].amount == 0) {
            projectInvestors[projectId].push(msg.sender);
            project.investorCount++;
        }
        
        investments[projectId][msg.sender] = ProjectTypes.Investment({
            investor: msg.sender,
            amount: investments[projectId][msg.sender].amount + msg.value,
            investedAt: block.timestamp,
            claimedReturns: false,
            expectedReturn: investments[projectId][msg.sender].expectedReturn + 
                (msg.value * (10000 + project.projectedROI)) / 10000
        });
        
        project.currentAmount += msg.value;
        
        // Verificar si se alcanzó la meta
        if (project.currentAmount >= project.targetAmount) {
            project.status = ProjectTypes.ProjectStatus.Funded;
            emit ProjectFunded(projectId, project.currentAmount);
            emit StatusUpdated(projectId, ProjectTypes.ProjectStatus.Funded);
        }
        
        emit InvestmentMade(projectId, msg.sender, msg.value);
    }
    
    /**
     * @dev Iniciar proyecto (solo organizador)
     */
    function startProject(uint256 projectId) 
        external 
        onlyOrganizer(projectId)
        validProject(projectId)
        inStatus(projectId, ProjectTypes.ProjectStatus.Funded)
    {
        projects[projectId].status = ProjectTypes.ProjectStatus.InProgress;
        emit StatusUpdated(projectId, ProjectTypes.ProjectStatus.InProgress);
        
        require(revenueContract != address(0), "Revenue contract not set");
        
        // Transferir fondos al organizador (menos fees)
        uint256 platformFee = IRevenue(revenueContract).calculatePlatformFee(
            projects[projectId].currentAmount,
            projects[projectId].category
        );
        
        uint256 amountToOrganizer = projects[projectId].currentAmount - platformFee;
        
        payable(projects[projectId].organizer).transfer(amountToOrganizer);
    }
    
    /**
     * @dev Actualizar progreso del proyecto
     */
    function updateProgress(uint256 projectId, string memory progressReport) 
        external 
        onlyOrganizer(projectId)
        validProject(projectId)
        inStatus(projectId, ProjectTypes.ProjectStatus.InProgress)
    {
        emit ProgressUpdated(projectId, progressReport);
    }
    
    /**
     * @dev Completar proyecto exitosamente
     */
    function completeProject(uint256 projectId, uint256 totalRevenue) 
        external 
        onlyOrganizer(projectId)
        validProject(projectId)
        inStatus(projectId, ProjectTypes.ProjectStatus.InProgress)
    {
        ProjectTypes.ProjectDetails storage project = projects[projectId];
        project.status = ProjectTypes.ProjectStatus.Completed;
        
        require(revenueContract != address(0), "Revenue contract not set");
        
        // Distribuir revenue
        (uint256 platformShare, uint256 investorShare, uint256 organizerShare) = 
            IRevenue(revenueContract).distributeRevenue(
                projectId,
                totalRevenue,
                project.currentAmount
            );
        
        returnDetails[projectId] = ProjectTypes.ReturnDetails({
            totalInvested: project.currentAmount,
            totalReturns: totalRevenue,
            platformRevenue: platformShare,
            organizerRevenue: organizerShare,
            distributedReturns: investorShare,
            distributionDate: block.timestamp,
            distributionCompleted: false
        });
        
        emit ProjectCompleted(projectId, totalRevenue);
        emit StatusUpdated(projectId, ProjectTypes.ProjectStatus.Completed);
    }
    
    /**
     * @dev Reclamar retornos de inversión
     */
    function claimReturns(uint256 projectId) 
        external 
        nonReentrant 
        validProject(projectId)
        inStatus(projectId, ProjectTypes.ProjectStatus.Completed)
    {
        ProjectTypes.Investment storage investment = investments[projectId][msg.sender];
        ProjectTypes.ReturnDetails storage returnsInfo = returnDetails[projectId];
        
        require(investment.amount > 0, "No investment");
        require(!investment.claimedReturns, "Already claimed");
        require(returnsInfo.distributedReturns > 0, "No returns to claim");
        
        uint256 share = (investment.amount * returnsInfo.distributedReturns) / returnsInfo.totalInvested;
        
        investment.claimedReturns = true;
        payable(msg.sender).transfer(share);
        
        emit ReturnsClaimed(projectId, msg.sender, share);
    }
    
    /**
     * @dev Cancelar proyecto y reembolsar inversiones
     */
    function cancelProject(uint256 projectId) 
        external 
        onlyOrganizer(projectId)
        validProject(projectId)
    {
        ProjectTypes.ProjectDetails storage project = projects[projectId];
        
        require(
            project.status == ProjectTypes.ProjectStatus.Active ||
            project.status == ProjectTypes.ProjectStatus.Draft,
            "Cannot cancel"
        );
        
        project.status = ProjectTypes.ProjectStatus.Cancelled;
        
        // Reembolsar inversiones si las hay
        if (project.currentAmount > 0) {
            for (uint256 i = 0; i < projectInvestors[projectId].length; i++) {
                address investor = projectInvestors[projectId][i];
                uint256 amount = investments[projectId][investor].amount;
                
                if (amount > 0) {
                    investments[projectId][investor].amount = 0;
                    payable(investor).transfer(amount);
                }
            }
        }
        
        emit ProjectCancelled(projectId);
        emit StatusUpdated(projectId, ProjectTypes.ProjectStatus.Cancelled);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getProjectDetails(uint256 projectId) 
        external 
        view 
        validProject(projectId)
        returns (ProjectTypes.ProjectDetails memory)
    {
        return projects[projectId];
    }
    
    function getInvestmentInfo(uint256 projectId, address investor) 
        external 
        view 
        validProject(projectId)
        returns (ProjectTypes.Investment memory)
    {
        return investments[projectId][investor];
    }
    
    function getProjectInvestors(uint256 projectId) 
        external 
        view 
        validProject(projectId)
        returns (address[] memory)
    {
        return projectInvestors[projectId];
    }
    
    function getProjectStatus(uint256 projectId) 
        external 
        view 
        validProject(projectId)
        returns (ProjectTypes.ProjectStatus)
    {
        return projects[projectId].status;
    }
    
    function getReturnDetails(uint256 projectId)
        external
        view
        validProject(projectId)
        returns (ProjectTypes.ReturnDetails memory)
    {
        return returnDetails[projectId];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function setStakingContract(address _stakingContract) external onlyPlatform {
        require(_stakingContract != address(0), "Invalid staking contract");
        stakingContract = _stakingContract;
    }
    
    function setRevenueContract(address _revenueContract) external onlyPlatform {
        require(_revenueContract != address(0), "Invalid revenue contract");
        revenueContract = _revenueContract;
    }
    
    function pause() external onlyPlatform {
        _pause();
    }
    
    function unpause() external onlyPlatform {
        _unpause();
    }
    
    // ============ FALLBACK ============
    
    receive() external payable {
        // Aceptar ETH para inversiones
    }
}