// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../core/ProjectTypes.sol";
import "../interfaces/IRevenue.sol";
import "../interfaces/IUniversalProject.sol";
import "../utils/Pausable.sol";
import "../utils/ReentrancyGuard.sol";

/**
 * @title RevenueDistribution
 * @dev Sistema de distribución de ingresos y gestión de fees
 */
contract RevenueDistribution is IRevenue, Pausable, ReentrancyGuard {
    // ============ STATE VARIABLES ============
    
    address public platformFactory;
    address public treasury;
    
    uint256 public totalPlatformRevenue;
    uint256 public totalDistributed;
    
    // projectId -> ReturnDetails
    mapping(uint256 => ProjectTypes.ReturnDetails) public returnDetails;
    
    // category -> FeeStructure
    mapping(ProjectTypes.ProjectCategory => FeeStructure) public feeStructures;
    
    // user -> discount percentage (in basis points)
    mapping(address => uint256) public feeDiscounts;
    
    // ============ STRUCTS ============
    
    struct FeeStructure {
        uint256 platformFee;        // Fee base de plataforma (basis points)
        uint256 successFee;         // Fee de éxito sobre ganancias (basis points)
        uint256 minFee;             // Fee mínimo
        uint256 maxFee;             // Fee máximo
    }
    
    // ============ CONSTANTS ============
    
    uint256 public constant MAX_FEE = 1000; // 10% máximo
    uint256 public constant MIN_FEE = 50;   // 0.5% mínimo
    
    // ============ MODIFIERS ============
    
    modifier onlyPlatform() {
        require(msg.sender == platformFactory, "Only platform factory");
        _;
    }
    
    modifier validFee(uint256 fee) {
        require(fee >= MIN_FEE && fee <= MAX_FEE, "Invalid fee amount");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _platformFactory, address _treasury) Pausable() {
        platformFactory = _platformFactory;
        treasury = _treasury;
        _initializeDefaultFeeStructures();
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Calcular fee de plataforma para un proyecto
     */
    function calculatePlatformFee(uint256 amount, ProjectTypes.ProjectCategory category) 
        public // ✅ Cambiado de external a public
        view 
        override 
        returns (uint256) 
    {
        FeeStructure memory fees = feeStructures[category];
        uint256 fee = (amount * fees.platformFee) / ProjectTypes.BASIS_POINTS;
        
        // Aplicar límites
        fee = min(max(fee, fees.minFee), fees.maxFee);
        
        return fee;
    }
    
    /**
     * @dev Calcular fee de éxito sobre ganancias
     */
    function calculateSuccessFee(uint256 profits) 
        public // ✅ Cambiado de external a public
        view 
        override 
        returns (uint256) 
    {
        // Fee estándar de éxito del 5% sobre ganancias
        return (profits * 500) / ProjectTypes.BASIS_POINTS;
    }
    
    /**
     * @dev Distribuir revenue de proyecto exitoso
     */
    function distributeRevenue(
        uint256 projectId,
        uint256 totalRevenue,
        uint256 totalInvested
    ) external override onlyPlatform returns (
        uint256 platformShare, 
        uint256 investorShare, 
        uint256 organizerShare
    ) {
        require(totalRevenue >= totalInvested, "Revenue must cover investment");
        
        uint256 profits = totalRevenue - totalInvested;
        
        // Calcular fees
        ProjectTypes.ProjectDetails memory project = IUniversalProject(_getProjectAddress(projectId)).getProjectDetails(projectId);
        
        uint256 platformFee = calculatePlatformFee(totalInvested, project.category); // ✅ Ahora funciona
        uint256 successFee = calculateSuccessFee(profits); // ✅ Ahora funciona
        
        platformShare = platformFee + successFee;
        investorShare = totalInvested; // Los inversores recuperan su inversión
        organizerShare = profits - successFee; // Organizador se queda con ganancias menos success fee
        
        // Registrar detalles de distribución
        returnDetails[projectId] = ProjectTypes.ReturnDetails({
            totalInvested: totalInvested,
            totalReturns: totalRevenue,
            platformRevenue: platformShare,
            organizerRevenue: organizerShare,
            distributedReturns: investorShare,
            distributionDate: block.timestamp,
            distributionCompleted: true
        });
        
        totalPlatformRevenue += platformShare;
        totalDistributed += investorShare + organizerShare;
        
        // Transferir fees a treasury
        payable(treasury).transfer(platformShare);
        
        emit RevenueDistributed(projectId, platformShare, investorShare, organizerShare);
        
        return (platformShare, investorShare, organizerShare);
    }
    
    /**
     * @dev Reclamar revenue de plataforma
     */
    function claimPlatformRevenue() external override onlyPlatform {
        uint256 balance = address(this).balance;
        require(balance > 0, "No revenue to claim");
        
        uint256 amount = balance;
        totalPlatformRevenue += amount;
        
        payable(treasury).transfer(amount);
        
        emit PlatformRevenueClaimed(msg.sender, amount);
    }
    
    /**
     * @dev Obtener share de inversor
     */
    function getInvestorShare(uint256 projectId, address investor) 
        external 
        view 
        override 
        returns (uint256) 
    {
        ProjectTypes.ReturnDetails memory returnsInfo = returnDetails[projectId];
        if (returnsInfo.distributedReturns == 0) return 0;
        
        ProjectTypes.Investment memory investment = IUniversalProject(_getProjectAddress(projectId)).getInvestmentInfo(projectId, investor);
        
        return (investment.amount * returnsInfo.distributedReturns) / returnsInfo.totalInvested;
    }
    
    /**
     * @dev Obtener estructura de fees por categoría
     */
    function getFeeStructure(ProjectTypes.ProjectCategory category) 
        external 
        view 
        override 
        returns (
            uint256 platformFee,
            uint256 successFee,
            uint256 minFee,
            uint256 maxFee
        )
    {
        FeeStructure memory fees = feeStructures[category];
        return (fees.platformFee, 500, fees.minFee, fees.maxFee); // success fee fijo en 5%
    }
    
    /**
     * @dev Obtener descuento de fee para usuario
     */
    function getFeeDiscount(address user) 
        external 
        view 
        override 
        returns (uint256 discountPercentage) 
    {
        return feeDiscounts[user];
    }
    
    /**
     * @dev Actualizar descuento de fee
     */
    function updateFeeDiscount(address user, uint256 newDiscount) 
        external 
        override 
        onlyPlatform 
    {
        require(newDiscount <= 5000, "Discount too high"); // Máximo 50% de descuento
        feeDiscounts[user] = newDiscount;
        
        emit FeeDiscountUpdated(user, newDiscount);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Configurar estructura de fees por categoría
     */
    function setFeeStructure(
        ProjectTypes.ProjectCategory category,
        uint256 platformFee,
        uint256 minFee,
        uint256 maxFee
    ) external onlyPlatform validFee(platformFee) {
        feeStructures[category] = FeeStructure({
            platformFee: platformFee,
            successFee: 500, // 5% fijo
            minFee: minFee,
            maxFee: maxFee
        });
    }
    
    /**
     * @dev Actualizar address del treasury
     */
    function setTreasury(address _treasury) external onlyPlatform {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }
    
    /**
     * @dev Retirar fondos de treasury
     */
    function withdrawTreasury(uint256 amount, address recipient) 
        external 
        override 
        onlyPlatform 
    {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(recipient).transfer(amount);
        
        emit TreasuryWithdrawn(recipient, amount);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getPlatformRevenue() external view override returns (uint256) {
        return totalPlatformRevenue;
    }
    
    function getTreasuryBalance() external view override returns (uint256) {
        return address(this).balance;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _initializeDefaultFeeStructures() internal {
        // Electronics - Alto riesgo, higher fees
        feeStructures[ProjectTypes.ProjectCategory.Electronics] = FeeStructure({
            platformFee: 500, // 5%
            successFee: 500,  // 5%
            minFee: 0.1 ether,
            maxFee: 10 ether
        });
        
        // Fashion - Medio riesgo
        feeStructures[ProjectTypes.ProjectCategory.Fashion] = FeeStructure({
            platformFee: 400, // 4%
            successFee: 500,  // 5%
            minFee: 0.05 ether,
            maxFee: 5 ether
        });
        
        // Health - Medio riesgo
        feeStructures[ProjectTypes.ProjectCategory.Health] = FeeStructure({
            platformFee: 450, // 4.5%
            successFee: 500,  // 5%
            minFee: 0.08 ether,
            maxFee: 8 ether
        });
        
        // Sports - Bajo riesgo
        feeStructures[ProjectTypes.ProjectCategory.Sports] = FeeStructure({
            platformFee: 300, // 3%
            successFee: 500,  // 5%
            minFee: 0.03 ether,
            maxFee: 3 ether
        });
        
        // Other - Riesgo medio
        feeStructures[ProjectTypes.ProjectCategory.Other] = FeeStructure({
            platformFee: 400, // 4%
            successFee: 500,  // 5%
            minFee: 0.05 ether,
            maxFee: 5 ether
        });
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
    
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }
    
    // ============ FALLBACK ============
    
    receive() external payable {
        // Aceptar ETH para revenue
    }
}