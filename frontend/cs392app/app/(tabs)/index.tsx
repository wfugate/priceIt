// app/(tabs)/index.tsx
import React, { useState, useEffect, useRef, useCallback  } from 'react';
import { Image, Platform, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Alert, ActivityIndicator, Share } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { Cart } from '../types';
import CartInspectionModal from '../../components/home/CartInspectionModal';
import CompareCartsModal from '../../components/home/CompareCartsModal';
import CartItemCard from '../../components/home/CartItemCard';
import ShareModal from '../../components/home/ShareModal';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext'; 
import { API_BASE_URL } from '../config/apiConfig';
import { useProfile } from '../context/ProfileContxt';
import { useCartManagement } from '../hooks/useCartManagement';



export default function HomeScreen() {
  const { user, logout } = useAuth(); 
  const { imageUri, imageLoading, profileImageKey, fetchProfilePic, handleImagePick } = useProfile();

  const userId = user?.UserId;
  
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedCarts, setSelectedCarts] = useState<Cart[]>([]);
  const [emailingCart, setEmailingCart] = useState(false);
  const [inspectModalVisible, setInspectModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    carts,
    isRefreshing,
    currentCart,
    fetchUserCarts,
    toggleCartSelection,
    isCartSelected,
    getSelectedCarts,
    handleInspectCart,
    deleteCartById,
    deleteCartItem
  } = useCartManagement(userId);

  // For cleanup of object URLs on web
  const objectUrlRef = useRef<string | null>(null);
  
  useEffect(() => {
    fetchUserCarts(); // Now using the hook's method
    fetchProfilePic();
  
    return () => {
      if (Platform.OS === 'web' && objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [userId]);
  
  // Update your useFocusEffect
  useFocusEffect(
    useCallback(() => {
      fetchUserCarts(false); // Using the hook's method
      return () => {};
    }, [userId])
  );
  
  // Update your onRefresh callback
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserCarts(false); // Using the hook's method
    setRefreshing(false);
  }, []);
  
  const handleToggleCartSelection = (cartId: string) => {
    toggleCartSelection(cartId); // Using the hook's method
  };

  // Handle Inspect Cart
  const handleInspectCartUI = (cartId: string) => {
    const cart = handleInspectCart(cartId); // Using the hook's method
    if (cart) {
      setInspectModalVisible(true);
    }
  };
  
  // Update the compareCartsModal onCartsUpdated callback to refresh the cart list
  const handleCartsUpdated = async () => {
    console.log('Received updated carts from modal');
    
    // Refresh the entire cart list instead of manually updating
    await fetchUserCarts(false);
  };

  // Handle share cart button press
  const handleSharePress = () => {
    const selected = getSelectedCarts(); // Using the hook's method
  
    if (selected.length === 0) {
      Alert.alert('Selection Error', 'Please select at least one cart to share.');
      return;
    }
  
    setSelectedCarts(selected);
    shareToSocial('share');
  };

  const generateCartSummary = (): string => {
    if (!carts || carts.length === 0) return '';
    
    return carts.map(cart => {
      const totalPrice = cart.products.reduce((sum, product) => sum + product.price, 0);
      const productList = cart.products.map(product => 
        `- ${product.name} ($${product.price.toFixed(2)})`
      ).join('\n');
      
      return `Cart: ${cart.name}\nTotal: $${totalPrice.toFixed(2)}\nItems: ${cart.products.length}\n\n${productList}`;
    }).join('\n\n----------\n\n');
  };

  // Share to social platforms
  const shareToSocial = async (platform: string) => {
    const summary = generateCartSummary();
    try {
      await Share.share({
        message: `My Shopping Cart Summary:\n\n${summary}`,
        title: 'My Shopping Carts'
      });
      setShareModalVisible(false);
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
    }
  };

  const handleComparePress = () => {
    const selected = getSelectedCarts(); // Using the hook's method
    
    if (selected.length !== 2) {
      Alert.alert('Selection Error', 'Please select exactly 2 carts to compare.');
      return;
    }
    
    setSelectedCarts(selected);
    setCompareModalVisible(true);
  };

  const handleEmailPress = async () => {
    const selected = getSelectedCarts(); // Using the hook's method
    
    if (selected.length === 0) {
      Alert.alert('Selection Error', 'Please select at least one cart to email.');
      return;
    }
  
    const cartIds = selected.map(cart => cart.id);
    
    setEmailingCart(true);
    try {
      // Your existing email logic
      const response = await fetch(`${API_BASE_URL}/api/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toEmail: `${user?.email}`,
          userId,
          cartIds,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email.');
      }
      
      Alert.alert(
        'Cart emailed',
        `A pdf of your selected cart has been sent to your email: ${user?.email}`,
        [{ text: 'Okay' }]
      );

    } catch (error) {
      console.error('Error emailing cart:', error);
      Alert.alert('Failed to email cart. Please try again.');
    } finally {
      setEmailingCart(false);
    }
  };

  const handleDeleteCart = async (cartId: string | undefined) => {
    if (!cartId) return;
    
    const success = await deleteCartById(cartId); // Using the hook's method
    if (success) {
      setInspectModalVisible(false);
    }
  };

  const handleDeleteItem = async (productId: string) => {
    if (!currentCart) return;
    
    await deleteCartItem(currentCart.id, productId); // Using the hook's method
  };


  // Render cart item
  const renderCartItem = ({ item }: { item: Cart }) => {
    return (
      <CartItemCard
        cart={item}
        isSelected={isCartSelected(item.id)}
        onSelect={() => toggleCartSelection(item.id)}
        onDelete={() => handleDeleteCart(item.id)}
        onInspect={() => handleInspectCartUI(item.id)}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Account Information</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* User info */}
      <View style={styles.userInfoContainer}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onLongPress={handleImagePick}
          disabled={imageLoading}
        >
          {imageLoading ? (
            <ActivityIndicator size="small" color="#e63b60" />
          ) : imageUri ? (
            <Image 
              source={{ uri: imageUri }} 
              style={styles.avatarImage} 
              key={`profile-image-${profileImageKey}`} // Key to force re-render
            />
          ) : (
            <FontAwesome name="user" size={40} color="#333" />
          )}
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText} numberOfLines={1} ellipsizeMode="tail">Username: {user?.name ?? 'xxxxx'} </Text>
          <Text style={styles.userInfoText} numberOfLines={1} ellipsizeMode="tail">Email: {user?.email ?? 'xxxxx'}</Text>
        </View>
        
        <View style={styles.avatarContainerTwo}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/info')}>
            <FontAwesome name="user" size={20} color="white" />
          </TouchableOpacity>
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
  userId={userId}
/>
    </View>
  );
}


const styles = StyleSheet.create({
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'rgb(224, 216, 245) ', // White background
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#4A1D96', // White background
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
    backgroundColor: '4A1D96', 
  },

  avatarContainer: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#4A1D96', 
    borderRadius: 30, 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#ffffff', 
  },

  userInfo: {
    flex: 1,
    backgroundColor: '#4A1D96',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    backgroundColor: 'rgb(224, 216, 245) ',
  },
  userInfoText: {
    fontSize: 16,
    marginBottom: 4,
    color: 'white', 
  },
  separator: {
    height: 1,
    backgroundColor: '#4A1D96', 
    marginVertical: 20,
    opacity: 0.3,
  },
  cartsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgb(224, 216, 245) ', 
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A1D96', 
  },
  compareButton: {
    backgroundColor: '#F59E0B', 
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  compareButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cartsList: {
    paddingBottom: 160, 
  },
  noCartsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
    backgroundColor: 'rgb(224, 216, 245)', 
  },
  noCartsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4A1D96', 
  },
  noCartsSubText: {
    fontSize: 16,
    color: '#6B46C1', 
    marginBottom: 24,
    textAlign: 'center',
  },
  scanNowButton: {
    backgroundColor: '#F59E0B', 
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
    backgroundColor: 'transparent', 
  },
  actionButton: {
    backgroundColor: '#F59E0B', 
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
  refreshButtonContainer: {
    paddingBottom: 20,
    marginBottom: 145, 
    alignItems: 'center',
    backgroundColor: '#ffffff', 
  },
  
  refreshButton: {
    backgroundColor: '#F59E0B', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  
  noCartsButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgb(224, 216, 245)', 
  },
  refreshButtonSmall: {
    backgroundColor: '#F59E0B',
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
  disabledButton: {
    opacity: 0.7,
  },
  disabledButtonText: {
    opacity: 0.7,
  },
  profileButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    backgroundColor: '#F59E0B', 
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
  },
});