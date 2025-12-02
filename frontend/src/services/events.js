// src/services/events.js
import api from './api';
import { supabase, uploadImage } from './supabase';

// Get all events
export const getEvents = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/events?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get event by ID
export const getEventById = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

// Create event
export const createEvent = async (eventData) => {
  try {
    // Upload images if they are local URIs
    const uploadedData = { ...eventData };

    if (eventData.mainImage && eventData.mainImage.startsWith('file://')) {
      uploadedData.mainImage = await uploadImage(eventData.mainImage, 'events', `main_${Date.now()}.jpg`);
    }

    if (eventData.coverImage && eventData.coverImage.startsWith('file://')) {
      uploadedData.coverImage = await uploadImage(eventData.coverImage, 'events', `cover_${Date.now()}.jpg`);
    }

    if (eventData.organizerLogo && eventData.organizerLogo.startsWith('file://')) {
      uploadedData.organizerLogo = await uploadImage(eventData.organizerLogo, 'events', `logo_${Date.now()}.jpg`);
    }

    const response = await api.post('/events', uploadedData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update event
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await api.put(`/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete event
export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Get events by category
export const getEventsByCategory = async (category) => {
  try {
    const response = await api.get(`/events?category=${encodeURIComponent(category)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events by category:', error);
    throw error;
  }
};

// Get events by location
export const getEventsByLocation = async (location) => {
  try {
    const response = await api.get(`/events?location=${encodeURIComponent(location)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events by location:', error);
    throw error;
  }
};

// Search events
export const searchEvents = async (query) => {
  try {
    const response = await api.get(`/events/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching events:', error);
    throw error;
  }
};

// Get event statistics
export const getEventStats = async (eventId) => {
  try {
    const response = await api.get(`/events/stats?event_id=${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event stats:', error);
    throw error;
  }
};

export default {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByCategory,
  getEventsByLocation,
  searchEvents,
  getEventStats,
};
