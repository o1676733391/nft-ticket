// Contract types
export interface ContractAddresses {
  ticketNFT: `0x${string}`;
  marketplace: `0x${string}`;
  systemToken: `0x${string}`;
}

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  contracts: ContractAddresses;
}

export interface TransactionStatus {
  hash: `0x${string}`;
  status: 'pending' | 'success' | 'failed';
  confirmations?: number;
  error?: string;
}
