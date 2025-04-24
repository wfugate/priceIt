// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, Modal, Alert, ActivityIndicator, Share, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import { API_ENDPOINTS, COMMON_HEADERS } from '../config/apiConfig';
import { Cart, Product } from '../types';
import CompareCartsModal from '../../components/home/CompareCartsModal';
import CartItemCard from '../../components/home/CartItemCard';
import ShareModal from '../../components/home/ShareModal';
import { router } from 'expo-router';

import CartInspectionModal from '../../components/home/CartInspectionModal';
import { deleteCart, removeProductFromCart } from '../services/scanService';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


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

  const [deletingCartId, setDeletingCartId] = useState<string | null>(null);
  const [inspectModalVisible, setInspectModalVisible] = useState(false);
  const [currentCart, setCurrentCart] = useState<CartWithSelection | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserCarts(false); // false means don't show the separate loading indicator
    setRefreshing(false);
  }, []);
  
  // Fetch carts when component mounts
  useEffect(() => {
    fetchUserCarts();
  }, []);

  // Update the fetchUserCarts function to include a success callback
  const fetchUserCarts = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setIsRefreshing(true);
    }
    
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
      
      // Return success
      return true;
    } catch (error) {
      console.error('Error fetching carts:', error);
      Alert.alert('Error', 'Failed to load your carts. Please try again.');
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Then add this hook inside the HomeScreen component, after the useFetchUserCarts hook and before any other code
// This will automatically refresh the carts when the screen comes into focus
useFocusEffect(
  useCallback(() => {
    // Refresh carts when the screen comes into focus, without showing loading indicator
    fetchUserCarts(false);
    
    return () => {
      // Cleanup function (optional)
    };
  }, []) // Empty dependency array means this effect runs every time the screen comes into focus
);
  
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

  //Handle Inspect Cart --> modal populates screen with product information iin that cart
  const handleInspectCart = (cartId: string) => {
    const cart = carts.find(c => c.id === cartId);
    if (cart) {
      setCurrentCart(cart);
      setInspectModalVisible(true);
    }
  };
  
  
  // Update the compareCartsModal onCartsUpdated callback to refresh the cart list
  const handleCartsUpdated = async (updatedCartA: Cart, updatedCartB: Cart) => {
    console.log('Received updated carts from modal');
    
    // Refresh the entire cart list instead of manually updating
    await fetchUserCarts(false);
  };

  useEffect(() => {
    // This will run when the component mounts or when userId changes
    fetchUserCarts();}, [userId]);

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


  //Update the handleInspectCart function that's called when "Inspect selected cart" is pressed
  const handleInspectSelectedCart = () => {
    const selected = getSelectedCarts();
    
    if (selected.length !== 1) {
      Alert.alert('Selection Error', 'Please select exactly 1 cart to inspect.');
      return;
    }
    
    handleInspectCart(selected[0].id);
  };


  // Replace the existing renderCartItem function with this updated version
  const renderCartItem = ({ item }: { item: CartWithSelection }) => {
    return (
      <CartItemCard
        cart={item}
        onSelect={() => toggleCartSelection(item.id)}
        onDelete={() => handleDeleteCart()}
        onInspect={() => handleInspectCart(item.id)}
      />
    );
  };
  // Update the handleDeleteCart function to refresh the list after successful deletion
  const handleDeleteCart = async () => {
    //need something to be ab
    if (!currentCart) return;
    
    try {
      // Call the backend API to delete the cart
      await deleteCart(currentCart.id, userId);
      
      // Refresh the cart list instead of manually updating the state
      await fetchUserCarts(false);
      
      // Close the modal
      setInspectModalVisible(false);
      setCurrentCart(null);
      
      // Show a success message
      Alert.alert('Success', 'Cart deleted successfully');
    } catch (error) {
      console.error('Error deleting cart:', error);
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleDeleteItem = async (productId: string) => {
    if (!currentCart) return;
    
    try {
      // Call the backend API to remove the product
      const updatedCart = await removeProductFromCart(currentCart.id, productId, userId);
      
      // Update the current cart in the modal
      setCurrentCart({
        ...updatedCart,
        selected: currentCart.selected
      });
      
      // Update the cart in the carts list
      setCarts(prevCarts => 
        prevCarts.map(cart => 
          cart.id === updatedCart.id ? { ...updatedCart, selected: cart.selected } : cart
        )
      );
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error; // Re-throw to be handled by the modal
    }
  };

  // // Loading state
  // if (loading && carts.length === 0) {
  //   return (
  //     <View style={[styles.container, styles.centered]}>
  //       <ActivityIndicator size="large" color="#e63b60" />
  //       <Text style={styles.loadingText}>Loading your carts...</Text>
  //     </View>
  //   );
  // }

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
  <>
    <FlatList
      data={carts}
      renderItem={renderCartItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.cartsList}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#e63b60']}
          tintColor={'#e63b60'}
        />
      }
    />
    
    {/* Refresh button at bottom of list */}
    <View style={styles.refreshButtonContainer}>
      <TouchableOpacity 
        style={[styles.refreshButton, isRefreshing && styles.disabledButton]}
        onPress={() => fetchUserCarts()}
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <FontAwesome name="refresh" size={16} color="white" style={styles.refreshIcon} />
            <Text style={styles.refreshButtonText}>Refresh Carts</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  </>
) : (
  <View style={styles.noCartsContainer}>
    <Text style={styles.noCartsText}>You don't have any carts yet.</Text>
    <Text style={styles.noCartsSubText}>Go to the Scan tab to create your first cart!</Text>
    <View style={styles.noCartsButtonsContainer}>
      <TouchableOpacity 
        style={styles.scanNowButton}
        onPress={() => router.push('/scan')}
      >
        <Text style={styles.scanNowButtonText}>Scan now</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.refreshButtonSmall, isRefreshing && styles.disabledButton]}
        onPress={() => fetchUserCarts()}
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <FontAwesome name="refresh" size={16} color="white" style={styles.refreshIcon} />
            <Text style={styles.refreshButtonTextSmall}>Refresh</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  </View>
)}

      {/* Action buttons */}
      {carts.length > 0 && (
        <View style={styles.actionButtonsContainer}>
          
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

      {/* Cart Inspection Modal */}
      <CartInspectionModal
        visible={inspectModalVisible}
        cart={currentCart}
        onClose={() => setInspectModalVisible(false)}
        onDeleteItem={handleDeleteItem}
        onDeleteCart={handleDeleteCart}
      />
    </View>
  );
}


  

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     backgroundColor: '#fff',
//   },
//   centered: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#666',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 40,
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   logoutButton: {
//     backgroundColor: '#e63b60',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   logoutButtonText: {
//     color: 'white',
//     fontWeight: '600',
//   },
//   userInfoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   avatarContainer: {
//     width: 60,
//     height: 60,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   deletingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 10,
//     backgroundColor: 'rgba(0,0,0,0.05)',
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   deletingText: {
//     marginLeft: 10,
//     color: '#666',
//   },
//   userInfo: {
//     flex: 1,
//   },
//   userInfoText: {
//     fontSize: 16,
//     marginBottom: 4,
//   },
//   separator: {
//     height: 1,
//     backgroundColor: '#eee',
//     marginVertical: 20,
//   },
//   cartsHeaderContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   compareButton: {
//     backgroundColor: '#e63b60',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   compareButtonText: {
//     color: 'white',
//     fontWeight: '600',
//   },
//   cartsList: {
//     paddingBottom: 160, // Add padding for buttons at bottom
//   },
//   noCartsContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingBottom: 100,
//   },
//   noCartsText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: '#666',
//   },
//   noCartsSubText: {
//     fontSize: 16,
//     color: '#999',
//     marginBottom: 24,
//     textAlign: 'center',
//   },
//   scanNowButton: {
//     backgroundColor: '#e63b60',
//     paddingHorizontal: 32,
//     paddingVertical: 12,
//     borderRadius: 25,
//   },
//   scanNowButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   actionButtonsContainer: {
//     position: 'absolute',
//     bottom: 20,
//     left: 16,
//     right: 16,
//   },
//   actionButton: {
//     backgroundColor: '#e63b60',
//     padding: 14,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   actionButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   disabledButtonText: {
//     opacity: 0.7,
//   },
//   // Add these style definitions to the StyleSheet
//   refreshButtonContainer: {
//     paddingBottom: 20,
//     marginBottom: 60, // Add space for the action buttons at the bottom
//     alignItems: 'center',
//   },
//   refreshButton: {
//     backgroundColor: '#151a7b',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 25,
//   },
//   refreshButtonSmall: {
//     backgroundColor: '#151a7b',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginLeft: 10,
//   },
//   refreshIcon: {
//     marginRight: 8,
//   },
//   refreshButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   refreshButtonTextSmall: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 12,
//   },
//   noCartsButtonsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   disabledButton: {
//     opacity: 0.7,
//   },
// });

const styles = StyleSheet.create({
  disabledButtonText: {
        opacity: 0.7,
      },
      // Add these style definitions to the StyleSheet
      refreshButtonContainer: {
        paddingBottom: 20,
        marginBottom: 145, // Add space for the action buttons at the bottom
        alignItems: 'center',
      },
      refreshButton: {
        backgroundColor: '#151a7b',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
      },
      refreshButtonSmall: {
        backgroundColor: '#151a7b',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginLeft: 10,
      },
      refreshIcon: {
        marginRight: 8,
      },
      refreshButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
      },
      refreshButtonTextSmall: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
      },
      noCartsButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
      },
      disabledButton: {
        opacity: 0.7,
      },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#ffffff', // White background
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCartsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
      },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4A1D96', // Deep purple for text
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A1D96', // Deep purple for title
  },
  logoutButton: {
    backgroundColor: '#F59E0B', // Yellow/orange for button
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
  },
// Fix for the userInfoContainer in index.tsx
userInfoContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 20,
  backgroundColor: '#ffffff', // White background
  padding: 10,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#E9D8FD', // Light purple border
},
avatarContainerTwo: {
  width: 60,
  height: 60, 
  alignItems: 'center',
  marginRight: 16,
  backgroundColor: '#ffffff', // Explicitly set to white
},

// Fix for the avatarContainer to ensure white background
avatarContainer: {
  width: 60,
  height: 60,
  borderWidth: 1,
  borderColor: '#4A1D96', // Purple border
  borderRadius: 30, // Make it round
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 16,
  backgroundColor: '#ffffff', // Explicitly set to white
},

// Fix for the userInfo section
userInfo: {
  flex: 1,
  backgroundColor: '#ffffff', // Explicitly set to white
},

// Fix for the header to ensure white background
header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 40,
  marginBottom: 20,
  backgroundColor: '#ffffff', // Explicitly set to white
},
  userInfoText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#4A1D96', // Deep purple for text
  },
  separator: {
    height: 1,
    backgroundColor: '#4A1D96', // Deep purple separator
    marginVertical: 20,
    opacity: 0.3,
  },
  cartsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#ffffff', // White background
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A1D96', // Deep purple for section title
  },
  compareButton: {
    backgroundColor: '#F59E0B', // Yellow/orange for button
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
  noCartsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4A1D96', // Deep purple for text
  },
  noCartsSubText: {
    fontSize: 16,
    color: '#6B46C1', // Lighter purple
    marginBottom: 24,
    textAlign: 'center',
  },
  scanNowButton: {
    backgroundColor: '#F59E0B', // Yellow/orange for button
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
    backgroundColor: 'transparent', // Transparent background
  },
  actionButton: {
    backgroundColor: '#F59E0B', // Yellow/orange for button
    padding: 14,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    backgroundColor: '#F59E0B', // Yellow/orange for button
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  }
});