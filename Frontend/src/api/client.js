// src/services/api.js
// This file handles ALL communication with the backend

// Base URL of your backend server
const API_URL = import.meta.env.VITE_API_URL;

// Helper function to get the authentication token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to create headers for API requests
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ========================================
// AUTHENTICATION APIs
// ========================================

export const authAPI = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Save token to localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Save token to localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }
      
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }
};

// ========================================
// EVENTS APIs
// ========================================

export const eventsAPI = {
  // Get all events (with optional filters)
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_URL}/events${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch events');
      }
      
      return data;
    } catch (error) {
      console.error('Get events error:', error);
      throw error;
    }
  },

  // Get a single event by ID
  getById: async (eventId) => {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch event');
      }
      
      return data;
    } catch (error) {
      console.error('Get event error:', error);
      throw error;
    }
  },

  // Create a new event
  create: async (eventData) => {
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(eventData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event');
      }
      
      return data;
    } catch (error) {
      console.error('Create event error:', error);
      throw error;
    }
  },

  // Update an event
  update: async (eventId, eventData) => {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(eventData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update event');
      }
      
      return data;
    } catch (error) {
      console.error('Update event error:', error);
      throw error;
    }
  },

  // Delete an event
  delete: async (eventId) => {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete event');
      }
      
      return data;
    } catch (error) {
      console.error('Delete event error:', error);
      throw error;
    }
  },

  // Register for an event
  register: async (eventId) => {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to register for event');
      }
      
      return data;
    } catch (error) {
      console.error('Register event error:', error);
      throw error;
    }
  }
};

// Export everything together
export default {
  auth: authAPI,
  events: eventsAPI
};