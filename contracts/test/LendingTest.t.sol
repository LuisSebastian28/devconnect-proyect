// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/LendingProject.sol";

contract LendingTest is Test {
    LendingProject project;
    // ✅ Usar direcciones que NO sean precompilados
    address borrower = address(0x100);
    address lender1 = address(0x200); 
    address lender2 = address(0x300);
    address lender3 = address(0x400);
    
    uint256 constant LOAN_AMOUNT = 10 ether;
    uint256 constant INTEREST_RATE = 1000;
    uint256 constant DURATION_DAYS = 30;
    
    event Default(address borrower, uint256 amountLost);
    event Funded(address lender, uint256 amount);
    event LoanFunded(uint256 totalRaised);
    event LoanRepaid(uint256 totalRepayment);
    
    function setUp() public {
    // Dar ETH a todos los participantes
    vm.deal(borrower, 100 ether);
    vm.deal(lender1, 100 ether);
    vm.deal(lender2, 100 ether);
    vm.deal(lender3, 100 ether);
    
    // ✅ Ahora el constructor necesita 4 argumentos: borrower + los 3 originales
    vm.prank(borrower);
    project = new LendingProject(borrower, LOAN_AMOUNT, INTEREST_RATE, DURATION_DAYS);
}
    function testProjectCreation() public view {
        assertEq(project.borrower(), borrower);
        assertEq(project.loanAmount(), LOAN_AMOUNT);
        assertEq(project.interestRate(), INTEREST_RATE);
        assertEq(project.totalRaised(), 0);
        assertFalse(project.loanFunded());
        assertFalse(project.loanRepaid());
    }
    
    function testLenderContribution() public {
        vm.prank(lender1);
        project.lend{value: 3 ether}();
        
        assertEq(project.totalRaised(), 3 ether);
        assertEq(project.lenders(lender1), 3 ether);
    }
    
    function testLoanBecomesFunded() public {
        // Lender 1 aporta 3 ETH
        vm.prank(lender1);
        project.lend{value: 3 ether}();
        
        // Lender 2 aporta 7 ETH - alcanza los 10 ETH
        vm.prank(lender2);
        project.lend{value: 7 ether}();
        
        assertEq(project.totalRaised(), 10 ether);
        assertTrue(project.loanFunded());
    }
    
    function testBorrowerWithdraw() public {
        fundLoanCompletely();
        
        uint256 contractBalanceBefore = address(project).balance; // 10 ETH
        uint256 borrowerBalanceBefore = borrower.balance; // 100 ETH
        
        vm.prank(borrower);
        project.withdrawLoan();
        
        // Borrower recibe 10 ETH, contrato queda con 0 ETH
        assertEq(borrower.balance, borrowerBalanceBefore + LOAN_AMOUNT);
        assertEq(address(project).balance, contractBalanceBefore - LOAN_AMOUNT);
        assertTrue(project.loanWithdrawn()); // ✅ Nuevo check
    }

    function testLoanRepayment() public {
        fundLoanCompletely();
        vm.prank(borrower);
        project.withdrawLoan();
        
        uint256 contractBalanceBefore = address(project).balance; // 0 ETH
        
        // Borrower repaga 11 ETH
        vm.prank(borrower);
        project.repayLoan{value: 11 ether}();
        
        assertTrue(project.loanRepaid());
        assertEq(address(project).balance, contractBalanceBefore + 11 ether); // 11 ETH
    }
    
    function testLenderDistributionAfterRepayment() public {
        // Setup complete loan cycle
        fundLoanCompletely();
        vm.prank(borrower);
        project.withdrawLoan();
        vm.prank(borrower);
        project.repayLoan{value: 11 ether}();
        
        // Check balances before distribution
        uint256 lender1BalanceBefore = lender1.balance;
        uint256 lender2BalanceBefore = lender2.balance;
        
        // Distribute to lenders
        project.distributeToLenders();
        
        // Lender1 should get 3.3 ETH (3/10 * 11)
        assertEq(lender1.balance, lender1BalanceBefore + 3.3 ether);
        // Lender2 should get 7.7 ETH (7/10 * 11)  
        assertEq(lender2.balance, lender2BalanceBefore + 7.7 ether);
    }
    
    function testRefundIfNotFunded() public {
        // Lender aporta pero no se alcanza la meta
        vm.prank(lender1);
        project.lend{value: 5 ether}();
        
        // Avanzar el tiempo más allá del deadline
        vm.warp(block.timestamp + 31 days);
        
        // Lender puede reclamar refund
        uint256 balanceBefore = lender1.balance;
        vm.prank(lender1);
        project.claimRefund();
        
        assertEq(lender1.balance, balanceBefore + 5 ether);
        assertEq(project.lenders(lender1), 0);
    }
    
    function testDefaultHandling() public {
        fundLoanCompletely();
        vm.prank(borrower);
        project.withdrawLoan();
        
        // Avanzar más allá del repayment deadline
        vm.warp(block.timestamp + DURATION_DAYS * 1 days + 1);
        
        // Debería marcarse como default - usar expectEmit correctamente
        vm.expectEmit(true, true, false, true, address(project));
        emit Default(borrower, LOAN_AMOUNT);
        project.handleDefault();
    }
    
    function testGetLoanDetails() public view {
    (address detailsBorrower, 
     uint256 detailsLoanAmount, 
     uint256 detailsInterestRate,
     uint256 detailsDuration,          
     uint256 detailsTotalRaised,
     uint256 detailsRepaymentDeadline, 
     bool detailsFunded,
     bool detailsRepaid) = project.getLoanDetails();
    
    assertEq(detailsBorrower, borrower);
    assertEq(detailsLoanAmount, LOAN_AMOUNT);
    assertEq(detailsInterestRate, INTEREST_RATE);
    assertEq(detailsDuration, DURATION_DAYS * 1 days); 
    assertEq(detailsTotalRaised, 0);
    assertEq(detailsRepaymentDeadline, 0); 
    assertFalse(detailsFunded);
    assertFalse(detailsRepaid);
}
    
    // Helper function to fully fund the loan
    function fundLoanCompletely() internal {
        vm.prank(lender1);
        project.lend{value: 3 ether}();
        
        vm.prank(lender2);
        project.lend{value: 7 ether}();
    }
    
    // Test edge cases
    function testCannotLendAfterDeadline() public {
        vm.warp(block.timestamp + 31 days);
        
        vm.prank(lender1);
        vm.expectRevert("Funding period ended");
        project.lend{value: 1 ether}();
    }
    
    function testCannotWithdrawIfNotFunded() public {
        vm.prank(borrower);
        vm.expectRevert("Loan not fully funded");
        project.withdrawLoan();
    }
    
    function testCannotRepayIfNotFunded() public {
        vm.prank(borrower);
        vm.expectRevert("Loan not funded");
        project.repayLoan{value: 11 ether}();
    }
}