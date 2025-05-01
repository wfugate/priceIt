import { useState } from 'react';
import { Cart } from '../app/types';
import { deleteCart, removeProductFromCart, getUserCarts } from '../services/cartService';
import { Alert } from 'react-native';

// hook for managing user shopping carts
export function useCartManagement(userId: string | undefined) {
  // state for user's carts
  const [carts, setCarts] = useState<Cart[]>([]);
  // set of selected cart IDs for multi-select operations
  const [selectedCartIds, setSelectedCartIds] = useState<Set<string>>(new Set());
  // loading state for initial data fetch
  const [loading, setLoading] = useState(true);
  // loading state for refresh operations
  const [isRefreshing, setIsRefreshing] = useState(false);
  // currently viewed cart for inspection
  const [currentCart, setCurrentCart] = useState<Cart | null>(null);

  // fetch user's carts from the API
  const fetchUserCarts = async (showLoadingIndicator = true) => {
    if (!userId) return false;
    
    if (showLoadingIndicator) {
      setIsRefreshing(true);
    }
    
    try {
      // get carts from API
      const response = await getUserCarts(userId);
      setCarts(response);
      return true;
    } catch (error) {
      console.error('Error fetching carts:', error);
      Alert.alert('Error', 'Failed to load your carts. Please try again.');
      return false;
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  // toggle selection of a cart for multi-select operations
  const toggleCartSelection = (cartId: string) => {
    setSelectedCartIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cartId)) {
        newSet.delete(cartId);
      } else {
        newSet.add(cartId);
      }
      return newSet;
    });
  };

  // check if a cart is currently selected
  const isCartSelected = (cartId: string) => {
    return selectedCartIds.has(cartId);
  };

  // get array of currently selected carts
  const getSelectedCarts = () => {
    return carts.filter(cart => selectedCartIds.has(cart.id));
  };

  // set the current cart for inspection
  const handleInspectCart = (cartId: string) => {
    const cart = carts.find(c => c.id === cartId);
    if (cart) {
      setCurrentCart(cart);
      return cart;
    }
    return null;
  };

  // delete a cart by ID
  const deleteCartById = async (cartId: string) => {
    if (!userId) return false;
    
    try {
      // call API to delete the cart
      await deleteCart(cartId, userId);
      // refresh cart list
      await fetchUserCarts(false);
      return true;
    } catch (error) {
      console.error('Error deleting cart:', error);
      return false;
    }
  };

  // delete a product from a cart
  const deleteCartItem = async (cartId: string, productId: string) => {
    if (!userId) return null;
    
    try {
      // call API to remove product from cart
      const updatedCart = await removeProductFromCart(cartId, productId, userId);
      
      // update the carts state with modified cart
      setCarts(prevCarts => 
        prevCarts.map(cart => 
          cart.id === updatedCart.id ? updatedCart : cart
        )
      );
      
      // update current cart if it's being viewed
      if (currentCart && currentCart.id === updatedCart.id) {
        setCurrentCart(updatedCart);
      }
      
      return updatedCart;
    } catch (error) {
      console.error('Error deleting item:', error);
      return null;
    }
  };

  return {
    carts,
    loading,
    isRefreshing,
    currentCart,
    setCurrentCart,
    fetchUserCarts,
    toggleCartSelection,
    isCartSelected,
    getSelectedCarts,
    handleInspectCart,
    deleteCartById,
    deleteCartItem
  };
}