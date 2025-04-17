

// // // app/services/scanService.ts
// // import axios from 'axios';

// // // Interfaces
// // interface ApiError {
// //   message: string;
// //   status?: number;
// //   data?: any;
// //   config?: {
// //     url?: string;
// //     method?: string;
// //     params?: any;
// //   };
// // }

// // interface Product {
// //   id: string;
// //   thumbnail: string;
// //   price: number;
// //   name: string;
// //   brand: string;
// //   selected?: boolean;
// // }

// // interface Cart {
// //   id: string;
// //   name: string;
// //   userId: string;
// //   products: any[];
// //   createdAt?: string;
// // }

// // interface Stores {  //add stores for functionality
// //   walmart: boolean;
// //   target: boolean;
// // }

// // interface CartProduct {
// //   productId: string;
// //   thumbnail: string;
// //   price: number;
// //   name: string;
// //   brand: string;
// //   quantity?: number;
// // }

// // // Image processing function
// // export const scanImage = async (base64Image: string) => {
// //   const response = await axios.post(
// //     'https://4c21-128-197-28-168.ngrok-free.app/api/ImageProcessing/process',
// //     { image: `data:image/jpeg;base64,${base64Image}` },
// //     {
// //       headers: {
// //         'Content-Type': 'application/json',
// //         'ngrok-skip-browser-warning': 'true'
// //       },
// //       timeout: 30000
// //     }
// //   );
// //   return response.data;
// // };

// // // Product search function
// // export const searchProducts = async (query: string): Promise<Product[]> => { 
// //   try {
// //     const url = `https://4c21-128-197-28-168.ngrok-free.app/api/Target/search?query=${query}`;
// //     const response = await fetch(url, {
// //       method: 'GET',
// //       headers: {
// //         'Accept': 'application/json',
// //       },
// //     });
// //     const data = await response.json();
    
// //     return data.map((item: any) => ({
// //       id: item.productId,
// //       thumbnail: item.thumbnail,
// //       price: item.price,
// //       name: item.name,
// //       brand: item.brand
// //     }));
// //   } catch (error) {
// //     console.error('Search products error:', error);
// //     return [];
// //   }
// // };

// // // Get user carts function
// // export const getUserCarts = async (userId: string): Promise<Cart[]> => {
// //   try {
// //     const response = await fetch(`https://4c21-128-197-28-168.ngrok-free.app/api/cart?userId=${userId}`, {
// //       method: 'GET',
// //       headers: {
// //         'Content-Type': 'application/json',
// //       },
// //     });

// //     if (!response.ok) {
// //       throw new Error('Failed to fetch user carts');
// //     }

// //     return await response.json();
// //   } catch (error) {
// //     console.error('Get user carts error:', error);
// //     return []; // Return empty array instead of throwing to handle no carts case
// //   }
// // };

// // // Create new cart function
// // export const createNewUserCart = async (userId: string, name: string): Promise<Cart> => {
// //   try {
// //     const response = await fetch('https://4c21-128-197-28-168.ngrok-free.app/api/cart', {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json',
// //       },
// //       body: JSON.stringify({
// //         userId,
// //         name, // Added cart name
// //         products: []
// //       })
// //     });

// //     if (!response.ok) {
// //       throw new Error('Failed to create new cart');
// //     }

// //     return await response.json();
// //   } catch (error) {
// //     console.error('Create cart error:', error);
// //     throw error;
// //   }
// // };

// // // Add products to cart function - FIXED URL
// // export const saveToCart = async (
// //   products: Product[],
// //   userId: string,
// //   cartId: string
// // ): Promise<void> => {
// //   try {
// //     const cartProducts: CartProduct[] = products.map(p => ({
// //       productId: p.id,
// //       thumbnail: p.thumbnail,
// //       price: p.price,
// //       name: p.name,
// //       brand: p.brand,
// //       quantity: 1
// //     }));

// //     // Fixed URL with correct slash
// //     const response = await fetch(`https://4c21-128-197-28-168.ngrok-free.app/api/cart/add/${cartId}`, {
// //       method: 'PUT',
// //       headers: {
// //         'Content-Type': 'application/json',
// //       },
// //       body: JSON.stringify({
// //         userId,
// //         products: cartProducts
// //       })
// //     });

// //     if (!response.ok) {
// //       const errorData = await response.json();
// //       throw new Error(errorData.message || 'Failed to save to cart');
// //     }

// //     return await response.json();
// //   } catch (error) {
// //     console.error('Cart save error:', error);
// //     throw error;
// //   }
// // };

// // app/services/scanService.ts
// import axios from 'axios';

// // Interfaces
// interface ApiError {
//   message: string;
//   status?: number;
//   data?: any;
//   config?: {
//     url?: string;
//     method?: string;
//     params?: any;
//   };
// }

// interface Product {
//   id: string;
//   thumbnail: string;
//   price: number;
//   name: string;
//   brand: string;
//   selected?: boolean;
// }

// interface Cart {
//   id: string;
//   name: string;
//   userId: string;
//   products: any[];
//   createdAt?: string;
// }

// interface Stores {  //add stores for functionality
//   walmart: boolean;
//   target: boolean;
// }

// interface CartProduct {
//   productId: string;
//   thumbnail: string;
//   price: number;
//   name: string;
//   brand: string;
//   quantity?: number;
// }

// // Image processing function
// export const scanImage = async (base64Image: string) => {
//   try {
//     const response = await axios.post(
//       'https://4c21-128-197-28-168.ngrok-free.app/api/ImageProcessing/process',
//       { image: `data:image/jpeg;base64,${base64Image}` },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'ngrok-skip-browser-warning': 'true'
//         },
//         timeout: 30000
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Scan image error:', error);
//     // Return a consistent object structure even on error
//     return { item: null, error: 'Failed to process image' };
//   }
// };

// // Product search function - fixed to handle empty results properly
// export const searchProducts = async (query: string): Promise<Product[]> => { 
//   try {
//     if (!query || query.trim() === '') {
//       console.log('Empty query provided to searchProducts');
//       return []; // Return empty array for empty queries
//     }

//     const url = `https://4c21-128-197-28-168.ngrok-free.app/api/Target/search?query=${encodeURIComponent(query.trim())}`;
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'ngrok-skip-browser-warning': 'true'
//       },
//     });
    
//     if (!response.ok) {
//       console.log(`API error: ${response.status} ${response.statusText}`);
//       return [];
//     }
    
//     const data = await response.json();
    
//     // Handle data that isn't an array or is null/undefined
//     if (!data) {
//       console.log('API returned no data');
//       return [];
//     }
    
//     if (!Array.isArray(data)) {
//       console.log('API did not return an array:', typeof data);
//       // Try to extract results if data is an object with a results property
//       return Array.isArray(data.results) ? data.results.map(mapProductFields) : [];
//     }
    
//     // Map the data to our Product type
//     return data.map(mapProductFields);
//   } catch (error) {
//     console.error('Search products error:', error);
//     return []; // Always return an empty array on error
//   }
// };

// // Helper function to map API response fields to our Product type
// const mapProductFields = (item: any): Product => ({
//   id: item.productId || item.id || `product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
//   thumbnail: item.thumbnail || item.imageUrl || 'https://via.placeholder.com/150',
//   price: typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.price === 'number' ? item.price : 0),
//   name: item.name || item.title || 'Unknown Product',
//   brand: item.brand || 'Unknown'
// });

// // Get user carts function
// export const getUserCarts = async (userId: string): Promise<Cart[]> => {
//   try {
//     const response = await fetch(`https://4c21-128-197-28-168.ngrok-free.app/api/cart?userId=${userId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to fetch user carts');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Get user carts error:', error);
//     return []; // Return empty array instead of throwing to handle no carts case
//   }
// };

// // Create new cart function
// export const createNewUserCart = async (userId: string, name: string): Promise<Cart> => {
//   try {
//     const response = await fetch('https://4c21-128-197-28-168.ngrok-free.app/api/cart', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         userId,
//         name, // Added cart name
//         products: []
//       })
//     });

//     if (!response.ok) {
//       throw new Error('Failed to create new cart');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Create cart error:', error);
//     throw error;
//   }
// };

// // Add products to cart function
// export const saveToCart = async (
//   products: Product[],
//   userId: string,
//   cartId: string
// ): Promise<void> => {
//   try {
//     const cartProducts: CartProduct[] = products.map(p => ({
//       productId: p.id,
//       thumbnail: p.thumbnail,
//       price: p.price,
//       name: p.name,
//       brand: p.brand,
//       quantity: 1
//     }));

//     const response = await fetch(`https://4c21-128-197-28-168.ngrok-free.app/api/cart/add/${cartId}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         userId,
//         products: cartProducts
//       })
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || 'Failed to save to cart');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Cart save error:', error);
//     throw error;
//   }
// };
// app/services/scanService.ts
// app/services/scanService.ts
// app/services/scanService.ts
import axios from 'axios';
import { API_ENDPOINTS, COMMON_HEADERS } from '../config/apiConfig';

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

export interface Product {
  id: string;
  thumbnail: string;
  price: number;
  name: string;
  brand: string;
  selected?: boolean;
}

export interface Cart {
  id: string;
  name: string;
  userId: string;
  products: any[];
  createdAt?: string;
}

interface Stores {
  walmart: boolean;
  target: boolean;
}

export interface CartProduct {
  productId: string;
  thumbnail: string;
  price: number;
  name: string;
  brand: string;
  quantity?: number;
}

// Image processing function
export const scanImage = async (base64Image: string) => {
  try {
    const response = await axios.post(
      API_ENDPOINTS.imageProcessing.process,
      { image: `data:image/jpeg;base64,${base64Image}` },
      {
        headers: COMMON_HEADERS,
        timeout: 30000
      }
    );
    return response.data;
  } catch (error: any) { // Explicitly type as any or unknown and handle properly
    console.error('Scan image error:', error);
    // Return a consistent object structure even on error
    return { item: null, error: 'Failed to process image' };
  }
};

// Product search function - with enhanced error handling and logging
export const searchProducts = async (query: string): Promise<Product[]> => { 
  try {
    if (!query || query.trim() === '') {
      console.log('Empty query provided to searchProducts');
      return []; // Return empty array for empty queries
    }

    const encodedQuery = encodeURIComponent(query.trim());
    console.log(`Searching for products with query: "${query.trim()}"`);
    
    // Create an AbortController to handle timeout manually
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    console.log(`Making request to: ${API_ENDPOINTS.products.search}?query=${encodedQuery}`);
    
    const response = await fetch(`${API_ENDPOINTS.products.search}?query=${encodedQuery}`, {
      method: 'GET',
      headers: COMMON_HEADERS,
      signal: controller.signal
    });
    
    // Clear the timeout since the request completed
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    // Safely parse JSON with error handling
    let data;
    try {
      const text = await response.text();
      console.log(`Response text (first 100 chars): ${text.substring(0, 100)}...`);
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return [];
    }
    
    // Handle data that isn't an array or is null/undefined
    if (!data) {
      console.log('API returned no data');
      return [];
    }
    
    console.log(`Response data type: ${typeof data}`, Array.isArray(data) ? 'Is array' : 'Not array');
    
    if (!Array.isArray(data)) {
      console.log('API did not return an array, trying to extract results property');
      // Try to extract results if data is an object with a results property
      if (data.results && Array.isArray(data.results)) {
        console.log(`Found results array with ${data.results.length} items`);
        return data.results.map(mapProductFields);
      }
      
      // Last resort - try to convert object to array if possible
      if (typeof data === 'object') {
        const entries = Object.entries(data);
        console.log(`Converting object with ${entries.length} entries to array`);
        return entries
          .filter(([key, value]) => typeof value === 'object')
          .map(([key, value]) => mapProductFields(value));
      }
      
      console.log('Could not convert response to product array');
      return [];
    }
    
    console.log(`Processing array with ${data.length} items`);
    // Map the data to our Product type
    return data.map(mapProductFields);
  } catch (error: unknown) { // Explicitly type as unknown
    // Handle AbortError specially
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('Search request timed out after 10 seconds');
      } else {
        console.error('Search products error:', error.message);
      }
    } else {
      console.error('Unknown search products error');
    }
    return []; // Always return an empty array on error
  }
};

// Helper function to map API response fields to our Product type
const mapProductFields = (item: any): Product => ({
  id: item.productId || item.id || `product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  thumbnail: item.thumbnail || item.imageUrl || 'https://via.placeholder.com/150',
  price: typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.price === 'number' ? item.price : 0),
  name: item.name || item.title || 'Unknown Product',
  brand: item.brand || 'Unknown'
});

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
  } catch (error: unknown) { // Explicitly type as unknown
    if (error instanceof Error) {
      console.error('Get user carts error:', error.message);
    } else {
      console.error('Unknown error fetching user carts');
    }
    return []; // Return empty array instead of throwing to handle no carts case
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
        name, // Added cart name
        products: []
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create new cart');
    }

    return await response.json();
  } catch (error: unknown) { // Explicitly type as unknown
    if (error instanceof Error) {
      console.error('Create cart error:', error.message);
    } else {
      console.error('Unknown error creating cart');
    }
    throw new Error('Failed to create cart'); // Rethrow with a properly typed error
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
      quantity: 1
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
      throw new Error(errorData.message || 'Failed to save to cart');
    }

    return await response.json();
  } catch (error: unknown) { // Explicitly type as unknown
    if (error instanceof Error) {
      console.error('Cart save error:', error.message);
    } else {
      console.error('Unknown cart save error');
    }
    throw new Error('Failed to save products to cart'); // Rethrow with a properly typed error
  }
};