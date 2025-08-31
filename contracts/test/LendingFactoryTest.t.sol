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

    // Función helper para crear ProductInfo de prueba
    // In LendingFactoryTest.sol - update the helper function
    // In LendingFactoryTest.t.sol - update the helper function
    function createTestProductInfo(
        string memory productName,
        uint256 estimatedCost,
        uint256 expectedSalePrice
    ) internal pure returns (LendingProject.ProductInfo memory) {
        require(estimatedCost > 0, "Estimated cost must be greater than 0");

        uint256 expectedROI = ((expectedSalePrice - estimatedCost) * 10000) /
            estimatedCost;

        // Ensure ROI is within valid range (500-5000 = 5%-50%)
        require(
            expectedROI >= 500 && expectedROI <= 5000,
            "Test ROI out of range"
        );

        return
            LendingProject.ProductInfo({
                productName: productName,
                description: "Test product description",
                category: "Electronics",
                originCountry: "US",
                estimatedCost: estimatedCost,
                expectedSalePrice: expectedSalePrice,
                expectedROI: expectedROI,
                businessPlan: "Test business plan"
            });
    }

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
        LendingProject.ProductInfo memory productInfo = createTestProductInfo(
            "Test Product 1",
            LOAN_AMOUNT,
            (LOAN_AMOUNT * 11) / 10 // 10% ROI = 1000 (within 500-5000 range)
        );

        vm.prank(borrower1);
        address loanAddress = factory.createLoan{value: 0.5 ether}(
            LOAN_AMOUNT,
            DURATION_DAYS,
            productInfo
        );

        assertTrue(loanAddress != address(0));
        assertEq(factory.getTotalLoans(), 1);

        LendingProject loan = LendingProject(loanAddress);
        assertEq(loan.borrower(), borrower1);
        assertEq(loan.loanAmount(), LOAN_AMOUNT);
        assertTrue(loan.interestRate() >= 500 && loan.interestRate() <= 2500);
    }

    function testGetLoansByBorrower() public {
        LendingProject.ProductInfo memory productInfo1 = createTestProductInfo(
            "Product 1",
            5 ether,
            5.5 ether // 10% ROI = 1000
        );
        LendingProject.ProductInfo memory productInfo2 = createTestProductInfo(
            "Product 2",
            8 ether,
            8.8 ether // 10% ROI = 1000
        );
        LendingProject.ProductInfo memory productInfo3 = createTestProductInfo(
            "Product 3",
            3 ether,
            3.3 ether // 10% ROI = 1000
        );

        vm.prank(borrower1);
        address loanAddress1 = factory.createLoan{value: 0.5 ether}(
            LOAN_AMOUNT,
            DURATION_DAYS,
            productInfo1
        );

        vm.prank(borrower1);
        address loanAddress2 = factory.createLoan{value: 0.8 ether}(
            8 ether,
            90,
            productInfo2
        );

        vm.prank(borrower2);
        address loanAddress3 = factory.createLoan{value: 0.3 ether}(
            3 ether,
            30,
            productInfo3
        );

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
        LendingProject.ProductInfo memory productInfo1 = createTestProductInfo(
            "Product A",
            5 ether,
            5.5 ether // 10% ROI = 1000
        );
        LendingProject.ProductInfo memory productInfo2 = createTestProductInfo(
            "Product B",
            8 ether,
            8.8 ether // 10% ROI = 1000
        );

        vm.prank(borrower1);
        address loanAddress1 = factory.createLoan{value: 0.5 ether}(
            LOAN_AMOUNT,
            DURATION_DAYS,
            productInfo1
        );

        vm.prank(borrower2);
        address loanAddress2 = factory.createLoan{value: 0.8 ether}(
            8 ether,
            90,
            productInfo2
        );

        address[] memory allLoans = factory.getAllLoans();
        assertEq(allLoans.length, 2);
        assertEq(allLoans[0], loanAddress1);
        assertEq(allLoans[1], loanAddress2);
    }

    function testProductNameUniqueness() public {
        LendingProject.ProductInfo memory productInfo = createTestProductInfo(
            "Unique Product",
            5 ether,
            5.5 ether // 10% ROI = 1000
        );

        vm.prank(borrower1);
        address loanAddress1 = factory.createLoan{value: 0.5 ether}(
            LOAN_AMOUNT,
            DURATION_DAYS,
            productInfo
        );

        // Intentar crear otro préstamo con el mismo nombre
        vm.prank(borrower2);
        vm.expectRevert("Product name already used");
        factory.createLoan{value: 0.5 ether}(
            LOAN_AMOUNT,
            DURATION_DAYS,
            productInfo
        );
    }

    function testCannotCreateLoanWithoutApproval() public {
        address unapproved = address(0x999);
        vm.deal(unapproved, 100 ether);

        LendingProject.ProductInfo memory productInfo = createTestProductInfo(
            "Test Product",
            5 ether,
            5.5 ether // 10% ROI = 1000
        );

        vm.prank(unapproved);
        vm.expectRevert("Not approved borrower");
        factory.createLoan{value: 0.5 ether}(
            LOAN_AMOUNT,
            DURATION_DAYS,
            productInfo
        );
    }

    function testCreateLoanWithInvalidDuration() public {
        LendingProject.ProductInfo memory productInfo = createTestProductInfo(
            "Test Product",
            5 ether,
            5.5 ether // 10% ROI = 1000
        );

        vm.prank(borrower1);
        vm.expectRevert("Invalid duration");
        factory.createLoan{value: 0.5 ether}(
            LOAN_AMOUNT,
            1, // Menos de 7 días
            productInfo
        );
    }

    function testInvalidCategory() public {
        LendingProject.ProductInfo memory productInfo = createTestProductInfo(
            "Test Product",
            5 ether,
            5.5 ether // 10% ROI = 1000
        );
        productInfo.category = "InvalidCategory"; // Categoría no permitida

        vm.prank(borrower1);
        vm.expectRevert("Invalid category");
        factory.createLoan{value: 0.5 ether}(
            LOAN_AMOUNT,
            DURATION_DAYS,
            productInfo
        );
    }
}
