import axios from 'axios';

// Use Local REST API instead of Supabase Functions
const API_URL = 'http://localhost:3001/api';

export const createEvent = async (eventData, jwt) => {
  // Pass full event data, adding hardcoded organizer_id for now
  const payload = {
    organizer_id: '11111111-1111-1111-1111-111111111111', 
    ...eventData
  };
  
  return axios.post(`${API_URL}/events`, payload);
};

export const mintTicket = async (eventId, userWallet) => {
  return axios.post(`${API_URL}/tickets/mint`, {
    event_id: eventId,
    user_wallet: userWallet
    // template_id is optional, backend picks default
  });
};

export const getEvents = async () => {
  return axios.get(`${API_URL}/events`);
};

export const createTicketTemplate = async (templateData) => {
  return axios.post(`${API_URL}/ticket_templates`, templateData);
};

export const getTicketTemplates = async (eventId) => {
  return axios.get(`${API_URL}/ticket_templates`, { params: { event_id: eventId } });
};

export const getMyTickets = async (wallet) => {
  return axios.get(`${API_URL}/tickets/user/${wallet}`);
};

export const getMarketplaceListings = async () => {
  return axios.get(`${API_URL}/marketplace`);
};

export const checkIn = async (ticketId, organizerId) => {
  return axios.post(`${API_URL}/checkin`, {
    ticket_id: ticketId,
    organizer_id: organizerId
  });
};

export const authVerify = async (message, signature, address) => {
  return axios.post(`${API_URL}/auth/verify`, {
    message,
    signature,
    address
  });
};
