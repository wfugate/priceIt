// // app/services/scanService.ts
// import axios from 'axios';
// interface ApiError {
//     message: string;
//     status?: number;
//     data?: any;
//     config?: {
//       url?: string;
//       method?: string;
//       params?: any;
//     };
//   }
//   interface Product {
//     id: string;
//     thumbnail: string;
//     price: number;
//     name: string;
//     brand: string;
//     selected?: boolean;
//   }

// export const scanImage = async (base64Image: string) => {
//   const response = await axios.post(
//     'https://e4ec-128-197-28-175.ngrok-free.app/api/ImageProcessing/process',
//     { image: `data:image/jpeg;base64,${base64Image}` },
//     {
//       headers: {
//         'Content-Type': 'application/json',
//         'ngrok-skip-browser-warning': 'true'
//       },
//       timeout: 30000
//     }
    
//   );
//   return response.data;
// };
// export const searchProducts = async (query: string): Promise<Product[]> => {
//   try {
//     const url = `https://e4ec-128-197-28-175.ngrok-free.app/api/Target/search?query=${query}`;
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//       },
      
//     });
//     const data = await response.json();
//     console.log(data);
    
//     return data.map((item: any) => ({
//       id: item.productId,
//       thumbnail: item.thumbnail,
//       price: item.price,
//       name: item.name,
//       brand: item.brand
//     }));
//   } catch (error) {
//     console.error('Search products error:', error);
//     return [];
//   }
// };

// // export const searchProducts = async (query: string): Promise<Product[]> => {
// //     try {
// //       const response = await axios.get(
// //         `https://e4ec-128-197-28-175.ngrok-free.app/api/Target/search`,
// //         {
// //           params: { query: query.trim() },
// //           headers: {
// //             'Accept': 'application/json',
// //             'ngrok-skip-browser-warning': 'true'
// //           }
// //         }
// //       );
// //       return response.data;
// //     } catch (error: unknown) {
// //       // Simple type assertion
// //       const err = error as Error;
// //       console.error('Search failed:', err.message);
      
// //       // More specific Axios error handling
// //       if (axios.isAxiosError(error)) {
// //         console.error('Axios error details:', {
// //           status: error.response?.status,
// //           data: error.response?.data,
// //           url: error.config?.url
// //         });
// //       }
      
// //       throw new Error('Failed to search products');
// //     }
// //   };




// // services/scanService.ts
// // Add these new functions:
// interface Cart {
//   _id: string; // MongoDB ID
//   userId: string;
//   products: any[]; // Adjust this type based on your product structure
//   createdAt?: string;
// }

// interface CartProduct {
//     productId: string;
//     thumbnail: string;
//     price: number;
//     name: string;
//     brand: string;
//     quantity?: number;
//   }
// export const getUserCarts = async (userId: string): Promise<Cart[]> => {
//   try {
//     const response = await fetch(`https://e4ec-128-197-28-175.ngrok-free.app/api/cart?userId=${userId}`, {
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
//     throw error;
//   }
// };

// export const createNewUserCart = async (userId: string): Promise<Cart> => {
//   try {
//     const response = await fetch('https://e4ec-128-197-28-175.ngrok-free.app/api/cart', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         userId,
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

// // Update the existing saveToCart function
// export const saveToCart = async (
//   products: Product[],
//   userId: string,
//   cartId: string // Now required
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

//     const response = await fetch(`https://e4ec-128-197-28-175.ngrok-free.app/api/cart/add${cartId}`, {
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
// // services/scanService.ts
// // interface CartProduct {
// //   productId: string;
// //   thumbnail: string;
// //   price: number;
// //   name: string;
// //   brand: string;
// //   quantity?: number;
// // }
// // export const saveToCart = async (
// //   products: Product[],
// //   userId: string
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

// //     const response = await fetch('https://e4ec-128-197-28-175.ngrok-free.app/api/cart/add', {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json',
// //       },
// //       body: JSON.stringify({
// //         userId: userId,
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
    'https://a867-2600-387-15-915-00-5.ngrok-free.app/api/ImageProcessing/process',
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
    const url = `https://a867-2600-387-15-915-00-5.ngrok-free.app/api/Target/search?query=${query}`;
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
    const response = await fetch(`https://a867-2600-387-15-915-00-5.ngrok-free.app/api/cart?userId=${userId}`, {
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
    const response = await fetch('https://a867-2600-387-15-915-00-5.ngrok-free.app/api/cart', {
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
    const response = await fetch(`https://a867-2600-387-15-915-00-5.ngrok-free.app/api/cart/add/${cartId}`, {
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