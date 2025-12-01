// Ticket types
export interface TicketTemplate {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: string;
  supply: number;
  remaining: number;
  isSoulbound: boolean;
  royaltyPercentage: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  tokenId: string;
  templateId: string;
  eventId: string;
  ownerId: string;
  status: 'active' | 'used' | 'transferred' | 'listed';
  isUsed: boolean;
  usedAt?: string;
  qrCode?: string;
  metadata?: TicketMetadata;
  createdAt: string;
}

export interface TicketMetadata {
  eventName: string;
  ticketType: string;
  seat?: string;
  section?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}
