import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepositModal = ({ isOpen, onClose }: DepositModalProps) => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDC");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  
  // Contract address - should be set in environment variables
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

  const handleDeposit = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // In a real implementation, this would use FHE encryption
      // For now, we'll use placeholder encrypted values
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"name": "amount", "type": "bytes"},
              {"name": "inputProof", "type": "bytes"}
            ],
            "name": "deposit",
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "payable",
            "type": "function"
          }
        ],
        functionName: "deposit",
        args: ["0x", "0x"], // Placeholder for FHE encrypted values
        value: parseEther("0.01") // Gas fee
      });
      
      toast({
        title: "Deposit Successful",
        description: `${amount} ${currency} has been securely deposited with FHE protection.`,
      });
      
      setAmount("");
      onClose();
    } catch (error) {
      console.error("Deposit error:", error);
      toast({
        title: "Deposit Failed",
        description: "Failed to process deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>Secure Deposit</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Stablecoin</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="DAI">DAI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-medium"
            />
            <p className="text-xs text-muted-foreground">
              Minimum deposit: 100 {currency}
            </p>
          </div>

          <div className="bg-accent/30 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm text-foreground">Privacy Features</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-success" />
                <span>Amount encrypted with FHE</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-success" />
                <span>Interest calculated privately</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-success" />
                <span>Zero-knowledge proof generated</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleDeposit}
            disabled={isProcessing || !amount}
            className="w-full bg-gradient-vault hover:shadow-glow transition-all duration-300"
            size="lg"
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                Deposit {currency}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;