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

    // NUEVAS FUNCIONALIDADES PARA IMPORTACIÓN
    struct ProductInfo {
        string productName;
        string description;
        string category;
        string originCountry;
        uint256 estimatedCost;
        uint256 expectedSalePrice;
        uint256 expectedROI; // ROI en basis points (100 = 1%)
        string businessPlan;
    }

    ProductInfo public productInfo;

    // Milestones del proceso de importación
    enum MilestoneStatus {
        Pending,
        Completed,
        Failed
    }

    struct Milestone {
        string description;
        uint256 targetDate;
        MilestoneStatus status;
        string evidence; // URL o hash de evidencia
    }

    Milestone[] public milestones;
    uint256 public completedMilestones;

    // Eventos
    event Funded(address lender, uint256 amount);
    event LoanFunded(uint256 totalRaised);
    event LoanRepaid(uint256 totalRepayment);
    event Default(address borrower, uint256 amountLost);
    event Refunded(address lender, uint256 amount);
    event StakeDeposited(address indexed borrower, uint256 amount);
    event MilestoneCompleted(uint256 indexed milestoneId, string evidence);
    event MilestoneFailed(uint256 indexed milestoneId, string reason);
    event ProductInfoUpdated(string productName, uint256 expectedROI);

    constructor(
        address _borrower,
        uint256 _loanAmount,
        uint256 _interestRate,
        uint256 _durationDays,
        ProductInfo memory _productInfo
    ) payable {
        require(msg.value > 0, "Stake required");
        require(_productInfo.expectedROI > 0, "ROI must be positive");
        require(
            bytes(_productInfo.productName).length > 0,
            "Product name required"
        );

        borrower = _borrower;
        loanAmount = _loanAmount;
        interestRate = _interestRate;
        duration = _durationDays * 1 days;
        deadline = block.timestamp + 30 days;
        factory = msg.sender;
        productInfo = _productInfo;

        // Calcular y verificar stake (10% del loan amount)
        uint256 requiredStake = (_loanAmount * STAKE_PERCENTAGE) / 100;
        require(msg.value >= requiredStake, "Insufficient stake");
        borrowerStake = msg.value;

        // Crear milestones por defecto
        _createDefaultMilestones(_durationDays);

        emit StakeDeposited(_borrower, msg.value);
        emit ProductInfoUpdated(
            _productInfo.productName,
            _productInfo.expectedROI
        );
    }

    function _createDefaultMilestones(uint256 _durationDays) internal {
        uint256 quarterDuration = _durationDays / 4;

        milestones.push(
            Milestone({
                description: "Payment made to supplier",
                targetDate: block.timestamp + (quarterDuration * 1 days),
                status: MilestoneStatus.Pending,
                evidence: ""
            })
        );

        milestones.push(
            Milestone({
                description: "Product shipped from origin",
                targetDate: block.timestamp + (quarterDuration * 2 * 1 days),
                status: MilestoneStatus.Pending,
                evidence: ""
            })
        );

        milestones.push(
            Milestone({
                description: "Product arrived at destination",
                targetDate: block.timestamp + (quarterDuration * 3 * 1 days),
                status: MilestoneStatus.Pending,
                evidence: ""
            })
        );

        milestones.push(
            Milestone({
                description: "PRoduct ready for sale",
                targetDate: block.timestamp + (_durationDays * 1 days),
                status: MilestoneStatus.Pending,
                evidence: ""
            })
        );
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

        // FÓRMULA CORREGIDA: Cálculo correcto de intereses
        uint256 totalRepayment = loanAmount +
            (loanAmount * interestRate) /
            10000;
        require(msg.value >= totalRepayment, "Insufficient repayment");

        loanRepaid = true;

        // Devolver stake al borrower + exceso de pago
        uint256 totalToReturn = borrowerStake + (msg.value - totalRepayment);
        if (totalToReturn > 0) {
            payable(borrower).transfer(totalToReturn);
        }

        emit LoanRepaid(totalRepayment);
    }

    // NUEVAS FUNCIONES PARA MILESTONES
    function completeMilestone(
        uint256 _milestoneId,
        string memory _evidence
    ) external {
        require(msg.sender == borrower, "Only borrower");
        require(_milestoneId < milestones.length, "Invalid milestone");
        require(
            milestones[_milestoneId].status == MilestoneStatus.Pending,
            "Milestone not pending"
        );

        milestones[_milestoneId].status = MilestoneStatus.Completed;
        milestones[_milestoneId].evidence = _evidence;
        completedMilestones++;

        emit MilestoneCompleted(_milestoneId, _evidence);
    }

    function failMilestone(
        uint256 _milestoneId,
        string memory _reason
    ) external {
        require(msg.sender == borrower, "Only borrower");
        require(_milestoneId < milestones.length, "Invalid milestone");
        require(
            milestones[_milestoneId].status == MilestoneStatus.Pending,
            "Milestone not pending"
        );

        milestones[_milestoneId].status = MilestoneStatus.Failed;

        emit MilestoneFailed(_milestoneId, _reason);
    }

    function updateProductInfo(
        string memory _businessPlan,
        uint256 _expectedSalePrice
    ) external {
        require(msg.sender == borrower, "Only borrower");
        require(!loanFunded, "Cannot update after funding");

        productInfo.businessPlan = _businessPlan;
        productInfo.expectedSalePrice = _expectedSalePrice;

        // Recalcular ROI esperado
        if (productInfo.estimatedCost > 0) {
            productInfo.expectedROI =
                ((_expectedSalePrice - productInfo.estimatedCost) * 10000) /
                productInfo.estimatedCost;
        }

        emit ProductInfoUpdated(
            productInfo.productName,
            productInfo.expectedROI
        );
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

        // Liquidar stake del borrower a lenders proporcionalmente
        uint256 totalToDistribute = borrowerStake;
        for (uint256 i = 0; i < lenderAddresses.length; i++) {
            address lender = lenderAddresses[i];
            uint256 share = (lenders[lender] * totalToDistribute) / totalRaised;
            payable(lender).transfer(share);
        }

        emit Default(borrower, loanAmount);
    }

    // GETTERS MEJORADOS
    function getProductInfo() external view returns (ProductInfo memory) {
        return productInfo;
    }

    function getMilestone(
        uint256 _milestoneId
    ) external view returns (Milestone memory) {
        require(_milestoneId < milestones.length, "Invalid milestone");
        return milestones[_milestoneId];
    }

    function getAllMilestones() external view returns (Milestone[] memory) {
        return milestones;
    }

    function getProjectProgress()
        external
        view
        returns (uint256 completed, uint256 total)
    {
        return (completedMilestones, milestones.length);
    }

    function getLoanDetails()
        external
        view
        returns (
            address,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            bool,
            bool,
            uint256
        )
    {
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

    // Función para calcular ROI real vs esperado
    function calculateActualROI(
        uint256 _actualSaleAmount
    ) external view returns (uint256) {
        require(
            _actualSaleAmount > productInfo.estimatedCost,
            "Sale amount too low"
        );
        return
            ((_actualSaleAmount - productInfo.estimatedCost) * 10000) /
            productInfo.estimatedCost;
    }
}
