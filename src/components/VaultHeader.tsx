import { Shield } from "lucide-react";
import { WalletConnect } from "./WalletConnect";

const VaultHeader = () => {
  return (
    <header className="w-full bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-vault rounded-lg shadow-vault">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">FHE-Protected</h1>
              <p className="text-sm text-muted-foreground">Confidential Stablecoin Vault</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Homomorphic Encryption</p>
              <p className="text-xs text-muted-foreground">Private • Secure • Verifiable</p>
            </div>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
};

export default VaultHeader;