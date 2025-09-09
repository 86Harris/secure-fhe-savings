# Deployment Guide

## Vercel Deployment

### Prerequisites

1. Vercel account
2. GitHub repository with the project code
3. WalletConnect Project ID
4. Deployed FHE smart contract address

### Step 1: Prepare Environment Variables

Create a `.env.local` file with the following variables:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
VITE_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
VITE_APP_NAME=Secure FHE Savings
VITE_APP_DESCRIPTION=Confidential stablecoin vault with FHE protection
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in the dashboard
5. Deploy

### Step 3: Configure Environment Variables in Vercel

In your Vercel project dashboard:

1. Go to Settings → Environment Variables
2. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_WALLETCONNECT_PROJECT_ID` | Your WalletConnect Project ID | Production, Preview, Development |
| `VITE_CONTRACT_ADDRESS` | Your deployed contract address | Production, Preview, Development |
| `VITE_RPC_URL` | Your RPC URL (optional) | Production, Preview, Development |

### Step 4: Custom Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Smart Contract Deployment

### Prerequisites

1. Hardhat or Foundry installed
2. FHE development environment set up
3. Sepolia testnet ETH for deployment

### Deploy Contract

1. Install dependencies:
```bash
npm install @fhevm/solidity hardhat
```

2. Configure hardhat.config.ts:
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
};

export default config;
```

3. Deploy:
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

4. Update environment variables with the deployed contract address

## Post-Deployment

### Verification

1. Test wallet connection
2. Test vault creation
3. Test deposit functionality
4. Verify FHE encryption is working

### Monitoring

1. Set up error tracking (Sentry, etc.)
2. Monitor contract events
3. Track user interactions

## Troubleshooting

### Common Issues

1. **WalletConnect not working**: Check project ID and network configuration
2. **Contract calls failing**: Verify contract address and ABI
3. **Build errors**: Check environment variables and dependencies

### Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

## Security Considerations

1. Never commit private keys or sensitive data
2. Use environment variables for all secrets
3. Regularly update dependencies
4. Monitor for security vulnerabilities
5. Implement proper access controls

## Performance Optimization

1. Enable Vercel's edge functions for better performance
2. Use CDN for static assets
3. Implement proper caching strategies
4. Optimize bundle size with code splitting
