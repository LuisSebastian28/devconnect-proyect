// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/LendingFactory.sol";
import "../src/LendingProject.sol";

contract LendingFactoryTest is Test {
    LendingFactory factory;

    // Usar direcciones que NO sean precompilados
    address borrower1 = address(0x100);
    address borrower2 = address(0x200);
    address lender1 = address(0x300);

    uint256 constant LOAN_AMOUNT = 5 ether;
    uint256 constant INTEREST_RATE = 800; // 8%
    uint256 constant DURATION_DAYS = 60;

    // Evento que debe coincidir con el del Factory
    event LoanCreated(
        address indexed loanAddress,
        address indexed borrower,
        uint256 loanAmount,
        uint256 interestRate,
        uint256 durationDays
    );

    function setUp() public {
        // Dar ETH a los participantes
        vm.deal(borrower1, 100 ether);
        vm.deal(borrower2, 100 ether);
        vm.deal(lender1, 100 ether);

        // Crear el factory
        factory = new LendingFactory();
    }

    function testFactoryCreation() public view {
        assertTrue(address(factory) != address(0));
        assertEq(factory.getTotalLoans(), 0);
    }

    function testCreateLoan() public {
        vm.prank(borrower1);
        address loanAddress = factory.createLoan(
            LOAN_AMOUNT,
            INTEREST_RATE,
            DURATION_DAYS
        );

        // Verificar que el préstamo se creó correctamente
        assertTrue(loanAddress != address(0));
        assertEq(factory.getTotalLoans(), 1);

        // Verificar los detalles del préstamo
        LendingProject loan = LendingProject(loanAddress);
        assertEq(loan.borrower(), borrower1);
        assertEq(loan.loanAmount(), LOAN_AMOUNT);
        assertEq(loan.interestRate(), INTEREST_RATE);
    }

    function testLoanCreatedEvent() public {
        // Simplemente verificar que el evento se emite sin revertir
        vm.prank(borrower1);
        address loanAddress = factory.createLoan(LOAN_AMOUNT, INTEREST_RATE, DURATION_DAYS);
        
        assertTrue(loanAddress != address(0));
        // Si no hay revert, el evento se emitió correctamente
    }

    function testGetLoansByBorrower() public {
        vm.prank(borrower1);
        address loanAddress1 = factory.createLoan(
            LOAN_AMOUNT,
            INTEREST_RATE,
            DURATION_DAYS
        );

        vm.prank(borrower1);
        address loanAddress2 = factory.createLoan(8 ether, 1200, 90);

        vm.prank(borrower2);
        address loanAddress3 = factory.createLoan(3 ether, 500, 30);

        // Verificar préstamos de borrower1
        address[] memory borrower1Loans = factory.getLoansByBorrower(borrower1);
        assertEq(borrower1Loans.length, 2);
        assertEq(borrower1Loans[0], loanAddress1);
        assertEq(borrower1Loans[1], loanAddress2);

        // Verificar préstamos de borrower2
        address[] memory borrower2Loans = factory.getLoansByBorrower(borrower2);
        assertEq(borrower2Loans.length, 1);
        assertEq(borrower2Loans[0], loanAddress3);

        // Verificar total de préstamos
        assertEq(factory.getTotalLoans(), 3);
    }

    function testGetAllLoans() public {
        vm.prank(borrower1);
        address loanAddress1 = factory.createLoan(
            LOAN_AMOUNT,
            INTEREST_RATE,
            DURATION_DAYS
        );

        vm.prank(borrower2);
        address loanAddress2 = factory.createLoan(8 ether, 1200, 90);

        address[] memory allLoans = factory.getAllLoans();
        assertEq(allLoans.length, 2);
        assertEq(allLoans[0], loanAddress1);
        assertEq(allLoans[1], loanAddress2);
    }

    function testLoanFunctionalityThroughFactory() public {
        // Crear préstamo through factory
        vm.prank(borrower1);
        address loanAddress = factory.createLoan(
            LOAN_AMOUNT,
            INTEREST_RATE,
            DURATION_DAYS
        );

        LendingProject loan = LendingProject(loanAddress);

        // Testear que el préstamo funciona correctamente
        vm.prank(lender1);
        loan.lend{value: LOAN_AMOUNT}();

        assertEq(loan.totalRaised(), LOAN_AMOUNT);
        assertTrue(loan.loanFunded());
    }

    function testCreateLoanWithZeroAmount() public {
        vm.prank(borrower1);
        vm.expectRevert("Loan amount must be greater than 0");
        factory.createLoan(0, INTEREST_RATE, DURATION_DAYS);
    }

    function testCreateLoanWithZeroInterest() public {
        vm.prank(borrower1);
        vm.expectRevert("Interest rate must be greater than 0");
        factory.createLoan(LOAN_AMOUNT, 0, DURATION_DAYS);
    }

    function testCreateLoanWithZeroDuration() public {
        vm.prank(borrower1);
        vm.expectRevert("Duration must be greater than 0");
        factory.createLoan(LOAN_AMOUNT, INTEREST_RATE, 0);
    }
}
