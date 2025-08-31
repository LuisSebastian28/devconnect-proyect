// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/LendingFactory.sol";
import "../src/LendingProject.sol";

contract LendingFactoryTest is Test {
    LendingFactory factory;

    address owner = address(0x100);
    address borrower1 = address(0x200);
    address borrower2 = address(0x300);
    address lender1 = address(0x400);

    uint256 constant LOAN_AMOUNT = 5 ether;
    uint256 constant DURATION_DAYS = 60;

    function setUp() public {
        vm.deal(owner, 100 ether);
        vm.deal(borrower1, 100 ether);
        vm.deal(borrower2, 100 ether);
        vm.deal(lender1, 100 ether);

        vm.prank(owner);
        factory = new LendingFactory();

        // Aprobar borrowers
        vm.prank(owner);
        factory.approveBorrower(borrower1);
        
        vm.prank(owner);
        factory.approveBorrower(borrower2);
    }

    function testFactoryCreation() public view {
        assertTrue(address(factory) != address(0));
        assertEq(factory.getTotalLoans(), 0);
    }

    function testCreateLoan() public {
        vm.prank(borrower1);
        address loanAddress = factory.createLoan{value: 0.5 ether}(
            LOAN_AMOUNT,
            DURATION_DAYS
        );

        assertTrue(loanAddress != address(0));
        assertEq(factory.getTotalLoans(), 1);

        LendingProject loan = LendingProject(loanAddress);
        assertEq(loan.borrower(), borrower1);
        assertEq(loan.loanAmount(), LOAN_AMOUNT);
        assertTrue(loan.interestRate() >= 500 && loan.interestRate() <= 2500);
    }

    function testGetLoansByBorrower() public {
        vm.prank(borrower1);
        address loanAddress1 = factory.createLoan{value: 0.5 ether}(
            LOAN_AMOUNT,
            DURATION_DAYS
        );

        vm.prank(borrower1);
        address loanAddress2 = factory.createLoan{value: 0.8 ether}(8 ether, 90);

        vm.prank(borrower2);
        address loanAddress3 = factory.createLoan{value: 0.3 ether}(3 ether, 30);

        address[] memory borrower1Loans = factory.getLoansByBorrower(borrower1);
        assertEq(borrower1Loans.length, 2);
        assertEq(borrower1Loans[0], loanAddress1);
        assertEq(borrower1Loans[1], loanAddress2);

        address[] memory borrower2Loans = factory.getLoansByBorrower(borrower2);
        assertEq(borrower2Loans.length, 1);
        assertEq(borrower2Loans[0], loanAddress3);

        assertEq(factory.getTotalLoans(), 3);
    }

    function testGetAllLoans() public {
        vm.prank(borrower1);
        address loanAddress1 = factory.createLoan{value: 0.5 ether}(
            LOAN_AMOUNT,
            DURATION_DAYS
        );

        vm.prank(borrower2);
        address loanAddress2 = factory.createLoan{value: 0.8 ether}(8 ether, 90);

        address[] memory allLoans = factory.getAllLoans();
        assertEq(allLoans.length, 2);
        assertEq(allLoans[0], loanAddress1);
        assertEq(allLoans[1], loanAddress2);
    }

    function testCannotCreateLoanWithoutApproval() public {
        address unapproved = address(0x999);
        vm.deal(unapproved, 100 ether);

        vm.prank(unapproved);
        vm.expectRevert("Not approved borrower");
        factory.createLoan(LOAN_AMOUNT, DURATION_DAYS);
    }

    function testCreateLoanWithZeroAmount() public {
        vm.prank(borrower1);
        vm.expectRevert("Invalid loan amount");
        factory.createLoan(0, DURATION_DAYS);
    }

    function testCreateLoanWithInvalidDuration() public {
        vm.prank(borrower1);
        vm.expectRevert("Invalid duration");
        factory.createLoan(LOAN_AMOUNT, 1); // Menos de 7 días
    }   
}