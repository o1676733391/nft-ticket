/**
 * Biconomy Configuration for Account Abstraction (ERC-4337)
 * Enables gasless transactions - users don't need ETH for gas!
 */

export interface BiconomyConfig {
  bundlerUrl: string;
  paymasterUrl: string;
  rpcUrl: string;
}

export const BICONOMY_CONFIGS: Record<number, BiconomyConfig> = {
  // Base Sepolia (Testnet) - Recommended for testing
  84532: {
    bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL_BASE_SEPOLIA || 
                "https://bundler.biconomy.io/api/v2/84532/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
    paymasterUrl: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL_BASE_SEPOLIA || 
                  "https://paymaster.biconomy.io/api/v1/84532/YOUR_PAYMASTER_KEY",
    rpcUrl: "https://sepolia.base.org",
  },
  
  // Base Mainnet (Production)
  8453: {
    bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL_BASE || 
                "https://bundler.biconomy.io/api/v2/8453/YOUR_BUNDLER_KEY",
    paymasterUrl: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL_BASE || 
                  "https://paymaster.biconomy.io/api/v1/8453/YOUR_PAYMASTER_KEY",
    rpcUrl: "https://mainnet.base.org",
  },
  
  // Polygon (Mainnet) - Very cheap gas
  137: {
    bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL_POLYGON || 
                "https://bundler.biconomy.io/api/v2/137/YOUR_BUNDLER_KEY",
    paymasterUrl: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL_POLYGON || 
                  "https://paymaster.biconomy.io/api/v1/137/YOUR_PAYMASTER_KEY",
    rpcUrl: "https://polygon-rpc.com",
  },
  
  // Sepolia (Ethereum Testnet)
  11155111: {
    bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL_SEPOLIA || 
                "https://bundler.biconomy.io/api/v2/11155111/YOUR_BUNDLER_KEY",
    paymasterUrl: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL_SEPOLIA || 
                  "https://paymaster.biconomy.io/api/v1/11155111/YOUR_PAYMASTER_KEY",
    rpcUrl: "https://rpc.sepolia.org",
  },
};

/**
 * Get Biconomy config for a specific chain
 */
export function getBiconomyConfig(chainId: number): BiconomyConfig | null {
  return BICONOMY_CONFIGS[chainId] || null;
}

/**
 * Check if gasless transactions are supported on this chain
 */
export function isGaslessSupported(chainId: number): boolean {
  return chainId in BICONOMY_CONFIGS;
}

/**
 * Biconomy Trusted Forwarder addresses (ERC-2771)
 * These are used in smart contracts for meta-transactions
 */
export const TRUSTED_FORWARDERS: Record<number, string> = {
  // Testnets
  11155111: "0x69015912AA33720b842dCD6aC059Ed623F28d9f7", // Sepolia
  84532: "0x69015912AA33720b842dCD6aC059Ed623F28d9f7",    // Base Sepolia
  80001: "0x69015912AA33720b842dCD6aC059Ed623F28d9f7",    // Polygon Mumbai
  
  // Mainnets
  1: "0x84a0856b038eaAd1cC7E297cF34A7e72685A8693",        // Ethereum
  8453: "0x84a0856b038eaAd1cC7E297cF34A7e72685A8693",      // Base
  137: "0x84a0856b038eaAd1cC7E297cF34A7e72685A8693",       // Polygon
};

export function getTrustedForwarder(chainId: number): string | null {
  return TRUSTED_FORWARDERS[chainId] || null;
}
