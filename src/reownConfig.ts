import { createAppKit } from '@reown/appkit/react'
import type { CustomCaipNetwork } from '@reown/appkit-common'

// 1. Get projectId from https://cloud.reown.com
export const projectId = import.meta.env.VITE_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694"

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// 2. Define Stacks Mainnet Custom Network
// Stacks CAIP-2 identifier is 'stacks:1' for Mainnet
const stacksMainnet: CustomCaipNetwork = {
  id: 1,
  chainNamespace: 'stacks' as any, 
  caipNetworkId: 'stacks:1',
  name: 'Stacks',
  nativeCurrency: { name: 'Stacks', symbol: 'STX', decimals: 6 },
  rpcUrls: { 
    default: { http: ['https://api.mainnet.hiro.so'] } 
  },
  blockExplorers: {
    default: { name: 'Stacks Explorer', url: 'https://explorer.hiro.so' }
  }
}

const metadata = {
  name: 'STX Multi-Sender',
  description: 'Airdrop STX to multiple addresses',
  url: window.location.origin,
  icons: ['https://stacksend.pages.dev/logo.png']
}

// 3. Create AppKit instance
createAppKit({
  networks: [stacksMainnet as any], // Use our custom definition
  metadata,
  projectId,
  features: {
    analytics: true
  }
})
