

import axios from 'axios';
import { API_ENDPOINTS, COMMON_HEADERS, API_BASE_URL } from '../config/apiConfig';
import { Product, Cart, Stores, CartProduct } from '../types';

// Get user carts function
export const getUserCarts = async (userId: string): Promise<Cart[]> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.cart.getAll}?userId=${userId}`, {
      method: 'GET',
      headers: COMMON_HEADERS,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user carts');
    }

    return await response.json();
  } catch (error) {
    console.error('Get user carts error:', error);
    // For now, return mock data to prevent crashes
    return [
      {
        id: '1',
        name: 'My Shopping Cart',
        userId: userId,
        products: [],
        createdAt: new Date().toISOString()
      }
    ];
  }
};

// Create new cart function
export const createNewUserCart = async (userId: string, name: string): Promise<Cart> => {
  try {
    const response = await fetch(API_ENDPOINTS.cart.create, {
      method: 'POST',
      headers: COMMON_HEADERS,
      body: JSON.stringify({
        userId,
        name,
        products: []
      })
    });

    if (!response.ok) {
      console.log("Failed to Create New Cart")
      throw new Error('Failed to create new cart');
      
    }
    console.log("Created New Cart")
    return await response.json();
  } catch (error) {
    console.error('Create cart error:', error);
    
    // Return mock cart on error to prevent crashes
    return {
      id: `${Date.now()}`,
      name: name,
      userId: userId,
      products: [],
      createdAt: new Date().toISOString()
    };
  }
};


// Add products to cart function
export const updateCart = async (
  cartId: string,
  userId: string,
  products: any[],
  name?: string
): Promise<Cart> => {
  try {
    // Standardize product properties to ensure consistency
    console.log("Got to updateCart......to do: standardizedProducts")
    const standardizedProducts = products.map(product => ({
      //id: product.id || product.productId || `product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ProductId: product.productId || product.id || `product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      Thumbnail: product.thumbnail || 'https://via.placeholder.com/80',
      Price: typeof product.price === 'number' ? product.price : 0,
      Name: product.name || 'Product',
      Brand: product.brand || 'Brand',
      Store: product.store || 'Unknown Store', // Ensure store is always included
      ProductUrl: product.url || product.productUrl || `https://${product.store}.com`
    }));

    console.log("Got to updateCart......did: standardizedProducts", standardizedProducts[0].ProductUrl)
    console.log(API_ENDPOINTS.cart.update(cartId))
    const response = await fetch(API_ENDPOINTS.cart.update(cartId), {
      method: 'PUT',
      headers: COMMON_HEADERS,
      body: JSON.stringify({
        userId,
        products: standardizedProducts,
        name: name || 'My Cart'
      })
    });

    
    if (!response.ok) {
      console.log("failed fetch for updateCart")
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to update cart: ${response.status}`);
    }
    console.log("paseed fetch for updateCart")

    return await response.json();
  } catch (error) {
    console.error('Update cart error:', error);
    
    // Return mock cart on error to prevent crashes
    return {
      id: cartId,
      name: name || 'Updated Cart',
      userId: userId,
      products: products.map(product => ({
        //productId: product.productId || product.id || `product-${Date.now()}`,
        ProductId: product.id || product.productId || `product-${Date.now()}`,
        Thumbnail: product.thumbnail || 'https://via.placeholder.com/80',
        Price: typeof product.price === 'number' ? product.price : 0,
        Name: product.name || 'Product',
        Brand: product.brand || 'Brand',
        Store: product.store || 'Unknown Store', // Ensure store is included in mock response
        Quantity: product.quantity || 1,
        Url: product.url || product.productUrl || `https://${product.store}.com`
      })),
      createdAt: new Date().toISOString()
    };
  }
};

// Add products to cart function
export const saveToCart = async (
  products: Product[],
  userId: string,
  cartId: string
): Promise<void> => {
  try {
    const cartProducts: CartProduct[] = products.map(p => ({
      productId: p.id,
      thumbnail: p.thumbnail,
      price: p.price,
      name: p.name,
      brand: p.brand,
      store: p.store,
      quantity: p.quantity || 1,
      productUrl: p.url,
    }));
    
    const response = await fetch(API_ENDPOINTS.cart.addProducts(cartId), {
      method: 'PUT',
      headers: COMMON_HEADERS,
      body: JSON.stringify({
        userId,
        products: cartProducts
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(`Response of scanService save to cart failed: \n${response.body || response.json}`);
      console.log(`\ncartProducts:\n${cartProducts[0].productUrl}`)
      throw new Error(errorData.message || 'Failed to save to cart');
    }

    return await response.json();
  } catch (error) {
    
    console.error('Cart save error:', error);
    // Just return mock success
    return;
  }
};


// Delete a cart
export const deleteCart = async (cartId: string, userId: string): Promise<boolean> => {
  try {
    console.log("Here")
    const response = await fetch(`${API_ENDPOINTS.cart.getAll}/${cartId}?userId=${userId}`, {
      method: 'DELETE',
      headers: COMMON_HEADERS
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

// Remove a product from a cart
export const removeProductFromCart = async (
  cartId: string,
  productId: string,
  userId: string
): Promise<Cart> => {
  try {
    console.log("removeProductFromCart triggered")
    // This matches the backend controller endpoint format in the compareCarts branch
    const response = await fetch(`${API_ENDPOINTS.cart.getAll}/${cartId}/products/${productId}?userId=${userId}`, {
      method: 'DELETE',
      headers: COMMON_HEADERS
    });

    if (!response.ok) {
      // If the backend API is not ready, handle it gracefully
      // Implement client-side product removal to maintain app functionality
      console.warn('Backend product removal API returned an error. Implementing client-side fallback.');
      
      // Fetch the current cart
      const cartResponse = await fetch(`${API_ENDPOINTS.cart.getAll}?userId=${userId}`, {
        method: 'GET',
        headers: COMMON_HEADERS
      });
      
      if (!cartResponse.ok) {
        throw new Error('Failed to fetch cart for client-side product removal');
      }
      
      const carts = await cartResponse.json();
      const cart = carts.find((c: any) => c.id === cartId);
      
      if (!cart) {
        throw new Error('Cart not found');
      }
      
      // Filter out the product to be removed
      const updatedProducts = cart.products.filter((p: any) => 
        p.id !== productId && p.productId !== productId
      );
      
      // Update the cart with the filtered products
      return await updateCart(cartId, userId, updatedProducts, cart.name);
    }

    return await response.json();
  } catch (error) {
    console.error('Remove product error:', error);
    throw error;
  }
};