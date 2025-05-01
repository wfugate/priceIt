// app/hooks/useCartManagement.ts
import { useState, useRef } from 'react';
import { Cart } from '../types';
import { deleteCart, removeProductFromCart, getUserCarts } from '../services/cartService';
import { Alert } from 'react-native';

export function useCartManagement(userId: string | undefined) {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [selectedCartIds, setSelectedCartIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentCart, setCurrentCart] = useState<Cart | null>(null);
  
  // Add a ref to track last fetch time to prevent excessive fetching
  const lastFetchTimeRef = useRef<number>(0);

  const fetchUserCarts = async (showLoadingIndicator = true) => {
    if (!userId) return false;
    
    // Add debounce logic to prevent frequent refetches
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (timeSinceLastFetch < 2000) { // 2 seconds debounce
      return true; // Return true to indicate "success" without actual fetch
    }
    
    if (showLoadingIndicator) {
      setIsRefreshing(true);
    }
    
    try {
      const response = await getUserCarts(userId);
      lastFetchTimeRef.current = Date.now(); // Update last fetch time
      
      // Only update state if the data has actually changed
      // This helps prevent unnecessary re-renders
      if (JSON.stringify(response) !== JSON.stringify(carts)) {
        setCarts(response);
      }
      
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

  const isCartSelected = (cartId: string) => {
    return selectedCartIds.has(cartId);
  };

  const getSelectedCarts = () => {
    return carts.filter(cart => selectedCartIds.has(cart.id));
  };

  const handleInspectCart = (cartId: string) => {
    const cart = carts.find(c => c.id === cartId);
    if (cart) {
      setCurrentCart(cart);
      return cart;
    }
    return null;
  };

  const deleteCartById = async (cartId: string) => {
    if (!userId) return false;
    
    try {
      await deleteCart(cartId, userId);
      // Update local state to remove deleted cart
      setCarts(prevCarts => prevCarts.filter(c => c.id !== cartId));
      return true;
    } catch (error) {
      console.error('Error deleting cart:', error);
      return false;
    }
  };

  const deleteCartItem = async (cartId: string, productId: string) => {
    if (!userId) return null;
    
    try {
      const updatedCart = await removeProductFromCart(cartId, productId, userId);
      
      // Update the carts state
      setCarts(prevCarts => 
        prevCarts.map(cart => 
          cart.id === updatedCart.id ? updatedCart : cart
        )
      );
      
      // Update current cart if it's being viewed
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