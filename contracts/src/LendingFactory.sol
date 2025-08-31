// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./LendingProject.sol";

contract LendingFactory {
    // Array para guardar todas las direcciones de préstamos creados
    address[] public allLoans;

    // Mapeo para tracking de préstamos por borrower
    mapping(address => address[]) public loansByBorrower;

    // Eventos
    event LoanCreated(
        address indexed loanAddress,
        address indexed borrower,
        uint256 loanAmount,
        uint256 interestRate,
        uint256 durationDays
    );

    // Función para crear un nuevo préstamo
    function createLoan(
        uint256 _loanAmount,
        uint256 _interestRate,
        uint256 _durationDays
    ) external returns (address) {
        require(_loanAmount > 0, "Loan amount must be greater than 0");
        require(_interestRate > 0, "Interest rate must be greater than 0");
        require(_durationDays > 0, "Duration must be greater than 0");

        // Pasar msg.sender (el borrower real) al constructor
        LendingProject newLoan = new LendingProject(
            msg.sender,
            _loanAmount,
            _interestRate,
            _durationDays
        );

        address loanAddress = address(newLoan);
        allLoans.push(loanAddress);
        loansByBorrower[msg.sender].push(loanAddress);

        emit LoanCreated(
            loanAddress,
            msg.sender, 
            _loanAmount,
            _interestRate,
            _durationDays
        );

        return loanAddress;
    }

    // Obtener todos los préstamos creados
    function getAllLoans() external view returns (address[] memory) {
        return allLoans;
    }

    // Obtener préstamos de un borrower específico
    function getLoansByBorrower(
        address _borrower
    ) external view returns (address[] memory) {
        return loansByBorrower[_borrower];
    }

    // Obtener el número total de préstamos
    function getTotalLoans() external view returns (uint256) {
        return allLoans.length;
    }
}
