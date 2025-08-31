// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/LendingFactory.sol";
import "../src/LendingProject.sol";

contract CreateLoanScript is Script {
    function run() external {
        // Usar la private key directamente (agregar el prefijo 0x)
        uint256 deployerPrivateKey = 0x4e052752f2c90d314feaffd6e2523b0610bde326e78e37ab32c3d9543d1a6493;
        vm.startBroadcast(deployerPrivateKey);

        LendingFactory factory = LendingFactory(0x31f4EbbD96a4795312423B1DF10dDA5A9120Bc78);
        
        LendingProject.ProductInfo memory productInfo = LendingProject.ProductInfo({
            productName: "TestProduct",
            description: "Test Description",
            category: "Electronics",
            originCountry: "US",
            estimatedCost: 5 ether,
            expectedSalePrice: 5.5 ether,
            expectedROI: 1000, // 10%
            businessPlan: "Test Business Plan"
        });

        factory.createLoan{value: 0.5 ether}(
            5 ether,
            30,
            productInfo
        );

        vm.stopBroadcast();
    }
}