import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="flex items-center space-x-3">
        <Badge variant="secondary" className="font-mono text-xs">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="flex space-x-2">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          size="sm"
        >
          {isPending ? 'Connecting...' : `Connect ${connector.name}`}
        </Button>
      ))}
    </div>
  )
}
