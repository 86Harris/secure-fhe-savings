# Secure FHE Savings

A confidential stablecoin vault built with Fully Homomorphic Encryption (FHE) technology, providing private and secure savings with encrypted interest calculations.

## Features

- **FHE-Protected Vault**: All financial data is encrypted using homomorphic encryption
- **Private Interest Calculation**: Interest is calculated without revealing your balance
- **Wallet Integration**: Connect with MetaMask, WalletConnect, and other Web3 wallets
- **Zero-Knowledge Proofs**: Verify transactions without revealing sensitive information
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **Web3**: Wagmi, Viem, WalletConnect
- **Blockchain**: Ethereum Sepolia Testnet
- **Encryption**: FHE (Fully Homomorphic Encryption)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask recommended)
- Ethereum Sepolia testnet ETH for gas fees

### Installation

1. Clone the repository:
```bash
git clone https://github.com/86Harris/secure-fhe-savings.git
cd secure-fhe-savings
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_CONTRACT_ADDRESS=your_fhe_contract_address
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Usage

1. **Connect Wallet**: Click the "Connect Wallet" button in the header
2. **Unlock Vault**: Click "Unlock Vault" to access your savings
3. **Deposit**: Click "Deposit Stablecoins" to add funds to your vault
4. **View Balance**: Toggle the eye icon to show/hide your encrypted balance
5. **Monitor Interest**: View your accrued interest with FHE-protected calculations

## Security Features

- **Homomorphic Encryption**: All calculations performed on encrypted data
- **Zero-Knowledge Proofs**: Verify transactions without revealing amounts
- **Private Interest Calculation**: Interest computed without exposing balances
- **Secure Vault**: Funds are locked until you explicitly unlock

## Smart Contract

The project includes a Solidity smart contract that implements:
- FHE-encrypted balance storage
- Private interest calculations
- Secure deposit/withdrawal mechanisms
- Zero-knowledge proof verification

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push

### Manual Deployment

```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Multi-chain support
- [ ] Advanced FHE operations
- [ ] Mobile app
- [ ] Institutional features
- [ ] Governance token integration
