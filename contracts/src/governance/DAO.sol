// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../tokens/GovernanceToken.sol";

/**
 * @title SimpleDAO
 * @dev Gobierno completamente personalizado sin OpenZeppelin Governor
 */
contract SimpleDAO {
    GovernanceToken public governanceToken;
    
    struct Proposal {
        address proposer;
        address[] targets;
        uint256[] values;
        bytes[] calldatas;
        string description;
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        mapping(address => bool) voted;
    }
    
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    uint256 public votingDelay = 1;
    uint256 public votingPeriod = 50400;
    uint256 public quorumPercentage = 4;
    uint256 public proposalThreshold = 1000 * 10**18;
    
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event ProposalExecuted(uint256 indexed proposalId);
    
    constructor(GovernanceToken _governanceToken) {
        governanceToken = _governanceToken;
    }
    
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) external returns (uint256) {
        require(governanceToken.getPastVotes(msg.sender, block.number - 1) >= proposalThreshold, "Below threshold");
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.proposer = msg.sender;
        proposal.targets = targets;
        proposal.values = values;
        proposal.calldatas = calldatas;
        proposal.description = description;
        proposal.startBlock = block.number + votingDelay;
        proposal.endBlock = block.number + votingDelay + votingPeriod;
        
        emit ProposalCreated(proposalId, msg.sender, description);
        return proposalId;
    }
    
    function execute(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.number > proposal.endBlock, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal failed");
        require((proposal.forVotes + proposal.againstVotes) >= (governanceToken.totalSupply() * quorumPercentage) / 100, "Quorum not reached");
        
        proposal.executed = true;
        
        for (uint256 i = 0; i < proposal.targets.length; i++) {
            (bool success, ) = proposal.targets[i].call{value: proposal.values[i]}(proposal.calldatas[i]);
            require(success, "Execution failed");
        }
        
        emit ProposalExecuted(proposalId);
    }
}