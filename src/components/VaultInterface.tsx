import { useState, useEffect } from "react";
import { Lock, Unlock, TrendingUp, DollarSign, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import DepositModal from "./DepositModal";

const VaultInterface = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [showBalance, setShowBalance] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [hasVault, setHasVault] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  
  // Contract address - should be set in environment variables
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
  
  // Read vault information from contract
  const { data: vaultInfo } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: [
      {
        "inputs": [{"name": "user", "type": "address"}],
        "name": "getVaultInfo",
        "outputs": [
          {"name": "balance", "type": "uint8"},
          {"name": "interestRate", "type": "uint8"},
          {"name": "totalInterest", "type": "uint8"},
          {"name": "isLocked", "type": "bool"},
          {"name": "isActive", "type": "bool"},
          {"name": "owner", "type": "address"},
          {"name": "createdAt", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: "getVaultInfo",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress
    }
  });

  // Mock data for demonstration (in real app, this would come from FHE decryption)
  const balance = vaultInfo ? 12500.75 : 0;
  const accruedInterest = vaultInfo ? 125.50 : 0;
  const apy = 8.5;

  useEffect(() => {
    if (vaultInfo && vaultInfo[4]) { // isActive
      setHasVault(true);
      setIsLocked(vaultInfo[3]); // isLocked
    } else {
      setHasVault(false);
    }
  }, [vaultInfo]);

  const toggleVault = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: [
          {
            "inputs": [],
            "name": "toggleVaultLock",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: "toggleVaultLock",
        value: parseEther("0.01") // Gas fee
      });
      
      setIsLocked(!isLocked);
    } catch (error) {
      console.error("Error toggling vault:", error);
      alert("Failed to toggle vault lock");
    }
  };

  const createVault = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"name": "initialDeposit", "type": "bytes"},
              {"name": "inputProof", "type": "bytes"}
            ],
            "name": "createVault",
            "outputs": [{"name": "", "type": "bool"}],
            "stateMutability": "payable",
            "type": "function"
          }
        ],
        functionName: "createVault",
        args: ["0x", "0x"], // Placeholder for FHE encrypted values
        value: parseEther("0.01") // Gas fee
      });
      
      setHasVault(true);
    } catch (error) {
      console.error("Error creating vault:", error);
      alert("Failed to create vault");
    }
  };

  // Show create vault interface if user doesn't have a vault
  if (!hasVault && isConnected) {
    return (
      <div className="w-full max-w-4xl mx-auto px-6 py-12">
        <Card className="relative overflow-hidden bg-card shadow-card-premium border border-border mb-8">
          <div className="absolute inset-0 bg-gradient-subtle opacity-20"></div>
          <div className="relative p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-vault shadow-vault mx-auto mb-6">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Create Your FHE-Protected Vault</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start your confidential savings journey with fully homomorphic encryption. 
              Your balance and interest calculations will remain private and secure.
            </p>
            <Button
              onClick={createVault}
              size="lg"
              className="bg-gradient-vault hover:shadow-glow transition-all duration-300"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Create Vault
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show connect wallet message if not connected
  if (!isConnected) {
    return (
      <div className="w-full max-w-4xl mx-auto px-6 py-12">
        <Card className="relative overflow-hidden bg-card shadow-card-premium border border-border mb-8">
          <div className="absolute inset-0 bg-gradient-subtle opacity-20"></div>
          <div className="relative p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-vault shadow-vault mx-auto mb-6">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Please connect your Web3 wallet to access your confidential savings vault.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12">
      {/* Main Vault Card */}
      <Card className="relative overflow-hidden bg-card shadow-card-premium border border-border mb-8">
        <div className="absolute inset-0 bg-gradient-subtle opacity-20"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div 
                className={`
                  flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-500
                  ${isLocked 
                    ? 'bg-vault-locked shadow-vault' 
                    : 'bg-gradient-success shadow-glow animate-vault-glow'
                  }
                  ${!isLocked ? 'animate-vault-unlock' : ''}
                `}
              >
                {isLocked ? (
                  <Lock className="w-8 h-8 text-white" />
                ) : (
                  <Unlock className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Confidential Vault</h2>
                <p className="text-muted-foreground">
                  Status: <Badge variant={isLocked ? "secondary" : "default"} className="ml-1">
                    {isLocked ? "Secured" : "Unlocked"}
                  </Badge>
                </p>
              </div>
            </div>
            
            <Button
              onClick={toggleVault}
              variant={isLocked ? "default" : "secondary"}
              size="lg"
              className="transition-all duration-300"
            >
              {isLocked ? "Unlock Vault" : "Lock Vault"}
            </Button>
          </div>

          {/* Balance Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Total Balance</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1 h-6 w-6"
                >
                  {showBalance ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {showBalance ? `$${balance.toLocaleString()}` : "••••••"}
              </p>
              <p className="text-xs text-muted-foreground">USDC • Encrypted</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-muted-foreground">Accrued Interest</span>
              </div>
              <p className="text-2xl font-bold text-success">
                {showBalance ? `+$${accruedInterest.toFixed(2)}` : "••••••"}
              </p>
              <p className="text-xs text-muted-foreground">{apy}% APY</p>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Encryption Status</span>
              <div className="space-y-1">
                <Badge variant="default" className="bg-gradient-vault border-0">
                  FHE Protected
                </Badge>
                <p className="text-xs text-muted-foreground">Homomorphic computations active</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => setIsDepositOpen(true)}
          disabled={isLocked}
          size="lg"
          className="h-16 text-lg bg-gradient-vault hover:shadow-glow transition-all duration-300"
        >
          <DollarSign className="w-5 h-5 mr-2" />
          Deposit Stablecoins
        </Button>
        
        <Button
          variant="outline"
          disabled={isLocked}
          size="lg"
          onClick={() => {
            // TODO: Implement transaction history modal
            console.log("View Transactions clicked");
            alert("Transaction history feature coming soon!");
          }}
          className="h-16 text-lg border-2 hover:border-primary hover:bg-accent transition-all duration-300"
        >
          View Transactions
        </Button>
      </div>

      {/* Security Features */}
      <Card className="mt-8 p-6 bg-card border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Security Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm text-muted-foreground">Zero-Knowledge Proofs</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm text-muted-foreground">Homomorphic Encryption</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm text-muted-foreground">Private Interest Calculation</span>
          </div>
        </div>
      </Card>

      <DepositModal 
        isOpen={isDepositOpen} 
        onClose={() => setIsDepositOpen(false)} 
      />
    </div>
  );
};

export default VaultInterface;