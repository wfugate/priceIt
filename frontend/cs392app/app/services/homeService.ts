// app/services/homeService.ts
import { API_ENDPOINTS, COMMON_HEADERS } from '../config/apiConfig';
import { Cart, Product } from '../types';

// Get user carts with additional options
export const getUserCartsWithOptions = async (userId: string, options: { includeProducts?: boolean } = {}) => {
  try {
    let endpoint = `${API_ENDPOINTS.cart.getAll}?userId=${userId}`;
    
    if (options.includeProducts) {
      endpoint += '&includeProducts=true';
    }
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: COMMON_HEADERS,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to fetch user carts: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get user carts error:', error);
    throw error;
  }
};

// Delete a cart
export const deleteCart = async (cartId: string, userId: string) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.cart.getAll}/${cartId}`, {
      method: 'DELETE',
      headers: COMMON_HEADERS,
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to delete cart: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Delete cart error:', error);
    throw error;
  }
};

// Email cart as PDF
export const emailCartAsPdf = async (cartId: string, userId: string, email: string) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.cart.getAll}/email/${cartId}`, {
      method: 'POST',
      headers: COMMON_HEADERS,
      body: JSON.stringify({ 
        userId,
        email
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to email cart: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Email cart error:', error);
    throw error;
  }
};

// Transfer product between carts
export const transferProduct = async (
  sourceCartId: string, 
  targetCartId: string, 
  productId: string,
  userId: string
) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.cart.getAll}/transfer`, {
      method: 'POST',
      headers: COMMON_HEADERS,
      body: JSON.stringify({
        userId,
        sourceCartId,
        targetCartId,
        productId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to transfer product: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Transfer product error:', error);
    throw error;
  }
};

// Get detailed price comparison between two carts
export const compareCartPrices = async (cartIdA: string, cartIdB: string, userId: string) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.cart.getAll}/compare`, {
      method: 'POST',
      headers: COMMON_HEADERS,
      body: JSON.stringify({
        userId,
        cartIdA,
        cartIdB
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to compare carts: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Compare carts error:', error);
    throw error;
  }
};

export default {}; 