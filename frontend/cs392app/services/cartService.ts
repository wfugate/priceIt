import { API_ENDPOINTS, COMMON_HEADERS } from '../config/apiConfig';
import { Product, Cart, CartProduct } from '../app/types';

// get user carts from backend
export const getUserCarts = async (userId: string): Promise<Cart[]> => {
  try {
    // fetch all carts for the specified user
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
    // return mock data on error to prevent crashes
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

// create a new cart for a user
export const createNewUserCart = async (userId: string, name: string): Promise<Cart> => {
  try {
    // send request to create new cart
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
    
    // return mock cart on error to prevent crashes
    return {
      id: `${Date.now()}`,
      name: name,
      userId: userId,
      products: [],
      createdAt: new Date().toISOString()
    };
  }
};

// update an existing cart
export const updateCart = async (
    cartId: string,
    userId: string,
    products: any[],
    name?: string
  ): Promise<Cart> => {
    try {
      // handle empty products array
      const productsToProcess = Array.isArray(products) ? products : [];
      
      console.log("Got to updateCart......to do: standardizedProducts");
      
      // standardize product properties to ensure consistency
      const standardizedProducts = productsToProcess.length > 0 
        ? productsToProcess.map(product => ({
            ProductId: product.productId || product.id || `product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            Thumbnail: product.thumbnail || 'https://via.placeholder.com/80',
            Price: typeof product.price === 'number' ? product.price : 0,
            Name: product.name || 'Product',
            Brand: product.brand || 'Brand',
            Store: product.store || 'Unknown Store', // ensure store is always included
            ProductUrl: product.url || product.productUrl || `https://${product.store || 'unknown'}.com`
          }))
        : []; // use empty array when no products
  
      console.log("Got to updateCart......did: standardizedProducts", 
        standardizedProducts.length > 0 
          ? standardizedProducts[0].ProductUrl 
          : "No products to standardize - sending empty array");
          
      console.log(API_ENDPOINTS.cart.update(cartId));
      
      // send request to update cart
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
        console.log("failed fetch for updateCart");
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to update cart: ${response.status}`);
      }
      console.log("passed fetch for updateCart");
  
      return await response.json();
    } catch (error) {
      console.error('Update cart error:', error);
      
      // return mock cart on error to prevent crashes
      return {
        id: cartId,
        name: name || 'Updated Cart',
        userId: userId,
        products: Array.isArray(products) && products.length > 0 
          ? products.map(product => ({
              ProductId: product.id || product.productId || `product-${Date.now()}`,
              Thumbnail: product.thumbnail || 'https://via.placeholder.com/80',
              Price: typeof product.price === 'number' ? product.price : 0,
              Name: product.name || 'Product',
              Brand: product.brand || 'Brand',
              Store: product.store || 'Unknown Store',
              Quantity: product.quantity || 1,
              ProductUrl: product.url || product.productUrl || `https://${product.store || 'unknown'}.com`
            }))
          : [], // empty array for empty products
        createdAt: new Date().toISOString()
      };
    }
  };

// add products to a cart
export const saveToCart = async (
  products: Product[],
  userId: string,
  cartId: string
): Promise<void> => {
  try {
    // map products to cart product format
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
    
    // send request to add products to cart
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
    // just return mock success
    return;
  }
};

// delete a cart
export const deleteCart = async (cartId: string, userId: string): Promise<boolean> => {
  try {
    console.log("Here")
    // send request to delete cart
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

// remove a product from a cart
export const removeProductFromCart = async (
  cartId: string,
  productId: string,
  userId: string
): Promise<Cart> => {
  try {
    console.log("removeProductFromCart triggered")
    // send request to remove product from cart
    const response = await fetch(`${API_ENDPOINTS.cart.getAll}/${cartId}/products/${productId}?userId=${userId}`, {
      method: 'DELETE',
      headers: COMMON_HEADERS
    });

    if (!response.ok) {
      // fallback to client-side product removal if API fails
      console.warn('Backend product removal API returned an error. Implementing client-side fallback.');
      
      // fetch the current cart
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
      
      // filter out the product to be removed
      const updatedProducts = cart.products.filter((p: any) => 
        p.id !== productId && p.productId !== productId
      );
      
      // update the cart with the filtered products
      return await updateCart(cartId, userId, updatedProducts, cart.name);
    }

    return await response.json();
  } catch (error) {
    console.error('Remove product error:', error);
    throw error;
  }
};