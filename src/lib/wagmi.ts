import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Get projectId from https://cloud.walletconnect.com
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id'

// Create wagmi config
export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
