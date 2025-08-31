// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/LendingFactory.sol";

contract ApproveBorrowerScript is Script {
    function run() external {
        uint256 ownerPrivateKey = 0x4e052752f2c90d314feaffd6e2523b0610bde326e78e37ab32c3d9543d1a6493;
        vm.startBroadcast(ownerPrivateKey);
        
        LendingFactory factory = LendingFactory(0x31f4EbbD96a4795312423B1DF10dDA5A9120Bc78);
        
        // Aprueba tu dirección como borrower
        factory.approveBorrower(0x24C6d96509017DCe1b465cE38df6871eef74639b);
        
        vm.stopBroadcast();
    }
}