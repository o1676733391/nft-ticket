import type { ChainConfig } from '../types';

// TODO: Update with actual deployed contract addresses
export const SEPOLIA_CONFIG: ChainConfig = {
  chainId: 11155111,
  name: 'Sepolia',
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  blockExplorer: 'https://sepolia.etherscan.io',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  contracts: {
    ticketNFT: '0x0000000000000000000000000000000000000000',
    marketplace: '0x0000000000000000000000000000000000000000',
    systemToken: '0x0000000000000000000000000000000000000000',
  },
};

export const SUPPORTED_CHAINS = [SEPOLIA_CONFIG];

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId);
}
