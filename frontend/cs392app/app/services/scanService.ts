// app/services/scanService.ts
import axios from 'axios';
import { API_ENDPOINTS, COMMON_HEADERS, API_BASE_URL } from '../config/apiConfig';
import { Product, Cart, Stores, CartProduct } from '../types';

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
  } catch (error) {
    console.error('Scan image error:', error);
    return { item: null, error: 'Failed to process image' };
  }
};

// Product search function with store selection
export const searchProducts = async function(query: string, stores: Stores = { walmart: true, target: true, costco: true, samsClub: true }): Promise<Product[]> { 
  try {
    const results: Product[] = [];
    
    // Search Target if selected - using Unwrangle API
    if (stores.target) {
      try {
        // Target uses the Unwrangle API
        const targetUrl = `${API_ENDPOINTS.products.target}?query=${encodeURIComponent(query)}`;
        const targetResponse = await fetch(targetUrl, {
          method: 'GET',
          headers: COMMON_HEADERS,
        });
        
        if (!targetResponse.ok) {
          console.error(`Target search error: ${targetResponse.status}`);
          throw new Error(`Target API returned status ${targetResponse.status}`);
        }
        
        const targetData = await targetResponse.json();
        
        const targetProducts = targetData.map((item: any) => ({
          id: item.productId || `target-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          thumbnail: item.thumbnail,
          price: typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.price === 'number' ? item.price : 0),
          name: item.name,
          brand: item.brand || 'Target',
          store: 'Target', // Always set store to Target for these products
          url: item.url,
        }));
        
        results.push(...targetProducts);
      } catch (error) {
        console.error('Target search error:', error);
      }
    }
    
    // For other stores, we'll just add fake placeholder results for now
    // since the backend APIs aren't active yet
    
    // Add Walmart placeholder results if selected
    if (stores.walmart) {
      try {
        // Try the API first in case it comes back online
        const walmartUrl = `${API_ENDPOINTS.products.walmart}?query=${encodeURIComponent(query)}`;
        const walmartResponse = await fetch(walmartUrl, {
          method: 'GET',
          headers: COMMON_HEADERS,
        });
        
        if (walmartResponse.ok) {
          const walmartData = await walmartResponse.json();
          
          const walmartProducts = walmartData.map((item: any) => ({
            id: item.productId || `walmart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            thumbnail: item.thumbnail,
            price: typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.price === 'number' ? item.price : 0),
            name: item.name,
            brand: item.brand || 'Walmart',
            store: 'Walmart',
            url: item.productUrl
          }));
          
          results.push(...walmartProducts);
        } else {
          // Add placeholder result
          results.push({
            id: `walmart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            thumbnail: 'https://via.placeholder.com/150',
            price: 29.99,
            name: `${query} - Walmart Product`,
            brand: 'Walmart',
            store: 'Walmart',
            url: 'https://walmart.com'
          });
        }
      } catch (error) {
        console.error('Walmart search error:', error);
        // Add placeholder result on error
        results.push({
          id: `walmart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          thumbnail: 'https://via.placeholder.com/150',
          price: 29.99,
          name: `${query} - Walmart Product`,
          brand: 'Walmart',
          store: 'Walmart',
          url: 'https://walmart.com'
        });
      }
    }
    
    // Add Costco placeholder results if selected
    if (stores.costco) {
      try {
        // Try the API first in case it comes back online
        const costcoUrl = `${API_ENDPOINTS.products.costco}?query=${encodeURIComponent(query)}`;
        const costcoResponse = await fetch(costcoUrl, {
          method: 'GET',
          headers: COMMON_HEADERS,
        });
        
        if (costcoResponse.ok) {
          const costcoData = await costcoResponse.json();
          
          const costcoProducts = costcoData.map((item: any) => ({
            id: item.productId || `costco-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            thumbnail: item.thumbnail,
            price: typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.price === 'number' ? item.price : 0),
            name: item.name, 
            brand: item.brand || 'Costco',
            store: 'Costco',
            url: item.productUrl
          }));
          
          results.push(...costcoProducts);
        } else {
          // Add placeholder result
          results.push({
            id: `costco-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            thumbnail: 'https://via.placeholder.com/150',
            price: 34.99,
            name: `${query} - Costco Product`,
            brand: 'Costco',
            store: 'Costco',
            url: 'https://costco.com'
          });
        }
      } catch (error) {
        console.error('Costco search error:', error);
        // Add placeholder result on error
        results.push({
          id: `costco-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          thumbnail: 'https://via.placeholder.com/150',
          price: 34.99,
          name: `${query} - Costco Product`,
          brand: 'Costco',
          store: 'Costco',
          url: 'https://costco.com'
        });
      }
    }
    
    // Add Sam's Club placeholder results if selected
    if (stores.samsClub) {
      try {
        // Try the API first in case it comes back online
        const samsClubUrl = `${API_ENDPOINTS.products.samsClub}?query=${encodeURIComponent(query)}`;
        const samsClubResponse = await fetch(samsClubUrl, {
          method: 'GET',
          headers: COMMON_HEADERS,
        });
        
        if (samsClubResponse.ok) {
          const samsClubData = await samsClubResponse.json();
          
          console.log(`samsClubData: ${JSON.stringify(samsClubData, null, 2)}`);

          const samsClubProducts = samsClubData.map((item: any) => ({
            id: item.productId || `samsclub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            thumbnail: item.thumbnail,
            price: typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.price === 'number' ? item.price : 0),
            name: item.name,
            brand: item.brand || "Sam's Club",
            store: "Sam's Club",
            url: item.productUrl
          }));
          
          console.log(`samsClubResponse mapped: ${samsClubProducts[0].name} ${samsClubProducts[0].url}`);
          results.push(...samsClubProducts);
        } else {
          // Add placeholder result
          results.push({
            id: `samsclub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            thumbnail: 'https://via.placeholder.com/150',
            price: 32.99,
            name: `${query} - Sam's Club Product`,
            brand: "Sam's Club",
            store: "Sam's Club",
            url: 'https://samsclub.com'
          });
        }
      } catch (error) {
        console.error("Sam's Club search error:", error);
        // Add placeholder result on error
        results.push({
          id: `samsclub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          thumbnail: 'https://via.placeholder.com/150',
          price: 32.99,
          name: `${query} - Sam's Club Product`,
          brand: "Sam's Club",
          store: "Sam's Club",
          url: 'https://samsclub.com'
        });
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

// For barcode scanning support
export const getProductByBarcode = async (barcode: string, stores: Stores = { walmart: true, target: true, costco: true, samsClub: true }) => {
  if (!barcode || typeof barcode !== 'string' || barcode.trim() === '') {
    console.warn('getProductByBarcode called with invalid barcode');
    return [];
  }
  
  try {
    const cleanBarcode = barcode.trim();
    console.log(`Looking up products for barcode: ${cleanBarcode}`);
    
    // Use the standard searchProducts function with the barcode as the query
    return await searchProducts(cleanBarcode, stores);
  } catch (error) {
    console.error('Error in getProductByBarcode:', error);
    return [];
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
export default function removeWarning(){}
