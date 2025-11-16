// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  organizerId: string;
  bannerUrl?: string;
  status: 'draft' | 'published' | 'ongoing' | 'ended';
  createdAt: string;
  updatedAt: string;
}

export interface EventDetail extends Event {
  organizer: User;
  ticketTemplates: TicketTemplate[];
  stats: EventStats;
}

export interface EventStats {
  totalTickets: number;
  soldTickets: number;
  revenue: string;
  checkInCount: number;
}
