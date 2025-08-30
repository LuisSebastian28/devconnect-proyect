// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title ProjectTypes
 * @dev Librería que contiene todas las estructuras, enumeraciones y tipos
 * utilizados en la plataforma de crowdlending
 */
library ProjectTypes {
    
    // ============ ENUMS ============
    
    /**
     * @dev Estados posibles de un proyecto
     */
    enum ProjectStatus {
        Draft,      // Borrador - en creación
        Active,     // Activo - aceptando inversiones
        Funded,     // Financiado - meta alcanzada
        InProgress, // En progreso - ejecutándose
        Completed,  // Completado - exitoso
        Failed,     // Fallido - no se cumplió
        Cancelled   // Cancelado - por el organizador
    }
    
    /**
     * @dev Categorías principales de proyectos
     */
    enum ProjectCategory {
        Electronics,    // Dispositivos electrónicos
        Fashion,        // Moda y accesorios
        Health,         // Salud y belleza
        Sports,         // Deportes y recreación
        Home,           // Hogar y jardín
        Business,       // Equipos empresariales
        Collectibles,   // Coleccionables y lujo
        Other           // Otras categorías
    }
    
    /**
     * @dev Niveles de riesgo para categorías
     */
    enum RiskLevel {
        Low,        // Bajo riesgo
        Medium,     // Riesgo medio
        High        // Alto riesgo
    }
    
    /**
     * @dev Tipos de usuarios en la plataforma
     */
    enum UserType {
        Investor,   // Inversor
        Organizer,  // Organizador de proyectos
        Admin,      // Administrador
        Validator   // Validador de proyectos
    }
    
    // ============ STRUCTS ============
    
    /**
     * @dev Estructura principal de detalles del proyecto
     */
    struct ProjectDetails {
        uint256 id;                 // ID único del proyecto
        string name;                // Nombre del proyecto
        string description;         // Descripción detallada
        ProjectCategory category;   // Categoría del proyecto
        string productName;         // Nombre específico del producto
        uint256 targetAmount;       // Meta de financiamiento (en wei)
        uint256 currentAmount;      // Monto actual recaudado (en wei)
        uint256 projectedROI;       // ROI proyectado (en basis points, 10000 = 100%)
        uint256 duration;           // Duración en días
        string marketAnalysis;      // Hash IPFS del análisis de mercado
        address organizer;          // Address del organizador
        ProjectStatus status;       // Estado actual del proyecto
        uint256 createdAt;          // Timestamp de creación
        uint256 deadline;           // Timestamp de deadline
        uint256 investorCount;      // Número de inversores
        string supplierInfo;        // Información del proveedor (IPFS hash)
        string logisticsPlan;       // Plan logístico (IPFS hash)
    }
    
    /**
     * @dev Estructura para inversiones individuales
     */
    struct Investment {
        address investor;           // Address del inversor
        uint256 amount;             // Monto invertido (en wei)
        uint256 investedAt;         // Timestamp de la inversión
        bool claimedReturns;        // Si ya reclamó retornos
        uint256 expectedReturn;     // Retorno esperado (en wei)
    }
    
    /**
     * @dev Estructura para parámetros de categoría
     */
    struct CategoryParams {
        RiskLevel riskLevel;                // Nivel de riesgo
        uint256 minStakingPercentage;       // % mínimo de garantía (en basis points)
        uint256 maxFundingTarget;           // Máximo financiamiento permitido
        uint256 platformFee;                // Fee de plataforma (en basis points)
        uint256 minDuration;                // Duración mínima en días
        uint256 maxDuration;                // Duración máxima en días
        string[] requiredDocuments;         // Documentos requeridos
    }
    
    /**
     * @dev Estructura para detalles de retornos
     */
    struct ReturnDetails {
        uint256 totalInvested;          // Total invertido
        uint256 totalReturns;           // Total de retornos
        uint256 platformRevenue;        // Revenue para plataforma
        uint256 organizerRevenue;       // Revenue para organizador
        uint256 distributedReturns;     // Retornos distribuidos
        uint256 distributionDate;       // Fecha de distribución
        bool distributionCompleted;     // Si se completó distribución
    }
    
    /**
     * @dev Estructura para información de garantías
     */
    struct CollateralInfo {
        uint256 stakedAmount;           // Monto en garantía
        uint256 stakedAt;               // Timestamp de staking
        uint256 unlockTime;             // Tiempo de desbloqueo
        bool slashed;                   // Si fue penalizado
        uint256 slashedAmount;          // Monto penalizado
    }
    
    /**
     * @dev Estructura para información de reputación
     */
    struct ReputationInfo {
        uint256 score;              // Puntaje de reputación (0-1000)
        string level;               // Nivel actual
        uint256 totalProjects;      // Total de proyectos
        uint256 successfulProjects; // Proyectos exitosos
        uint256 failedProjects;     // Proyectos fallidos
        uint256 badgeCount;         // Número de badges
        uint256 lastUpdated;        // Timestamp de última actualización
    }
    
    // ============ CONSTANTS ============
    
    uint256 public constant BASIS_POINTS = 10000; // 100.00%
    uint256 public constant MIN_INVESTMENT = 0.001 ether; // 0.001 ETH
    uint256 public constant MAX_INVESTMENT = 1000 ether; // 1000 ETH
    
    // ============ MODIFIERS ============
    
    /**
     * @dev Modifier para verificar que una dirección no sea zero
     */
    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }
    
    /**
     * @dev Modifier para verificar que un amount sea válido
     */
    modifier validAmount(uint256 amount) {
        require(amount > 0, "Amount must be greater than 0");
        _;
    }
    
    // ============ EVENTS ============
    
    event ProjectCreated(uint256 indexed projectId, address indexed organizer);
    event InvestmentMade(uint256 indexed projectId, address indexed investor, uint256 amount);
    event StatusUpdated(uint256 indexed projectId, ProjectStatus newStatus);
    
    // ============ ERROR MESSAGES ============
    
    error InsufficientBalance();
    error ProjectNotActive();
    error InvestmentTooSmall();
    error InvestmentTooLarge();
    error InvalidProjectStatus();
    error UnauthorizedAccess();
}