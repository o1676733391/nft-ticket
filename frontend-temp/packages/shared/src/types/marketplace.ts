// Marketplace types
export interface MarketplaceListing {
  id: string;
  tokenId: string;
  sellerId: string;
  price: string;
  status: 'active' | 'sold' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  ticket?: Ticket;
  seller?: User;
}

export interface MarketplaceFilter {
  eventId?: string;
  minPrice?: string;
  maxPrice?: string;
  status?: 'active' | 'sold' | 'cancelled';
  sortBy?: 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
