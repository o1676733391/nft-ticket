// src/constants/config.js

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
};

// Chain Configuration
export const CHAIN_CONFIG = {
  chainId: parseInt(process.env.EXPO_PUBLIC_CHAIN_ID || '1337'),
  chainName: process.env.EXPO_PUBLIC_CHAIN_NAME || 'Localhost',
  rpcUrl: process.env.EXPO_PUBLIC_RPC_URL || 'http://localhost:8545',
  blockExplorer: process.env.EXPO_PUBLIC_BLOCK_EXPLORER || '',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};

// App Configuration
export const APP_CONFIG = {
  appName: 'TicketBox',
  appVersion: '1.0.0',
  supportEmail: 'support@ticketbox.com',
};

// Event Categories
export const EVENT_CATEGORIES = [
  'Nhạc sống',
  'Sân khấu & Nghệ thuật',
  'Thể thao',
  'Hội thảo & Workshop',
  'Ẩm thực',
  'Khác',
];

// Event Locations
export const EVENT_LOCATIONS = [
  { key: 'hcm', label: 'TP. Hồ Chí Minh' },
  { key: 'hn', label: 'Hà Nội' },
  { key: 'dn', label: 'Đà Nẵng' },
  { key: 'dl', label: 'Đà Lạt' },
  { key: 'nt', label: 'Nha Trang' },
  { key: 'other', label: 'Khác' },
];

// Ticket Status
export const TICKET_STATUS = {
  VALID: 'valid',
  CHECKED_IN: 'checked_in',
  TRANSFERRED: 'transferred',
  LISTED: 'listed',
  EXPIRED: 'expired',
};

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
};

// Marketplace Status
export const LISTING_STATUS = {
  ACTIVE: 'active',
  SOLD: 'sold',
  CANCELLED: 'cancelled',
};

// Image upload limits
export const IMAGE_CONFIG = {
  maxSizeInBytes: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
  mainImageSize: { width: 720, height: 958 },
  coverImageSize: { width: 1280, height: 720 },
  logoSize: { width: 200, height: 200 },
};

// Pagination
export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  maxPageSize: 100,
};

export default {
  API_CONFIG,
  CHAIN_CONFIG,
  SUPABASE_CONFIG,
  APP_CONFIG,
  EVENT_CATEGORIES,
  EVENT_LOCATIONS,
  TICKET_STATUS,
  TRANSACTION_STATUS,
  LISTING_STATUS,
  IMAGE_CONFIG,
  PAGINATION_CONFIG,
};
