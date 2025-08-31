// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./LendingProject.sol";

contract LendingFactory {
    address public owner;
    uint256 public constant MIN_LOAN_AMOUNT = 0.1 ether;
    uint256 public constant MAX_LOAN_AMOUNT = 1000 ether;
    uint256 public constant MIN_DURATION = 7;  
    uint256 public constant MAX_DURATION = 365;
    
    address[] public allLoans;
    mapping(address => address[]) public loansByBorrower;
    mapping(address => bool) public approvedBorrowers;

    event LoanCreated(address indexed loanAddress, address indexed borrower, uint256 loanAmount, uint256 interestRate, uint256 durationDays);
    event BorrowerApproved(address indexed borrower);
    event BorrowerRevoked(address indexed borrower);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyApprovedBorrower() {
        require(approvedBorrowers[msg.sender], "Not approved borrower");
        _;
    }

    function approveBorrower(address _borrower) external onlyOwner {
        approvedBorrowers[_borrower] = true;
        emit BorrowerApproved(_borrower);
    }

    function revokeBorrower(address _borrower) external onlyOwner {
        approvedBorrowers[_borrower] = false;
        emit BorrowerRevoked(_borrower);
    }

    function calculateInterestRate(uint256 _loanAmount, uint256 _durationDays) public pure returns (uint256) {
        // interés base + riesgo por plazo + riesgo por monto
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
        uint256 _durationDays
    ) external payable onlyApprovedBorrower returns (address) {
        require(_loanAmount >= MIN_LOAN_AMOUNT && _loanAmount <= MAX_LOAN_AMOUNT, "Invalid loan amount");
        require(_durationDays >= MIN_DURATION && _durationDays <= MAX_DURATION, "Invalid duration");
        
        // Verificar que el borrower envió el stake suficiente
        uint256 requiredStake = (_loanAmount * 10) / 100;
        require(msg.value >= requiredStake, "Insufficient stake");
        
        uint256 interestRate = calculateInterestRate(_loanAmount, _durationDays);

        // Pasar el stake al constructor de LendingProject
        LendingProject newLoan = new LendingProject{value: msg.value}(
            msg.sender,
            _loanAmount,
            interestRate,
            _durationDays
        );

        address loanAddress = address(newLoan);
        allLoans.push(loanAddress);
        loansByBorrower[msg.sender].push(loanAddress);

        emit LoanCreated(loanAddress, msg.sender, _loanAmount, interestRate, _durationDays);
        return loanAddress;
    }

    function getAllLoans() external view returns (address[] memory) {
        return allLoans;
    }

    function getLoansByBorrower(address _borrower) external view returns (address[] memory) {
        return loansByBorrower[_borrower];
    }

    function getTotalLoans() external view returns (uint256) {
        return allLoans.length;
    }
}