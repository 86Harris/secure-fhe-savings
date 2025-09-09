// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract SecureFHESavings is SepoliaConfig {
    using FHE for *;
    
    struct Vault {
        euint32 balance;           // Encrypted balance
        euint32 interestRate;      // Encrypted interest rate (basis points)
        euint32 lastUpdateTime;    // Last interest calculation time
        euint32 totalInterest;     // Total accrued interest
        bool isLocked;             // Vault lock status
        bool isActive;             // Vault active status
        address owner;             // Vault owner
        uint256 createdAt;         // Creation timestamp
    }
    
    struct Deposit {
        euint32 amount;            // Encrypted deposit amount
        address depositor;         // Depositor address
        uint256 timestamp;         // Deposit timestamp
        bool isWithdrawn;          // Withdrawal status
    }
    
    struct Withdrawal {
        euint32 amount;            // Encrypted withdrawal amount
        address withdrawer;        // Withdrawer address
        uint256 timestamp;         // Withdrawal timestamp
        bool isProcessed;          // Processing status
    }
    
    mapping(address => Vault) public vaults;
    mapping(uint256 => Deposit) public deposits;
    mapping(uint256 => Withdrawal) public withdrawals;
    mapping(address => euint32) public userReputation;
    
    uint256 public depositCounter;
    uint256 public withdrawalCounter;
    uint256 public constant BASE_RATE = 10000; // 100% in basis points
    uint256 public constant MIN_DEPOSIT = 100; // Minimum deposit amount
    uint256 public constant MAX_DEPOSIT = 1000000; // Maximum deposit amount
    
    address public owner;
    address public verifier;
    bool public contractPaused;
    
    event VaultCreated(address indexed user, uint256 timestamp);
    event DepositMade(address indexed user, uint256 indexed depositId, uint32 amount);
    event WithdrawalRequested(address indexed user, uint256 indexed withdrawalId, uint32 amount);
    event InterestCalculated(address indexed user, uint32 interest);
    event VaultLocked(address indexed user, bool isLocked);
    event ReputationUpdated(address indexed user, uint32 reputation);
    event ContractPaused(bool isPaused);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyVerifier() {
        require(msg.sender == verifier, "Only verifier can call this function");
        _;
    }
    
    modifier whenNotPaused() {
        require(!contractPaused, "Contract is paused");
        _;
    }
    
    modifier vaultExists(address user) {
        require(vaults[user].owner != address(0), "Vault does not exist");
        _;
    }
    
    constructor(address _verifier) {
        owner = msg.sender;
        verifier = _verifier;
    }
    
    function createVault(
        externalEuint32 initialDeposit,
        bytes calldata inputProof
    ) public payable whenNotPaused returns (bool) {
        require(vaults[msg.sender].owner == address(0), "Vault already exists");
        require(msg.value >= 0.01 ether, "Insufficient ETH for gas");
        
        // Convert external encrypted value to internal
        euint32 internalDeposit = FHE.fromExternal(initialDeposit, inputProof);
        
        // Create new vault
        vaults[msg.sender] = Vault({
            balance: internalDeposit,
            interestRate: FHE.asEuint32(850), // 8.5% APY in basis points
            lastUpdateTime: FHE.asEuint32(uint32(block.timestamp)),
            totalInterest: FHE.asEuint32(0),
            isLocked: true,
            isActive: true,
            owner: msg.sender,
            createdAt: block.timestamp
        });
        
        // Record deposit
        uint256 depositId = depositCounter++;
        deposits[depositId] = Deposit({
            amount: internalDeposit,
            depositor: msg.sender,
            timestamp: block.timestamp,
            isWithdrawn: false
        });
        
        emit VaultCreated(msg.sender, block.timestamp);
        emit DepositMade(msg.sender, depositId, 0); // Amount will be decrypted off-chain
        
        return true;
    }
    
    function deposit(
        externalEuint32 amount,
        bytes calldata inputProof
    ) public payable whenNotPaused vaultExists(msg.sender) returns (uint256) {
        require(!vaults[msg.sender].isLocked, "Vault is locked");
        require(msg.value >= 0.01 ether, "Insufficient ETH for gas");
        
        // Convert external encrypted value to internal
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        
        // Calculate interest before adding new deposit
        _calculateInterest(msg.sender);
        
        // Add to vault balance
        vaults[msg.sender].balance = FHE.add(vaults[msg.sender].balance, internalAmount);
        
        // Record deposit
        uint256 depositId = depositCounter++;
        deposits[depositId] = Deposit({
            amount: internalAmount,
            depositor: msg.sender,
            timestamp: block.timestamp,
            isWithdrawn: false
        });
        
        emit DepositMade(msg.sender, depositId, 0); // Amount will be decrypted off-chain
        
        return depositId;
    }
    
    function requestWithdrawal(
        externalEuint32 amount,
        bytes calldata inputProof
    ) public whenNotPaused vaultExists(msg.sender) returns (uint256) {
        require(!vaults[msg.sender].isLocked, "Vault is locked");
        require(vaults[msg.sender].isActive, "Vault is not active");
        
        // Convert external encrypted value to internal
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        
        // Calculate interest before withdrawal
        _calculateInterest(msg.sender);
        
        // Record withdrawal request
        uint256 withdrawalId = withdrawalCounter++;
        withdrawals[withdrawalId] = Withdrawal({
            amount: internalAmount,
            withdrawer: msg.sender,
            timestamp: block.timestamp,
            isProcessed: false
        });
        
        emit WithdrawalRequested(msg.sender, withdrawalId, 0); // Amount will be decrypted off-chain
        
        return withdrawalId;
    }
    
    function processWithdrawal(
        uint256 withdrawalId,
        bool approved
    ) public onlyVerifier whenNotPaused {
        require(withdrawalId < withdrawalCounter, "Invalid withdrawal ID");
        require(!withdrawals[withdrawalId].isProcessed, "Withdrawal already processed");
        
        Withdrawal storage withdrawal = withdrawals[withdrawalId];
        address withdrawer = withdrawal.withdrawer;
        
        require(vaults[withdrawer].owner != address(0), "Vault does not exist");
        
        if (approved) {
            // Subtract from vault balance
            vaults[withdrawer].balance = FHE.sub(vaults[withdrawer].balance, withdrawal.amount);
        }
        
        withdrawal.isProcessed = true;
        
        emit WithdrawalRequested(withdrawer, withdrawalId, 0); // Amount will be decrypted off-chain
    }
    
    function toggleVaultLock() public vaultExists(msg.sender) {
        vaults[msg.sender].isLocked = !vaults[msg.sender].isLocked;
        emit VaultLocked(msg.sender, vaults[msg.sender].isLocked);
    }
    
    function calculateInterest(address user) public onlyVerifier vaultExists(user) {
        _calculateInterest(user);
    }
    
    function _calculateInterest(address user) internal {
        Vault storage vault = vaults[user];
        
        // Calculate time difference
        uint32 currentTime = uint32(block.timestamp);
        euint32 timeDiff = FHE.sub(FHE.asEuint32(currentTime), vault.lastUpdateTime);
        
        // Calculate interest: (balance * rate * time) / (365 days * 10000)
        euint32 dailyRate = FHE.div(vault.interestRate, FHE.asEuint32(365 * BASE_RATE));
        euint32 interest = FHE.mul(FHE.mul(vault.balance, dailyRate), timeDiff);
        
        // Add to total interest
        vault.totalInterest = FHE.add(vault.totalInterest, interest);
        
        // Update last calculation time
        vault.lastUpdateTime = FHE.asEuint32(currentTime);
        
        emit InterestCalculated(user, 0); // Interest will be decrypted off-chain
    }
    
    function updateUserReputation(
        address user,
        euint32 reputation
    ) public onlyVerifier {
        require(user != address(0), "Invalid user address");
        userReputation[user] = reputation;
        emit ReputationUpdated(user, 0); // Reputation will be decrypted off-chain
    }
    
    function pauseContract() public onlyOwner {
        contractPaused = true;
        emit ContractPaused(true);
    }
    
    function unpauseContract() public onlyOwner {
        contractPaused = false;
        emit ContractPaused(false);
    }
    
    function getVaultInfo(address user) public view vaultExists(user) returns (
        uint8 balance,
        uint8 interestRate,
        uint8 totalInterest,
        bool isLocked,
        bool isActive,
        address owner,
        uint256 createdAt
    ) {
        Vault storage vault = vaults[user];
        return (
            0, // FHE.decrypt(vault.balance) - will be decrypted off-chain
            0, // FHE.decrypt(vault.interestRate) - will be decrypted off-chain
            0, // FHE.decrypt(vault.totalInterest) - will be decrypted off-chain
            vault.isLocked,
            vault.isActive,
            vault.owner,
            vault.createdAt
        );
    }
    
    function getDepositInfo(uint256 depositId) public view returns (
        uint8 amount,
        address depositor,
        uint256 timestamp,
        bool isWithdrawn
    ) {
        require(depositId < depositCounter, "Invalid deposit ID");
        Deposit storage deposit = deposits[depositId];
        return (
            0, // FHE.decrypt(deposit.amount) - will be decrypted off-chain
            deposit.depositor,
            deposit.timestamp,
            deposit.isWithdrawn
        );
    }
    
    function getWithdrawalInfo(uint256 withdrawalId) public view returns (
        uint8 amount,
        address withdrawer,
        uint256 timestamp,
        bool isProcessed
    ) {
        require(withdrawalId < withdrawalCounter, "Invalid withdrawal ID");
        Withdrawal storage withdrawal = withdrawals[withdrawalId];
        return (
            0, // FHE.decrypt(withdrawal.amount) - will be decrypted off-chain
            withdrawal.withdrawer,
            withdrawal.timestamp,
            withdrawal.isProcessed
        );
    }
    
    function getUserReputation(address user) public view returns (uint8) {
        return 0; // FHE.decrypt(userReputation[user]) - will be decrypted off-chain
    }
    
    function emergencyWithdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
