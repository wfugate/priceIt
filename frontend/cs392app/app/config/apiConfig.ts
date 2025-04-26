// app/config/apiConfig.ts
// Central configuration file for API endpoints

// Base URL for all API requests - change this when your ngrok URL changes
export const API_BASE_URL = 'https://b9d3-128-197-28-135.ngrok-free.app';

// API endpoints derived from the base URL
export const API_ENDPOINTS = {
  // Image processing endpoints
  imageProcessing: {
    process: `${API_BASE_URL}/api/ImageProcessing/process`,
    test: `${API_BASE_URL}/api/ImageProcessing/test`,
  },
  
  // Product search endpoints
  products: {
    search: `${API_BASE_URL}/api/Target/search`, // Keep for backward compatibility
    target: `${API_BASE_URL}/api/Target/search`,
    walmart: `${API_BASE_URL}/api/Walmart/search`,
    costco: `${API_BASE_URL}/api/Costco/search`,
    samsClub: `${API_BASE_URL}/api/SamsClub/search`
  },
  
  // Cart management endpoints
  cart: {
    getAll: `${API_BASE_URL}/api/cart`,
    create: `${API_BASE_URL}/api/cart`,
    addProducts: (cartId: string) => `${API_BASE_URL}/api/cart/add/${cartId}`,
    update: (cartId: string) => `${API_BASE_URL}/api/cart/update/${cartId}`
  }
};

// Request headers used across all API calls
export const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true'
};

export default function removeWarning(){}