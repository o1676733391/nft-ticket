// User types
export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
  role: 'user' | 'organizer' | 'staff' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  ticketCount: number;
  eventsAttended: number;
  eventsOrganized?: number;
}
