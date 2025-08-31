// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract LendingProject {
    address public borrower;
    uint256 public loanAmount;
    uint256 public interestRate;
    uint256 public duration;
    uint256 public totalRaised;
    uint256 public deadline;
    uint256 public repaymentDeadline;
    uint256 public borrowerStake;
    bool public loanFunded;
    bool public loanRepaid;
    bool public loanWithdrawn;
    
    address public factory;
    uint256 public constant STAKE_PERCENTAGE = 10; // 10% de stake
    
    mapping(address => uint256) public lenders;
    address[] public lenderAddresses;
    
    // EVENTOS CORREGIDOS
    event Funded(address lender, uint256 amount);
    event LoanFunded(uint256 totalRaised);
    event LoanRepaid(uint256 totalRepayment);
    event Default(address borrower, uint256 amountLost);
    event Refunded(address lender, uint256 amount);
    event StakeDeposited(address indexed borrower, uint256 amount); // ✅ CORREGIDO
    
    constructor(
        address _borrower,
        uint256 _loanAmount,
        uint256 _interestRate, 
        uint256 _durationDays
    ) payable {
        require(msg.value > 0, "Stake required");
        
        borrower = _borrower;
        loanAmount = _loanAmount;
        interestRate = _interestRate;
        duration = _durationDays * 1 days;
        deadline = block.timestamp + 30 days;
        factory = msg.sender;
        
        // Calcular y verificar stake (10% del loan amount)
        uint256 requiredStake = (_loanAmount * STAKE_PERCENTAGE) / 100;
        require(msg.value >= requiredStake, "Insufficient stake");
        borrowerStake = msg.value;
        
        emit StakeDeposited(_borrower, msg.value); // ✅ CORREGIDO
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
        require(!loanWithdrawn, "Loan already withdrawn");
        require(!loanRepaid, "Loan already repaid");
        
        loanWithdrawn = true;
        payable(borrower).transfer(loanAmount);
    }
    
    function repayLoan() external payable {
        require(msg.sender == borrower, "Only borrower");
        require(loanFunded, "Loan not funded");
        require(loanWithdrawn, "Loan not withdrawn");
        require(!loanRepaid, "Loan already repaid");
        require(block.timestamp <= repaymentDeadline, "Loan defaulted");
        
        uint256 totalRepayment = loanAmount + (loanAmount * interestRate) / 10000;
        require(msg.value >= totalRepayment, "Insufficient repayment");
        
        loanRepaid = true;
        
        // Devolver stake al borrower + exceso de pago
        uint256 excess = msg.value - totalRepayment;
        if (excess > 0) {
            payable(borrower).transfer(excess);
        }
        
        emit LoanRepaid(totalRepayment);
    }
    
    function claimRefund() external {
        require(block.timestamp >= deadline, "Funding period not ended");
        require(!loanFunded, "Loan was funded");
        require(lenders[msg.sender] > 0, "No funds to refund");
        
        uint256 amount = lenders[msg.sender];
        lenders[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit Refunded(msg.sender, amount);
    }
    
    function distributeToLenders() external {
        require(loanRepaid, "Loan not repaid");
        require(address(this).balance > 0, "No funds to distribute");
        
        uint256 totalToDistribute = address(this).balance;
        for (uint256 i = 0; i < lenderAddresses.length; i++) {
            address lender = lenderAddresses[i];
            uint256 share = (lenders[lender] * totalToDistribute) / totalRaised;
            payable(lender).transfer(share);
        }
    }
    
    function handleDefault() external {
        require(block.timestamp > repaymentDeadline, "Not defaulted yet");
        require(!loanRepaid, "Loan was repaid");
        require(loanFunded, "Loan not funded");
        
        // Liquidar stake del borrower a lenders
        uint256 totalToDistribute = borrowerStake;
        for (uint256 i = 0; i < lenderAddresses.length; i++) {
            address lender = lenderAddresses[i];
            uint256 share = (lenders[lender] * totalToDistribute) / totalRaised;
            payable(lender).transfer(share);
        }
        
        emit Default(borrower, loanAmount);
    }
    
    function getLoanDetails() external view returns (
        address, uint256, uint256, uint256, uint256, uint256, bool, bool, uint256
    ) {
        return (
            borrower,
            loanAmount,
            interestRate,
            duration,
            totalRaised,
            repaymentDeadline,
            loanFunded,
            loanRepaid,
            borrowerStake
        );
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }
}