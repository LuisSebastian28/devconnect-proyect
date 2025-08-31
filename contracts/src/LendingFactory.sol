// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./LendingProject.sol";

contract LendingFactory {
    address public owner;
    uint256 public constant MIN_LOAN_AMOUNT = 0.1 ether;
    uint256 public constant MAX_LOAN_AMOUNT = 1000 ether;
    uint256 public constant MIN_DURATION = 7;
    uint256 public constant MAX_DURATION = 365;
    uint256 public constant MIN_ROI = 500;
    uint256 public constant MAX_ROI = 5000;

    address[] public allLoans;
    mapping(address => address[]) public loansByBorrower;
    mapping(address => bool) public approvedBorrowers;
    mapping(string => bool) public usedProductNames;

    // Categorías permitidas
    mapping(string => bool) public allowedCategories;
    string[] public categoryList;

    event LoanCreated(
        address indexed loanAddress,
        address indexed borrower,
        uint256 loanAmount,
        uint256 interestRate,
        uint256 durationDays,
        string productName,
        uint256 expectedROI
    );
    event BorrowerApproved(address indexed borrower);
    event BorrowerRevoked(address indexed borrower);
    event CategoryAdded(string category);

    constructor() {
        owner = msg.sender;

        // Inicializar categorías por defecto
        _addCategory("Electronics");
        _addCategory("Vehicles");
        _addCategory("Machinery");
        _addCategory("Clothing");
        _addCategory("Home & Garden");
        _addCategory("Sports");
        _addCategory("Other");
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyApprovedBorrower() {
        require(approvedBorrowers[msg.sender], "Not approved borrower");
        _;
    }

    function _addCategory(string memory _category) internal {
        if (!allowedCategories[_category]) {
            allowedCategories[_category] = true;
            categoryList.push(_category);
        }
    }

    function addCategory(string memory _category) external onlyOwner {
        _addCategory(_category);
        emit CategoryAdded(_category);
    }

    function approveBorrower(address _borrower) external onlyOwner {
        approvedBorrowers[_borrower] = true;
        emit BorrowerApproved(_borrower);
    }

    function revokeBorrower(address _borrower) external onlyOwner {
        approvedBorrowers[_borrower] = false;
        emit BorrowerRevoked(_borrower);
    }

    function calculateInterestRate(
        uint256 _loanAmount,
        uint256 _durationDays
    ) public pure returns (uint256) {
        // Interés base + riesgo por plazo + riesgo por monto
        uint256 baseRate = 500; // 5% base
        uint256 durationRisk = (_durationDays * 10) / 30; // +1% por cada 30 días
        uint256 amountRisk = (_loanAmount * 100) / 1000 ether; // +1% por cada 1000 ETH

        uint256 totalInterest = baseRate + durationRisk + amountRisk;

        // Límites: mínimo 5%, máximo 25%
        if (totalInterest < 500) totalInterest = 500;
        if (totalInterest > 2500) totalInterest = 2500;

        return totalInterest;
    }

    function createLoan(
        uint256 _loanAmount,
        uint256 _durationDays,
        LendingProject.ProductInfo memory _productInfo
    ) external payable onlyApprovedBorrower returns (address) {
        // Validaciones básicas
        require(
            _loanAmount >= MIN_LOAN_AMOUNT && _loanAmount <= MAX_LOAN_AMOUNT,
            "Invalid loan amount"
        );
        require(
            _durationDays >= MIN_DURATION && _durationDays <= MAX_DURATION,
            "Invalid duration"
        );

        // Validaciones del producto
        require(
            bytes(_productInfo.productName).length > 0,
            "Product name required"
        );
        require(
            bytes(_productInfo.description).length > 0,
            "Description required"
        );
        require(allowedCategories[_productInfo.category], "Invalid category");
        require(
            !usedProductNames[_productInfo.productName],
            "Product name already used"
        );
        require(
            _productInfo.expectedROI >= MIN_ROI && _productInfo.expectedROI <= MAX_ROI,
            "Invalid ROI"
        );
        require(_productInfo.estimatedCost > 0, "Estimated cost required");
        require(
            _productInfo.expectedSalePrice > _productInfo.estimatedCost,
            "Sale price must exceed cost"
        );

        // Verificar que el borrower envió el stake suficiente
        uint256 requiredStake = (_loanAmount * 10) / 100;
        require(msg.value >= requiredStake, "Insufficient stake");

        uint256 interestRate = calculateInterestRate(
            _loanAmount,
            _durationDays
        );

        // Validar que el loan amount es consistente con el costo estimado
        require(
            _loanAmount <= (_productInfo.estimatedCost * 120) / 100,
            "Loan too high vs estimated cost"
        );

        // Marcar nombre del producto como usado
        usedProductNames[_productInfo.productName] = true;

        // Crear el proyecto con toda la información
        LendingProject newLoan = new LendingProject{value: msg.value}(
            msg.sender,
            _loanAmount,
            interestRate,
            _durationDays,
            _productInfo
        );

        address loanAddress = address(newLoan);
        allLoans.push(loanAddress);
        loansByBorrower[msg.sender].push(loanAddress);

        emit LoanCreated(
            loanAddress,
            msg.sender,
            _loanAmount,
            interestRate,
            _durationDays,
            _productInfo.productName,
            _productInfo.expectedROI
        );

        return loanAddress;
    }

    // FUNCIONES DE CONSULTA MEJORADAS
    function getAllLoans() external view returns (address[] memory) {
        return allLoans;
    }

    function getLoansByBorrower(
        address _borrower
    ) external view returns (address[] memory) {
        return loansByBorrower[_borrower];
    }

    function getTotalLoans() external view returns (uint256) {
        return allLoans.length;
    }

    function getCategories() external view returns (string[] memory) {
        return categoryList;
    }

    function isProductNameAvailable(
        string memory _productName
    ) external view returns (bool) {
        return !usedProductNames[_productName];
    }

    function isBorrowerApproved(
        address _borrower
    ) external view returns (bool) {
        return approvedBorrowers[_borrower];
    }

    // Función para obtener estadísticas de la plataforma
    function getPlatformStats()
        external
        view
        returns (
            uint256 totalProjects,
            uint256 totalBorrowers,
            string[] memory categories
        )
    {
        // Contar borrowers únicos
        uint256 uniqueBorrowers = 0;
        // Nota: Esta implementación es simplificada, en producción sería más eficiente

        return (allLoans.length, uniqueBorrowers, categoryList);
    }
}
