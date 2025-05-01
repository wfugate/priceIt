// app/(tabs)/index.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Platform, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Alert, ActivityIndicator, Share } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Hook to run effects when the screen comes into focus

// Import themed components
import { Text, View } from '@/components/Themed';
// Import icons
import { FontAwesome } from '@expo/vector-icons';
// Import types
import { Cart } from '../types';
// Import custom modal components
import CartInspectionModal from '../../components/home/CartInspectionModal';
import CompareCartsModal from '../../components/home/CompareCartsModal';
// Import custom card component
import CartItemCard from '../../components/home/CartItemCard';
// Import routing utility
import { router } from 'expo-router';
// Import authentication context hook
import { useAuth } from '../context/AuthContext';
// Import API base URL configuration
import { API_BASE_URL } from '../config/apiConfig';
// Import profile context hook
import { useProfile } from '../context/ProfileContxt';
// Import custom hook for cart management logic
import { useCartManagement } from '../hooks/useCartManagement';

/**
 * HomeScreen component displays user information, their saved carts,
 * and provides actions like comparing, sharing, emailing, and deleting carts.
 */
export default function HomeScreen() {
  // Authentication context for user data and logout function
  const { user, logout } = useAuth();
  // Profile context for profile picture management
  const { imageUri, imageLoading, profileImageKey, fetchProfilePic, handleImagePick } = useProfile();

  // Extract user ID from the authenticated user object
  const userId = user?.UserId;

  // State for managing the visibility of the compare carts modal
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  // State to hold the carts selected for comparison or sharing
  const [selectedCarts, setSelectedCarts] = useState<Cart[]>([]);
  // State to track if an email request is in progress
  const [emailingCart, setEmailingCart] = useState(false);
  // State for managing the visibility of the cart inspection modal
  const [inspectModalVisible, setInspectModalVisible] = useState(false);
  // State for pull-to-refresh functionality (manual implementation, might overlap with useCartManagement's isRefreshing)
  const [refreshing, setRefreshing] = useState(false);

  // Use the custom hook for cart management logic
  const {
    carts,               // Array of user's carts
    isRefreshing: cartManagementRefreshing, // Renamed to avoid conflict with local 'refreshing' state
    currentCart,         // The cart currently being inspected
    fetchUserCarts,      // Function to fetch carts
    toggleCartSelection, // Function to toggle selection state of a cart
    isCartSelected,      // Function to check if a cart is selected
    getSelectedCarts,    // Function to get all selected carts
    handleInspectCart,   // Function to set the cart to be inspected
    deleteCartById,      // Function to delete a cart by ID
    deleteCartItem       // Function to delete an item from a cart
  } = useCartManagement(userId); // Pass userId to the hook

  // Ref to store object URLs created for profile images on web, used for cleanup
  const objectUrlRef = useRef<string | null>(null);

  /**
   * Initial effect hook to fetch user carts and profile picture when the component mounts
   * or when the userId changes. Includes cleanup for web object URLs.
   */
  useEffect(() => {
    if (userId) {
      fetchUserCarts(); // Fetch carts using the hook's method
      fetchProfilePic(); // Fetch profile picture using the context method
    }

    // Cleanup function for web platform
    return () => {
      if (Platform.OS === 'web' && objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current); // Revoke the object URL to prevent memory leaks
        objectUrlRef.current = null;
      }
    };
  }, [userId]); // Dependencies: userId

  /**
   * Effect hook using useFocusEffect to refetch carts whenever the screen comes into focus.
   * Ensures the cart list is up-to-date when navigating back to the screen.
   */
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchUserCarts(false); // Refetch carts without showing the loading indicator
      }
      return () => {}; // Optional cleanup function
    }, [userId, fetchUserCarts]) // Dependencies: userId and fetchUserCarts function from the hook
  );

  /**
   * Callback function for the pull-to-refresh action on the FlatList.
   * Sets the refreshing state and calls fetchUserCarts.
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true); // Indicate that refresh has started
    await fetchUserCarts(false); // Fetch carts using the hook's method, don't show initial loading
    setRefreshing(false); // Indicate that refresh has finished
  }, [fetchUserCarts]); // Dependency: fetchUserCarts function from the hook

  /**
   * Handles toggling the selection state of a cart using the cart management hook.
   * @param cartId The ID of the cart to toggle.
   */
  const handleToggleCartSelection = (cartId: string) => {
    toggleCartSelection(cartId); // Use the hook's method
  };

  /**
   * Handles the press of the "Inspect" button on a cart item.
   * Sets the current cart in the hook and opens the inspection modal.
   * @param cartId The ID of the cart to inspect.
   */
  const handleInspectCartUI = (cartId: string) => {
    const cart = handleInspectCart(cartId); // Use the hook's method to get/set the cart to inspect
    if (cart) {
      setInspectModalVisible(true); // Open the inspection modal if a cart is found
    }
  };

  /**
   * Callback function passed to the CompareCartsModal.
   * Refreshes the entire cart list when carts are updated within the modal.
   */
  const handleCartsUpdated = useCallback(async () => {
    console.log('Received updated carts from modal, refreshing list...');
    await fetchUserCarts(false); // Refresh the cart list using the hook's method
  }, [fetchUserCarts]); // Dependency: fetchUserCarts function from the hook

  /**
   * Generates a string summary of the selected carts for sharing.
   * @returns A formatted string containing details of selected carts.
   */
  const generateCartSummary = (): string => {
    const selectedCartsToShare = getSelectedCarts(); // Get currently selected carts
    if (!selectedCartsToShare || selectedCartsToShare.length === 0) return 'No carts selected.';

    // Map through selected carts to create a detailed summary string
    return selectedCartsToShare.map(cart => {
      const totalPrice = cart.products.reduce((sum, product) => sum + product.price, 0);
      const productList = cart.products.map(product =>
        `- ${product.name} ($${product.price.toFixed(2)})`
      ).join('\n');

      return `Cart: ${cart.name}\nTotal: $${totalPrice.toFixed(2)}\nItems: ${cart.products.length}\n\n${productList}`;
    }).join('\n\n----------\n\n'); // Join summaries of multiple carts
  };

  /**
   * Handles the press of the "Share" button.
   * Retrieves selected carts and triggers the native Share API.
   */
  const handleSharePress = () => {
    const selected = getSelectedCarts(); // Use the hook's method to get selected carts

    // Validate selection
    if (selected.length === 0) {
      Alert.alert('Selection Error', 'Please select at least one cart to share.');
      return;
    }

    shareToSocial(); // Trigger the native share action
  };


  /**
   * Uses the React Native Share API to share the generated cart summary.
   */
  const shareToSocial = async () => {
    const summary = generateCartSummary(); // Generate the text content for sharing
    try {
      // Use the Share API
      await Share.share({
        message: `My Shopping Cart Summary:\n\n${summary}`, // The content to share
        title: 'My Shopping Carts' // Title (mainly for Android)
      });
    } catch (error) {
      console.error('Error sharing cart summary:', error);
      Alert.alert('Sharing Failed', 'Could not share the cart summary.'); // Inform user of failure
    }
  };

  /**
   * Handles the press of the "Compare Carts" button.
   * Validates that exactly two carts are selected and opens the compare modal.
   */
  const handleComparePress = () => {
    const selected = getSelectedCarts(); // Use the hook's method

    // Validate selection count
    if (selected.length !== 2) {
      Alert.alert('Selection Error', 'Please select exactly 2 carts to compare.');
      return;
    }

    setSelectedCarts(selected); // Set state for the modal
    setCompareModalVisible(true); // Open the compare modal
  };

  /**
   * Handles the press of the "Email Me My Cart(s)" button.
   * Retrieves selected carts and sends a request to the backend API to email them.
   */
  const handleEmailPress = async () => {
    const selected = getSelectedCarts(); // Use the hook's method

    // Validate selection
    if (selected.length === 0) {
      Alert.alert('Selection Error', 'Please select at least one cart to email.');
      return;
    }

    const cartIds = selected.map(cart => cart.id); // Extract IDs of selected carts

    setEmailingCart(true); // Set loading state for the email button
    try {
      // Send request to the backend email endpoint
      const response = await fetch(`${API_BASE_URL}/api/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toEmail: `${user?.email}`, // Send to the logged-in user's email
          userId,
          cartIds, // Send the IDs of the selected carts
        }),
      });
      const data = await response.json();

      // Handle API errors
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email.');
      }

      // Show success message
      Alert.alert(
        'Cart emailed',
        `A pdf of your selected cart(s) has been sent to your email: ${user?.email}`,
        [{ text: 'Okay' }]
      );

    } catch (error) {
      console.error('Error emailing cart:', error);
      Alert.alert('Error', 'Failed to email cart. Please try again.'); // Show error message
    } finally {
      setEmailingCart(false); // Reset loading state for the email button
    }
  };

  /**
   * Handles deleting a specific cart using the cart management hook.
   * Closes the inspection modal upon successful deletion.
   * @param cartId The ID of the cart to delete.
   */
  const handleDeleteCart = async (cartId: string | undefined) => {
    if (!cartId) return; // Guard against undefined cartId

    const success = await deleteCartById(cartId); // Use the hook's method
    if (success) {
      setInspectModalVisible(false); // Close inspection modal if it was open for this cart
    }
  };

  /**
   * Renders a single cart item using the CartItemCard component.
   * @param item The cart object to render.
   * @returns A CartItemCard component.
   */
  const renderCartItem = ({ item }: { item: Cart }) => {
    return (
      <CartItemCard
        cart={item}
        isSelected={isCartSelected(item.id)} // Check if the cart is selected using the hook
        onSelect={() => handleToggleCartSelection(item.id)} // Pass toggle handler
        onDelete={() => handleDeleteCart(item.id)}        // Pass delete handler
        onInspect={() => handleInspectCartUI(item.id)}    // Pass inspect handler
      />
    );
  };

  // Main component render method
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Account Information</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* User Info Section */}
      <View style={styles.userInfoContainer}>
        {/* Profile Picture */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onLongPress={handleImagePick} // Allow changing profile picture on long press
          disabled={imageLoading} // Disable while image is loading/uploading
        >
          {imageLoading ? (
            <ActivityIndicator size="small" color="#e63b60" /> // Show loader
          ) : imageUri ? (
            <Image
              source={{ uri: imageUri }} // Display profile picture
              style={styles.avatarImage}
              key={`profile-image-${profileImageKey}`} // Force re-render when key changes (after upload)
            />
          ) : (
            <FontAwesome name="user" size={40} color="#333" /> // Default icon
          )}
        </TouchableOpacity>
        {/* User Details */}
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText} numberOfLines={1} ellipsizeMode="tail">Username: {user?.name ?? 'Loading...'} </Text>
          <Text style={styles.userInfoText} numberOfLines={1} ellipsizeMode="tail">Email: {user?.email ?? 'Loading...'}</Text>
        </View>

        {/* Button to navigate to detailed profile/info screen */}
        <View style={styles.avatarContainerTwo}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/info')}>
            <FontAwesome name="user" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Separator Line */}
      <View style={styles.separator} />

      {/* My Carts Section Header */}
      <View style={styles.cartsHeaderContainer}>
        <Text style={styles.sectionTitle}>My Carts</Text>
        {/* Show Compare button only if there are carts */}
        {carts.length > 0 && (
          <TouchableOpacity
            style={styles.compareButton}
            onPress={handleComparePress} // Trigger compare action
          >
            <Text style={styles.compareButtonText}>Compare carts</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Carts List or No Carts Message */}
      {carts.length > 0 ? (
        // Display FlatList if carts exist
        <>
          <FlatList
            data={carts} // Source data for the list
            renderItem={renderCartItem} // Function to render each item
            keyExtractor={item => item.id} // Unique key for each item
            contentContainerStyle={styles.cartsList} // Styling for the list container
            refreshControl={ // Pull-to-refresh configuration
              <RefreshControl
                refreshing={refreshing} // Controlled by the 'refreshing' state
                onRefresh={onRefresh} // Function to call when pulled
                colors={['#e63b60']} // Spinner color (Android)
                tintColor={'#e63b60'} // Spinner color (iOS)
              />
            }
          />
        </>
      ) : (
        // Display message and actions if no carts exist
        <View style={styles.noCartsContainer}>
          <Text style={styles.noCartsText}>You don't have any carts yet.</Text>
          <Text style={styles.noCartsSubText}>Go to the Scan tab to create your first cart!</Text>
          <View style={styles.noCartsButtonsContainer}>
            {/* Button to navigate to the Scan screen */}
            <TouchableOpacity
              style={styles.scanNowButton}
              onPress={() => router.push('/scan')}
            >
              <Text style={styles.scanNowButtonText}>Scan now</Text>
            </TouchableOpacity>

            {/* Manual Refresh button when no carts are displayed */}
            <TouchableOpacity
              style={[styles.refreshButtonSmall, cartManagementRefreshing && styles.disabledButton]} // Use refreshing state from hook
              onPress={() => fetchUserCarts()} // Fetch carts using the hook's method
              disabled={cartManagementRefreshing} // Disable while refreshing
            >
              {cartManagementRefreshing ? ( // Show loader based on hook's state
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

      {/* Action Buttons (Email, Share) - Shown only if carts exist */}
      {carts.length > 0 && (
        <View style={styles.actionButtonsContainer}>

          {/* Email Button */}
          <TouchableOpacity
            style={[styles.actionButton, (getSelectedCarts().length === 0 || emailingCart) && styles.disabledButton]} // Style changes when disabled
            onPress={handleEmailPress}
            disabled={getSelectedCarts().length === 0 || emailingCart} // Disable if no carts selected or email is being sent
          >
            {emailingCart ? (
              <ActivityIndicator size="small" color="white" /> // Show loader when emailing
            ) : (
              <Text style={[
                styles.actionButtonText,
                getSelectedCarts().length === 0 && styles.disabledButtonText // Style changes when disabled
              ]}>
                Email me my cart(s)!
              </Text>
            )}
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            style={[styles.actionButton, getSelectedCarts().length === 0 && styles.disabledButton]} // Style changes when disabled
            onPress={handleSharePress}
            disabled={getSelectedCarts().length === 0} // Disable if no carts selected
          >
            <Text style={[
              styles.actionButtonText,
              getSelectedCarts().length === 0 && styles.disabledButtonText // Style changes when disabled
            ]}>
              Share selected cart(s)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Compare Carts Modal - Conditionally rendered */}
      {/* Ensure modal only renders when visible and exactly 2 carts are selected for it */}
      {compareModalVisible && selectedCarts.length === 2 && (
        <CompareCartsModal
          visible={compareModalVisible}
          cartA={selectedCarts[0]} // Pass the first selected cart
          cartB={selectedCarts[1]} // Pass the second selected cart
          onClose={() => {
            console.log('Closing compare modal');
            setCompareModalVisible(false); // Close modal action
          }}
          onCartsUpdated={handleCartsUpdated} // Pass the update handler
        />
      )}


      {/* Cart Inspection Modal - Conditionally rendered */}
      <CartInspectionModal
        visible={inspectModalVisible}
        cart={currentCart} // Pass the cart currently being inspected (from the hook)
        onClose={() => setInspectModalVisible(false)} // Close modal action
        userId={userId} // Pass userId if needed inside the modal
        // Assuming delete happens outside or is triggered via a prop function if needed inside
      />
    </View>
  );
}


// StyleSheet for the HomeScreen component
const styles = StyleSheet.create({
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40, // Make it circular
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16, 
    backgroundColor: 'rgb(224, 216, 245)', 
  },
  centered: { 
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { // Text shown during loading states
    marginTop: 10,
    fontSize: 16,
    color: '#4A1D96',
  },
  title: { // Style for main screen title
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A1D96',
  },
  logoutButton: { // Style for the logout button
    backgroundColor: '#F59E0B', // Accent color
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: { // Text inside the logout button
    color: 'white',
    fontWeight: '600',
  },
  userInfoContainer: { // Container for user avatar and details
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#4A1D96', // Darker purple background for contrast
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9D8FD', // Lighter border
  },
  avatarContainerTwo: { // Container for the profile button (right side)
    width: 60, 
    height: 60, 
    alignItems: 'center', // Center content horizontally
    justifyContent: 'center', // Center content vertically
    marginRight: 16, // Spacing
    backgroundColor: '#4A1D96', // Match parent background
  },
  avatarContainer: { // Container for the profile picture/icon (left side)
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#4A1D96', // Border color matching theme
    borderRadius: 30, // Circular container
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#ffffff', // White background for the avatar itself
    overflow: 'hidden', // Ensure image stays within bounds
  },
  userInfo: { // Container for username and email text
    flex: 1, // Take remaining space
    backgroundColor: '#4A1D96', // Match parent background
  },
  header: { // Container for the screen title and logout button
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40, // Top margin (adjust for status bar height/safe area)
    marginBottom: 20,
    backgroundColor: 'rgb(224, 216, 245)', // Match screen background
  },
  userInfoText: { // Style for username and email text
    fontSize: 16,
    marginBottom: 4,
    color: 'white', // White text for contrast on dark background
  },
  separator: { // Visual separator line
    height: 1,
    backgroundColor: '#4A1D96',
    marginVertical: 20,
    opacity: 0.3, // Make it subtle
  },
  cartsHeaderContainer: { // Container for "My Carts" title and Compare button
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgb(224, 216, 245)', // Match screen background
  },
  sectionTitle: { // Style for "My Carts" title
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A1D96',
  },
  compareButton: { // Style for the "Compare Carts" button
    backgroundColor: '#F59E0B', // Accent color
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  compareButtonText: { // Text inside the compare button
    color: 'white',
    fontWeight: '600',
  },
  cartsList: { // Style for the FlatList content container
    paddingBottom: 160,
  },
  noCartsContainer: { // Container shown when the user has no carts
    flex: 1, // Take available space
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // Adjust padding
    backgroundColor: 'rgb(224, 216, 245)', // Match screen background
  },
  noCartsText: { // Main text for the "no carts" message
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4A1D96',
  },
  noCartsSubText: { // Sub-text encouraging user action
    fontSize: 16,
    color: '#6B46C1', // Slightly lighter purple
    marginBottom: 24,
    textAlign: 'center',
  },
  scanNowButton: { // Button to navigate to the scan screen
    backgroundColor: '#F59E0B', // Accent color
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  scanNowButtonText: { // Text inside the scan button
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonsContainer: { // Container for Email and Share buttons at the bottom
    position: 'absolute', // Position fixed at the bottom
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'transparent', // Transparent background
  },
  actionButton: { // Style for individual action buttons (Email, Share)
    backgroundColor: '#F59E0B', // Accent color
    padding: 14,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  actionButtonText: { // Text inside action buttons
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noCartsButtonsContainer: { // Container for buttons shown when no carts exist
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgb(224, 216, 245)', // Match screen background
  },
  refreshButtonSmall: { // Smaller refresh button used in the "no carts" view
    backgroundColor: '#F59E0B', // Accent color
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10, // Space between scan and refresh buttons
  },
  refreshIcon: { // Style for the refresh icon inside the button
    marginRight: 8,
  },
  refreshButtonTextSmall: { // Text inside the small refresh button
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  disabledButton: { // Style applied to buttons when disabled
    opacity: 0.7, // Make it look faded
  },
  disabledButtonText: { // Style applied to text inside disabled buttons
    opacity: 0.7, // Make text look faded (redundant if button opacity is set, but good practice)
  },
  profileButton: { // Style for the button navigating to the profile info screen
    alignSelf: 'flex-end', // Align to the right within its container
    // marginTop: 10, // Adjust spacing as needed
    // marginBottom: 10,
    // marginRight: 10, // Use container padding/margin instead if possible
    backgroundColor: '#F59E0B', // Accent color
    borderRadius: 25, // Circular button
    width: 40, // Fixed size
    height: 40, // Fixed size
    justifyContent: 'center', // Center icon inside
    alignItems: 'center', // Center icon inside
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});