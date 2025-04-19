// app/services/scanService.ts
import axios from 'axios';
import { Product, Cart, Stores, CartProduct } from '../types'; // Import shared types

// Interfaces
interface ApiError {
  message: string;
  status?: number;
  data?: any;
  config?: {
    url?: string;
    method?: string;
    params?: any;
  };
}

// API base URL - update with your ngrok URL
const API_BASE_URL = 'https://55e9-168-122-156-26.ngrok-free.app';

// Image processing function
export const scanImage = async (base64Image: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/ImageProcessing/process`,
    { image: `data:image/jpeg;base64,${base64Image}` },
    {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      timeout: 30000
    }
  );
  return response.data;
};

// Product search function with store selection
export const searchProducts = async function(query: string, stores: Stores = { walmart: true, target: true, costco: true, samsClub: true }): Promise<Product[]> { 
  try {
    const results: Product[] = [];
    
    // Search Target if selected
    if (stores.target) {
      try {
        const targetUrl = `${API_BASE_URL}/api/Target/search?query=${query}`;
        const targetResponse = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        const targetData = await targetResponse.json();
        
        const targetProducts = targetData.map((item: any) => ({
          id: item.productId || `target-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          thumbnail: item.thumbnail,
          price: item.price,
          name: item.name,
          brand: item.brand || 'Target',
          store: 'Target' // Always set store to Target for these products
        }));
        
        results.push(...targetProducts);
      } catch (error) {
        console.error('Target search error:', error);
      }
    }
    
    // Search Walmart if selected
    if (stores.walmart) {
      try {
        const walmartUrl = `${API_BASE_URL}/api/Walmart/search?query=${query}`;
        const walmartResponse = await fetch(walmartUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        const walmartData = await walmartResponse.json();
        
        const walmartProducts = walmartData.map((item: any) => ({
          id: item.productId || `walmart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          thumbnail: item.thumbnail,
          price: item.price,
          name: item.name,
          brand: item.brand || 'Walmart',
          store: 'Walmart' // Always set store to Walmart for these products
        }));
        
        results.push(...walmartProducts);
      } catch (error) {
        console.error('Walmart search error:', error);
      }
    }
    
    // Search Costco if selected
    if (stores.costco) {
      try {
        const costcoUrl = `${API_BASE_URL}/api/Costco/search?query=${query}`;
        const costcoResponse = await fetch(costcoUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        const costcoData = await costcoResponse.json();
        
        const costcoProducts = costcoData.map((item: any) => ({
          id: item.productId || `costco-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          thumbnail: item.thumbnail,
          price: item.price,
          name: item.name,
          brand: item.brand || 'Costco',
          store: 'Costco' // Always set store to Costco for these products
        }));
        
        results.push(...costcoProducts);
      } catch (error) {
        console.error('Costco search error:', error);
      }
    }
    
    // Search Sam's Club if selected
    if (stores.samsClub) {
      try {
        const samsClubUrl = `${API_BASE_URL}/api/SamsClub/search?query=${query}`;
        const samsClubResponse = await fetch(samsClubUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        const samsClubData = await samsClubResponse.json();
        
        const samsClubProducts = samsClubData.map((item: any) => ({
          id: item.productId || `samsclub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          thumbnail: item.thumbnail,
          price: item.price,
          name: item.name,
          brand: item.brand || "Sam's Club",
          store: "Sam's Club" // Always set store to Sam's Club for these products
        }));
        
        results.push(...samsClubProducts);
      } catch (error) {
        console.error("Sam's Club search error:", error);
      }
    }
    
    // Sort all results by price
    return results.sort((a, b) => a.price - b.price);
  } catch (error) {
    console.error('Search products error:', error);
    return [];
  }
};

// Get user carts function
export const getUserCarts = async (userId: string): Promise<Cart[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user carts');
    }

    return await response.json();
  } catch (error) {
    console.error('Get user carts error:', error);
    return []; // Return empty array instead of throwing to handle no carts case
  }
};

// Create new cart function
export const createNewUserCart = async (userId: string, name: string): Promise<Cart> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        name, // Added cart name
        products: []
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create new cart');
    }

    return await response.json();
  } catch (error) {
    console.error('Create cart error:', error);
    throw error;
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
      store: p.store, // Include store in the cart products
      quantity: 1
    }));

    const response = await fetch(`${API_BASE_URL}/api/cart/add/${cartId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        products: cartProducts
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save to cart');
    }

    return await response.json();
  } catch (error) {
    console.error('Cart save error:', error);
    throw error;
  }
};