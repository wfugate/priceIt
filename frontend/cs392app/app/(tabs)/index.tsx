// app/(tabs)/index.tsx
import React, { useState, useEffect, useRef, useContext  } from 'react';
import { Image, Platform, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, ActivityIndicator, Share } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { Text, View } from '@/components/Themed';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import { API_ENDPOINTS, COMMON_HEADERS } from '../config/apiConfig';
import { Cart, Product } from '../types';
import CompareCartsModal from '../../components/home/CompareCartsModal';
import CartItemCard from '../../components/home/CartItemCard';
import ShareModal from '../../components/home/ShareModal';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext'; 
import { API_BASE_URL } from '../config/apiConfig';

// Extended Cart interface with selection state
interface CartWithSelection extends Cart {
  selected: boolean;
}


export default function HomeScreen() {
  const { user, logout } = useAuth(); 
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [profileImageKey, setProfileImageKey] = useState<number>(0); 
  const userId = user?.UserId;
  
  const [carts, setCarts] = useState<CartWithSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedCarts, setSelectedCarts] = useState<CartWithSelection[]>([]);
  const [emailingCart, setEmailingCart] = useState(false);

  const [imageLoading, setImageLoading] = useState(false);

  // For cleanup of object URLs on web
  const objectUrlRef = useRef<string | null>(null);

  // Fetch carts when component mounts
  useEffect(() => {
    fetchProfilePic();
    fetchUserCarts();

    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      if (Platform.OS === 'web' && objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [userId]);

  //Function to fetch user profile picture
  const fetchProfilePic = async () => {
    console.log("UserID:", userId)
    if (!userId) {
      console.log("No user ID available for fetching profile image");
      return;
    }
    setImageLoading(true);

    try {
      // Make sure to invalidate cache by adding timestamp
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE_URL}/api/images/profile-image/${userId}?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log("No profile image found for user");
          setImageUri(null);
          return;
        }
        throw new Error(`Server responded with ${response.status}: ${await response.text()}`);
      }

      const blob = await response.blob();
      
      if (Platform.OS === 'web') {

        // Cleanup previous URL if exists
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }
        
  
        //Create a new URL object from the blob for web
        const imageUrl = URL.createObjectURL(blob);
        objectUrlRef.current = imageUrl;
        console.log("Created web image URL:", imageUrl);
        
        // Set the image URI
        setImageUri(imageUrl);

        // Force re-render of the image by updating key
        setProfileImageKey(prevKey => prevKey + 1);
      } else {
        // For mobile: Use FileSystem to store image
        const fileReader = new FileReader();
        fileReader.onload = async () => {
          try {
            const result = fileReader.result;
            
            if (typeof result === 'string') {
              const base64data = result.split(',')[1];
              if (base64data) {
                const path = `${FileSystem.cacheDirectory}profile-${timestamp}.jpg`;
                await FileSystem.writeAsStringAsync(path, base64data, {
                  encoding: FileSystem.EncodingType.Base64,
                });
                
                console.log("Saved mobile image to:", path);
                setImageUri(path);
              }
            }
          } catch (error) {
            console.error("Error in FileReader processing:", error);
          }
        };
        
        fileReader.onerror = (error) => {
          console.error("FileReader error:", error);
        };
        
        fileReader.readAsDataURL(blob);
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
    } finally {
      setImageLoading(false);
    }

  };

  //Pick and upload new image
  const handleImagePick = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not available. Please log in again.');
      return;
    }

    try {
      // Request permissions first
      if (Platform.OS !== 'web') {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert('Permission denied', 'Permission to access gallery is required!');
          return;
        }
      }

      // Launch image picker
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        return;
      }

      const selectedAsset = pickerResult.assets[0];
      console.log("Selected image:", selectedAsset.uri);
      
      // Upload to backend
      const formData = new FormData();
      formData.append('userId', userId);
      
      // Handle the image differently for web and mobile
      if (Platform.OS === 'web') {
        try {
          // For web, we need to fetch the file first
          const response = await fetch(selectedAsset.uri);
          const blob = await response.blob();

          formData.append("image", blob, "profile.jpg");
          console.log("Web: Prepared image blob for upload");
        } catch (error) {
          console.error("Error preparing web image:", error);
          Alert.alert('Error', 'Failed to prepare image for upload.');
          return;
        }
      } else {
        // For mobile, use the asset directly
        formData.append('image', {
          uri: selectedAsset.uri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        } as any);
        console.log('📱 Mobile: Added image to FormData');
      }
      
      // Show loading indicator
      setImageLoading(true);


      try {
        // Upload the image
        console.log("Uploading image to:", `${API_BASE_URL}/api/images/upload`);

        const uploadResponse  = await fetch(`${API_BASE_URL}/api/images/upload`, {
          method: 'POST',
          body: formData,
          headers: Platform.OS === 'web' ? undefined : {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (!uploadResponse .ok) {
          const errorText = await uploadResponse .text();
          console.error('XXXXX Upload failed:', errorText);
          throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
        } 
        
        // After successful upload, fetch the updated profile image
        await fetchProfilePic();
        
        Alert.alert('Success', 'Profile image updated successfully!');
        
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert('Upload Failed', 'There was a problem uploading your image. Please try again.');
      }
    } catch (error) {
      console.error('Error in image picking process:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setImageLoading(false);
    }
  };

  // Function to fetch user carts
  const fetchUserCarts = async () => {
    console.log("FETCHING USER CARTS");
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
        <TouchableOpacity style={styles.logoutButton} 
          onPress={() => {logout()}}>

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
          <Text style={styles.userInfoText}>Username: {user?.name ?? 'xxxxx'} </Text>
          <Text style={styles.userInfoText}>Email: {user?.email ?? 'xxxxx'}</Text>
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
  noCartsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
    backgroundColor: '#ffffff', // White background
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
  disabledButtonText: {
    opacity: 0.7,
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