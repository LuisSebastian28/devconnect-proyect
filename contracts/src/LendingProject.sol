// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract LendingProject {
    // Información del préstamo
    address public borrower;
    uint256 public loanAmount;
    uint256 public interestRate;
    uint256 public duration;
    uint256 public totalRaised;
    uint256 public deadline;
    uint256 public repaymentDeadline;
    bool public loanFunded;
    bool public loanRepaid;
    bool public loanWithdrawn;
    
    mapping(address => uint256) public lenders;
    address[] public lenderAddresses;
    
    event Funded(address lender, uint256 amount);
    event LoanFunded(uint256 totalRaised);
    event LoanRepaid(uint256 totalRepayment);
    event Default(address borrower, uint256 amountLost);
    
    constructor(
    address _borrower,  
    uint256 _loanAmount,
    uint256 _interestRate, 
    uint256 _durationDays
) {
    borrower = _borrower;
    loanAmount = _loanAmount;
    interestRate = _interestRate;
    duration = _durationDays * 1 days;
    deadline = block.timestamp + 30 days;
}
    
    function lend() external payable {
        require(block.timestamp < deadline, "Funding period ended");
        require(!loanFunded, "Loan already funded");
        require(msg.value > 0, "Must send ETH");
        
        if (lenders[msg.sender] == 0) {
            lenderAddresses.push(msg.sender);
        }
        lenders[msg.sender] += msg.value;
        totalRaised += msg.value;
        
        emit Funded(msg.sender, msg.value);
        
        if (totalRaised >= loanAmount && !loanFunded) {
            loanFunded = true;
            repaymentDeadline = block.timestamp + duration;
            emit LoanFunded(totalRaised);
        }
    }
    
    function withdrawLoan() external {
        require(msg.sender == borrower, "Only borrower");
        require(loanFunded, "Loan not fully funded");
        require(!loanWithdrawn, "Loan already withdrawn"); // ✅ Nuevo check
        require(!loanRepaid, "Loan already repaid");
        
        loanWithdrawn = true; // ✅ Marcar como retirado
        payable(borrower).transfer(loanAmount);
    }
    
    function repayLoan() external payable {
        require(loanFunded, "Loan not funded");
        require(loanWithdrawn, "Loan not withdrawn"); // ✅ Asegurar que se retiró
        require(!loanRepaid, "Loan already repaid");
        require(block.timestamp <= repaymentDeadline, "Loan defaulted");
        
        uint256 totalRepayment = loanAmount + (loanAmount * interestRate) / 10000;
        require(msg.value >= totalRepayment, "Insufficient repayment");
        
        loanRepaid = true;
        emit LoanRepaid(totalRepayment);
    }
    
    // Distribuir reembolsos si no se consigue el funding
    function claimRefund() external {
        require(block.timestamp >= deadline, "Funding period not ended");
        require(!loanFunded, "Loan was funded");
        require(lenders[msg.sender] > 0, "No funds to refund");
        
        uint256 amount = lenders[msg.sender];
        lenders[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
    
    // Distribuir fondos a lenders después del repago
    function distributeToLenders() external {
        require(loanRepaid, "Loan not repaid");
        
        uint256 totalRepayment = address(this).balance;
        for (uint256 i = 0; i < lenderAddresses.length; i++) {
            address lender = lenderAddresses[i];
            uint256 share = (lenders[lender] * totalRepayment) / totalRaised;
            payable(lender).transfer(share);
        }
    }
    
    // Handle default (después de deadline)
    function handleDefault() external {
        require(block.timestamp > repaymentDeadline, "Not defaulted yet");
        require(!loanRepaid, "Loan was repaid");
        
        // Aquí iría la lógica de liquidación de colateral
        // Por ahora solo emitimos evento
        emit Default(borrower, loanAmount);
    }
    
    // Get detalles del préstamo
    function getLoanDetails() external view returns (
        address,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        bool,
        bool
    ) {
        return (
            borrower,
            loanAmount,
            interestRate,
            duration,
            totalRaised,
            repaymentDeadline,
            loanFunded,
            loanRepaid
        );
    }
}