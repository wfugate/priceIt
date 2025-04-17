

// app/services/scanService.ts
import axios from 'axios';

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

interface Product {
  id: string;
  thumbnail: string;
  price: number;
  name: string;
  brand: string;
  selected?: boolean;
}

interface Cart {
  id: string;
  name: string;
  userId: string;
  products: any[];
  createdAt?: string;
}

interface Stores {  //add stores for functionality
  walmart: boolean;
  target: boolean;
}

interface CartProduct {
  productId: string;
  thumbnail: string;
  price: number;
  name: string;
  brand: string;
  quantity?: number;
}

// Image processing function
export const scanImage = async (base64Image: string) => {
  const response = await axios.post(
    'https://4c21-128-197-28-168.ngrok-free.app/api/ImageProcessing/process',
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

// Product search function
export const searchProducts = async (query: string): Promise<Product[]> => { 
  try {
    const url = `https://4c21-128-197-28-168.ngrok-free.app/api/Target/search?query=${query}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: item.productId,
      thumbnail: item.thumbnail,
      price: item.price,
      name: item.name,
      brand: item.brand
    }));
  } catch (error) {
    console.error('Search products error:', error);
    return [];
  }
};

// Get user carts function
export const getUserCarts = async (userId: string): Promise<Cart[]> => {
  try {
    const response = await fetch(`https://4c21-128-197-28-168.ngrok-free.app/api/cart?userId=${userId}`, {
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
    const response = await fetch('https://4c21-128-197-28-168.ngrok-free.app/api/cart', {
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

// Add products to cart function - FIXED URL
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

    // Fixed URL with correct slash
    const response = await fetch(`https://4c21-128-197-28-168.ngrok-free.app/api/cart/add/${cartId}`, {
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
// app/services/scanService.ts (fixed version)
// import axios from 'axios';

// // Base URL for API calls
// const API_BASE_URL = 'https://4c21-128-197-28-168.ngrok-free.app/api';

// // Better error handling utility
// const handleApiError = (error: any, actionName: string) => {
//   console.error(`Error in ${actionName}:`, error);
  
//   if (axios.isAxiosError(error)) {
//     return {
//       message: error.message,
//       status: error.response?.status,
//       data: error.response?.data,
//       url: error.config?.url
//     };
//   }
  
//   return { message: `Failed during ${actionName}` };
// };

// // Image processing function
// export const scanImage = async (base64Image: string) => {
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}/ImageProcessing/process`,
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
//     const errorDetails = handleApiError(error, 'image scanning');
//     console.error('Scan image error details:', errorDetails);
//     // Return a predictable result shape even on error
//     return { item: null, error: errorDetails };
//   }
// };

// // Product search function
// export const searchProducts = async (query: string) => { 
//   if (!query || query.trim() === '') {
//     console.log('Empty query provided to searchProducts');
//     return []; // Return empty array for empty queries
//   }
  
//   try {
//     const url = `${API_BASE_URL}/Target/search?query=${encodeURIComponent(query.trim())}`;
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'ngrok-skip-browser-warning': 'true'
//       },
//     });
    
//     if (!response.ok) {
//       throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
//     }
    
//     const data = await response.json();
    
//     // Ensure we return an array
//     if (!data) {
//       console.log('API returned no data');
//       return [];
//     }
    
//     if (!Array.isArray(data)) {
//       console.log('API did not return an array:', typeof data);
//       return Array.isArray(data.results) ? data.results : [];
//     }
    
//     return data.map((item: any) => ({
//       id: item.productId || item.id || `${Date.now()}-${Math.random().toString(36).substring(7)}`,
//       thumbnail: item.thumbnail || item.imageUrl || 'https://via.placeholder.com/150',
//       price: parseFloat(item.price) || 0,
//       name: item.name || item.title || query,
//       brand: item.brand || 'Unknown'
//     }));
//   } catch (error) {
//     console.error('Search products error:', error);
//     return []; // Always return an array even on error
//   }
// };

// // Get user carts function
// export const getUserCarts = async (userId: string) => {
//   if (!userId) {
//     console.warn('getUserCarts called with empty userId');
//     return [];
//   }
  
//   try {
//     const response = await fetch(`${API_BASE_URL}/cart?userId=${userId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'ngrok-skip-browser-warning': 'true'
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch user carts: ${response.status}`);
//     }

//     const data = await response.json();
    
//     // Ensure we return an array
//     return Array.isArray(data) ? data : [];
//   } catch (error) {
//     console.error('Get user carts error:', error);
//     return []; // Return empty array on error
//   }
// };

// // Create new cart function
// export const createNewUserCart = async (userId: string, name: string) => {
//   if (!userId) {
//     throw new Error('createNewUserCart: userId is required');
//   }
  
//   try {
//     const response = await fetch(`${API_BASE_URL}/cart`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'ngrok-skip-browser-warning': 'true'
//       },
//       body: JSON.stringify({
//         userId,
//         name: name || `Cart ${new Date().toLocaleString()}`,
//         products: []
//       })
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to create new cart: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Create cart error:', error);
//     throw error;
//   }
// };

// // Add products to cart function
// export const saveToCart = async (
//   products: any[],
//   userId: string,
//   cartId: string
// ) => {
//   if (!products || !Array.isArray(products) || products.length === 0) {
//     throw new Error('saveToCart: No products provided');
//   }
  
//   if (!userId) {
//     throw new Error('saveToCart: userId is required');
//   }
  
//   if (!cartId) {
//     throw new Error('saveToCart: cartId is required');
//   }
  
//   try {
//     const cartProducts = products.map(p => ({
//       productId: p.id,
//       thumbnail: p.thumbnail || 'https://via.placeholder.com/150',
//       price: typeof p.price === 'string' ? parseFloat(p.price) : (p.price || 0),
//       name: p.name || 'Product',
//       brand: p.brand || 'Unknown',
//       quantity: 1
//     }));

//     const response = await fetch(`${API_BASE_URL}/cart/add/${cartId}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'ngrok-skip-browser-warning': 'true'
//       },
//       body: JSON.stringify({
//         userId,
//         products: cartProducts
//       })
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({
//         message: `HTTP error! Status: ${response.status}`
//       }));
//       throw new Error(errorData.message || 'Failed to save to cart');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Cart save error:', error);
//     throw error;
//   }
// };