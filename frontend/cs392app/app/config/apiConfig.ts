// app/config/apiConfig.ts
// Central configuration file for API endpoints

// Base URL for all API requests - change this when your ngrok URL changes
export const API_BASE_URL = 'https://d3ec-128-197-28-135.ngrok-free.app';

// API endpoints derived from the base URL
// export const API_ENDPOINTS = {
//   // Image processing endpoints
//   imageProcessing: {
//     process: `${API_BASE_URL}/api/ImageProcessing/process`,
//     test: `${API_BASE_URL}/api/ImageProcessing/test`,
//   },
  
//   // Product search endpoints
//   products: {
//     search: `${API_BASE_URL}/api/Target/search`,
//   },
  
//   // Cart management endpoints
//   cart: {
//     getAll: `${API_BASE_URL}/api/cart`,
//     create: `${API_BASE_URL}/api/cart`,
//     addProducts: (cartId: string) => `${API_BASE_URL}/api/cart/add/${cartId}`,
//   }
  
// };
// Update your app/config/apiConfig.ts to include the cart update endpoint

export const API_ENDPOINTS = {
  // Image processing endpoints
  imageProcessing: {
    process: `${API_BASE_URL}/api/ImageProcessing/process`,
    test: `${API_BASE_URL}/api/ImageProcessing/test`,
  },
  
  // Product search endpoints
  products: {
    search: `${API_BASE_URL}/api/Target/search`,
  },
  
  // Cart management endpoints
  cart: {
    getAll: `${API_BASE_URL}/api/cart`,
    create: `${API_BASE_URL}/api/cart`,
    addProducts: (cartId: string) => `${API_BASE_URL}/api/cart/add/${cartId}`,
    update: (cartId: string) => `${API_BASE_URL}/api/cart/${cartId}` // New endpoint for updating a cart
  }
};
// Request headers used across all API calls
export const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true'
};