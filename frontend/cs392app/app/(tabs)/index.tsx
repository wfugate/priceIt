// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, Modal, Alert, ActivityIndicator, Share } from 'react-native';
import { Text, View } from '@/components/Themed';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import { API_ENDPOINTS, COMMON_HEADERS } from '../config/apiConfig';
import { Cart, Product } from '../services/scanService';
import CompareCartsModal from '../../components/home/CompareCartsModal';
import CartItemCard from '../../components/home/CartItemCard';
import ShareModal from '../../components/home/ShareModal';
import { router } from 'expo-router';

// Extended Cart interface with selection state
interface CartWithSelection extends Cart {
  selected: boolean;
}

export default function HomeScreen() {
  // Mock userId - In a real app, this would come from authentication
  const userId = '123';
  
  const [carts, setCarts] = useState<CartWithSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedCarts, setSelectedCarts] = useState<CartWithSelection[]>([]);
  const [emailingCart, setEmailingCart] = useState(false);

  // Fetch carts when component mounts
  useEffect(() => {
    fetchUserCarts();
  }, []);

  // Function to fetch user carts
  const fetchUserCarts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.cart.getAll}?userId=${userId}`, {
        method: 'GET',
        headers: COMMON_HEADERS,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user carts');
      }

      const data = await response.json();
      
      // Add selected property to each cart
      const cartsWithSelection = data.map((cart: Cart) => ({
        ...cart,
        selected: false
      }));
      
      setCarts(cartsWithSelection);
    } catch (error) {
      console.error('Error fetching carts:', error);
      Alert.alert('Error', 'Failed to load your carts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection of a cart
  const toggleCartSelection = (cartId: string) => {
    setCarts(prevCarts => 
      prevCarts.map(cart => 
        cart.id === cartId ? { ...cart, selected: !cart.selected } : cart
      )
    );
  };

  // Get selected carts
  const getSelectedCarts = () => {
    return carts.filter(cart => cart.selected);
  };

  // Handle compare carts button press
  const handleComparePress = () => {
    const selected = getSelectedCarts();
    
    if (selected.length !== 2) {
      Alert.alert('Selection Error', 'Please select exactly 2 carts to compare.');
      return;
    }
    
    // Debug logs to verify what's happening
    console.log('Selected carts for comparison:', selected);
    
    // Set the selected carts first
    setSelectedCarts(selected);
    
    // Then show the modal with a slight delay to ensure state is updated
    setTimeout(() => {
      console.log('Opening compare modal');
      setCompareModalVisible(true);
    }, 100);
  };
  
  // Handle updates when carts are modified in the compare modal
  const handleCartsUpdated = (updatedCartA: Cart, updatedCartB: Cart) => {
    console.log('Received updated carts from modal');
    
    // Update the carts list with the updated carts
    setCarts(prevCarts => 
      prevCarts.map(cart => {
        if (cart.id === updatedCartA.id) {
          return {...updatedCartA, selected: cart.selected};
        }
        if (cart.id === updatedCartB.id) {
          return {...updatedCartB, selected: cart.selected};
        }
        return cart;
      })
    );
  };

  // Handle share cart button press
  const handleSharePress = () => {
    const selected = getSelectedCarts();
    
    if (selected.length === 0) {
      Alert.alert('Selection Error', 'Please select at least one cart to share.');
      return;
    }
    
    setSelectedCarts(selected);
    setShareModalVisible(true);
  };

  // Handle export cart button press (direct share)
  const handleExportPress = async () => {
    const selected = getSelectedCarts();
    
    if (selected.length === 0) {
      Alert.alert('Selection Error', 'Please select at least one cart to export.');
      return;
    }
    
    try {
      // Generate cart data for sharing
      const cartData = selected.map(cart => {
        const totalPrice = cart.products.reduce((sum, product) => sum + product.price, 0);
        return `${cart.name}: $${totalPrice.toFixed(2)} (${cart.products.length} items)`;
      }).join('\n\n');
      
      await Share.share({
        message: `My Shopping Carts:\n\n${cartData}`,
        title: 'My Shopping Carts'
      });
    } catch (error) {
      console.error('Error sharing carts:', error);
      Alert.alert('Error', 'Failed to share carts. Please try again.');
    }
  };

  // Handle email cart button press
  const handleEmailPress = async () => {
    const selected = getSelectedCarts();
    
    if (selected.length === 0) {
      Alert.alert('Selection Error', 'Please select at least one cart to email.');
      return;
    }
    
    setEmailingCart(true);
    try {
      // In a real app, you would call your backend to email the cart
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Cart emailed',
        'A pdf of your selected cart has been sent to your email: xxxxxx',
        [{ text: 'Okay' }]
      );
    } catch (error) {
      console.error('Error emailing cart:', error);
      Alert.alert('Error', 'Failed to email cart. Please try again.');
    } finally {
      setEmailingCart(false);
    }
  };

  // Handle delete cart press
  const handleDeleteCart = async (cartId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // In a real app, call API to delete the cart
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 800));
              
              // Update state to remove the cart
              setCarts(prevCarts => prevCarts.filter(cart => cart.id !== cartId));
            } catch (error) {
              console.error('Error deleting cart:', error);
              Alert.alert('Error', 'Failed to delete cart. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Handle inspect cart press
  const handleInspectCart = (cartId: string) => {
    // In a real app, navigate to cart detail screen
    // For now, just show an alert
    const cart = carts.find(c => c.id === cartId);
    if (cart) {
      Alert.alert(
        `${cart.name} Details`,
        `This cart contains ${cart.products.length} items with a total value of $${
          cart.products.reduce((sum, product) => sum + product.price, 0).toFixed(2)
        }`
      );
    }
  };

  // Render cart item
  const renderCartItem = ({ item }: { item: CartWithSelection }) => {
    // Calculate total price
    const totalPrice = item.products.reduce((sum, product) => sum + product.price, 0);
    
    return (
      <CartItemCard
        cart={item}
        onSelect={() => toggleCartSelection(item.id)}
        onDelete={() => handleDeleteCart(item.id)}
        onInspect={() => handleInspectCart(item.id)}
      />
    );
  };

  // Loading state
  if (loading && carts.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#e63b60" />
        <Text style={styles.loadingText}>Loading your carts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Account Information</Text>
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* User info */}
      <View style={styles.userInfoContainer}>
        <View style={styles.avatarContainer}>
          <FontAwesome name="user" size={24} color="#333" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>Username: xxxxx</Text>
          <Text style={styles.userInfoText}>Email: xxxxxxxxx</Text>
        </View>
      </View>

      <View style={styles.separator} />

      {/* My Carts section */}
      <View style={styles.cartsHeaderContainer}>
        <Text style={styles.sectionTitle}>My Carts</Text>
        {carts.length > 0 && (
          <TouchableOpacity 
            style={styles.compareButton}
            onPress={handleComparePress}
          >
            <Text style={styles.compareButtonText}>Compare carts</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Carts list */}
      {carts.length > 0 ? (
        <FlatList
          data={carts}
          renderItem={renderCartItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.cartsList}
        />
      ) : (
        <View style={styles.noCartsContainer}>
          <Text style={styles.noCartsText}>You don't have any carts yet.</Text>
          <Text style={styles.noCartsSubText}>Go to the Scan tab to create your first cart!</Text>
          <TouchableOpacity 
            style={styles.scanNowButton}
            onPress={() => router.push('/scan')}
          >
            <Text style={styles.scanNowButtonText}>Scan now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action buttons */}
      {carts.length > 0 && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleInspectCart(getSelectedCarts()[0]?.id)}
            disabled={getSelectedCarts().length !== 1}
          >
            <Text style={[
              styles.actionButtonText,
              getSelectedCarts().length !== 1 && styles.disabledButtonText
            ]}>
              Inspect selected cart
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleEmailPress}
            disabled={getSelectedCarts().length === 0 || emailingCart}
          >
            {emailingCart ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={[
                styles.actionButtonText,
                getSelectedCarts().length === 0 && styles.disabledButtonText
              ]}>
                Email me my cart(s)!
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleSharePress}
            disabled={getSelectedCarts().length === 0}
          >
            <Text style={[
              styles.actionButtonText,
              getSelectedCarts().length === 0 && styles.disabledButtonText
            ]}>
              Share selected cart(s)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Compare Carts Modal */}
      {compareModalVisible && selectedCarts.length >= 2 && (
        <CompareCartsModal
          visible={compareModalVisible}
          cartA={selectedCarts[0]}
          cartB={selectedCarts[1]}
          onClose={() => {
            console.log('Closing compare modal');
            setCompareModalVisible(false);
          }}
          onCartsUpdated={handleCartsUpdated}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        carts={selectedCarts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#e63b60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userInfoText: {
    fontSize: 16,
    marginBottom: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  cartsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  compareButton: {
    backgroundColor: '#e63b60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  compareButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cartsList: {
    paddingBottom: 160, // Add padding for buttons at bottom
  },
  noCartsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  noCartsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  noCartsSubText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
  },
  scanNowButton: {
    backgroundColor: '#e63b60',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  scanNowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  actionButton: {
    backgroundColor: '#e63b60',
    padding: 14,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButtonText: {
    opacity: 0.7,
  },
});