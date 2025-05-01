import { API_ENDPOINTS, COMMON_HEADERS } from '../config/apiConfig';

// get user carts with additional options for customizing the response
export const getUserCartsWithOptions = async (userId: string, options: { includeProducts?: boolean } = {}) => {
  try {
    // build API endpoint URL with query parameters
    let endpoint = `${API_ENDPOINTS.cart.getAll}?userId=${userId}`;
    
    // add optional parameters if specified
    if (options.includeProducts) {
      endpoint += '&includeProducts=true';
    }
    
    // fetch carts from API
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

// delete a cart by ID
export const deleteCart = async (cartId: string, userId: string) => {
  try {
    // send request to delete cart
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

// email a cart as PDF to user
export const emailCartAsPdf = async (cartId: string, userId: string, email: string) => {
  try {
    // send request to email cart
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

// transfer a product between two carts
export const transferProduct = async (
  sourceCartId: string, 
  targetCartId: string, 
  productId: string,
  userId: string
) => {
  try {
    // send request to transfer product
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

// get detailed price comparison between two carts
export const compareCartPrices = async (cartIdA: string, cartIdB: string, userId: string) => {
  try {
    // send request to compare cart prices
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