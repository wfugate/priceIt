// components/camera/ProductResults.tsx
import React, { useState } from 'react';
import { useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Platform,
  TextInput,
  Linking
} from 'react-native';

import { CartSelectionModal } from './CartSelectionModal';
import { CartNameInputModal } from './CartNameInputModal';
import { Product } from '../../app/types';
import { getUserCarts } from '../../app/services/cartService';
import { useEnhancedProductSearch } from '../../app/hooks/useEnhancedProductSearch';
import { API_BASE_URL } from '../../app/config/apiConfig';

interface ProductResultsProps {
  products: Product[];
  onAddToCart: (selectedProducts: Product[], cartId: string) => Promise<void>;
  userId: string | undefined;
  onClose: () => void;
  searchQuery?: string;
}

export default function ProductResultsScreen({ 
  products = [], 
  onAddToCart,
  userId,
  onClose,
  searchQuery = ''
}: ProductResultsProps) {
  // Use the enhanced product search hook
  const {
    displayedProducts,
    isSearching,
    showResults,
    currentSort,
    currentFilter,
    showSuccessMessage,
    successMessage,
    relevanceKeywords,
    selectedProduct,
    showProductModal,
    
    setCurrentSort,
    setCurrentFilter,
    toggleProductSelection,
    getSelectedProducts,
    clearSelections,
    closeResults,
    showSuccess,
    getSortLabel,
    getFilterLabel,
    handleRelevanceKeywordsChange,
    viewProductDetails,
    closeProductModal
  } = useEnhancedProductSearch(products, searchQuery);

  // Local state for modals and loading
  const [userCarts, setUserCarts] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCartNameModal, setShowCartNameModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch user carts
  const fetchUserCarts = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const carts = await getUserCarts(userId);
      setUserCarts(carts);
    } catch (error) {
      console.error('Error fetching carts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCarts();
  }, []);

  const handleAddToCartPress = async () => {
    const selectedProducts = getSelectedProducts();
    
    if (selectedProducts.length === 0) {
      Alert.alert('No Products Selected', 'Please select at least one product to add to your cart.');
      return;
    }
    
    setIsLoading(true);
    try {
      if (!userId) {
        setIsLoading(false);
        return;
      }
  
      // Fetch the latest carts
      await fetchUserCarts();
      
      // Now decide which modal to show
      if (userCarts && userCarts.length > 0) {
        setShowCartModal(true);
      } else {
        setShowCartNameModal(true);
      }
    } catch (error) {
      console.error('Error checking user carts:', error);
      Alert.alert('Error', 'Failed to check your carts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCartSelection = async (cartId: string) => {
    setIsSaving(true);
    try {
      const selectedProducts = getSelectedProducts();
      await onAddToCart(selectedProducts, cartId);
      setShowCartModal(false);
      
      // Show success message
      const count = selectedProducts.length;
      showSuccess(`${count} ${count === 1 ? 'product' : 'products'} added to cart`);
      
      // Clear selections after adding to cart
      clearSelections();
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      Alert.alert('Error', 'Failed to add products to cart. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewCart = async (name: string) => {
    if (!name.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      if (!userId) {
        setIsSaving(false);
        return;
      }
      
      // Create new cart
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          userId,
          name
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create new cart');
      }

      const newCart = await response.json();
      
      // Add products to the new cart
      const selectedProducts = getSelectedProducts();
      await onAddToCart(selectedProducts, newCart.id);
      
      // Close modal and show success message
      setShowCartNameModal(false);
      
      const count = selectedProducts.length;
      showSuccess(`${count} ${count === 1 ? 'product' : 'products'} added to new cart: ${name}`);
      
      // Clear selections after adding to cart
      clearSelections();
      
    } catch (error) {
      console.error('Failed to create cart:', error);
      Alert.alert('Error', 'Failed to create new cart. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Close filter modal and apply the current filters
  const applyFilters = () => {
    setShowFilterModal(false);
  };

  if (products.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.title}>No products found</Text>
        <Text style={styles.noResultsText}>We couldn't find any products matching your scan.</Text>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>Back to Scanner</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose} activeOpacity={0.7}>
          <FontAwesome style={styles.backIcon} name="arrow-left" size={15} color="#333" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Compare Prices</Text>
        
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterInfo}>
        <Text style={styles.filterInfoText}>
          Showing: {getFilterLabel(currentFilter)} • {getSortLabel(currentSort)}
        </Text>
      </View>
      
      {/* Success Message Banner */}
      {showSuccessMessage && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}
      
      <ScrollView contentContainerStyle={styles.productsContainer}>
        {displayedProducts.map((product: Product) => (
          <TouchableOpacity
            key={product.id}
            style={[
              styles.productCard,
              product.selected && styles.selectedProduct
            ]}
            onPress={() => toggleProductSelection(product.id)}
            onLongPress={() => {
              setModalVisible(true);
              viewProductDetails(product);
            }}
          >
            <Image 
              source={{ uri: product.thumbnail }} 
              style={styles.productImage}
              resizeMode="contain"
            />
            <View style={styles.productInfo}>
              <Text style={styles.storeLabel}>{product.store}</Text>
              <Text style={styles.productBrand}>{product.brand}</Text>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={[styles.productPrice, product.price === 0 && { color: 'red' }]}>
                {product.price === 0 ? "Price Not Available, Visit The Store's Website" : `$${product.price.toFixed(2)}`}
              </Text>
              
              {/* Show relevance indicator if sort is by relevance */}
              {currentSort === 'relevance' && (product.relevanceScore || 0) > 0 && (
                <View style={styles.relevanceContainer}>
                  <Text style={styles.relevanceText}>
                    Relevance: {(product.relevanceScore || 0) > 3 ? 'High' : 'Medium'}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Show a message if no products match the current filter */}
        {displayedProducts.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No products match your current filter.
            </Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => setCurrentFilter('all')}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.addToCartButton,
          { backgroundColor: getSelectedProducts().length > 0 ? '#F59E0B' : '#ccc' }
        ]}
        onPress={handleAddToCartPress}
        disabled={isLoading || isSaving || getSelectedProducts().length === 0}
      >
        {isLoading || isSaving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>
            Add to Cart ({getSelectedProducts().length}) 
          </Text>
        )}
      </TouchableOpacity>
      
      {/* Go to store Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>

        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Would You Like To See The Product At Its Store?</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                if (selectedProduct?.url) {
                  Linking.openURL(selectedProduct.url);
                }
                setModalVisible(false);
              }}>
              <Text style={styles.modalButtonText}>Go To Store</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter and Sort Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.filterModalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.filterBackButton} 
                onPress={() => setShowFilterModal(false)}
                activeOpacity={0.7}>
                <FontAwesome style={styles.backIcon} name="arrow-left" size={15} color="#333" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
            </View>
            
            {/* Main content in ScrollView to ensure everything is accessible */}
            <ScrollView style={styles.filterScrollView}>
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Sort By</Text>
                {[
                  { value: 'relevance', label: 'Most Relevant' },
                  { value: 'price-asc', label: 'Price: Low to High' },
                  { value: 'price-desc', label: 'Price: High to Low' },
                  { value: 'name-asc', label: 'Name: A to Z' },
                  { value: 'name-desc', label: 'Name: Z to A' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      currentSort === option.value && styles.selectedOption
                    ]}
                    onPress={() => setCurrentSort(option.value as any)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      currentSort === option.value && styles.selectedOptionText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Relevance Keywords Input (only shown when relevance sort is selected) */}
              {currentSort === 'relevance' && (
                <View style={styles.keywordsSection}>
                  <Text style={styles.sectionTitle}>Relevance Keywords</Text>
                  <TextInput
                    style={styles.keywordsInput}
                    value={relevanceKeywords}
                    onChangeText={handleRelevanceKeywordsChange}
                    placeholder="Enter keywords for relevance sorting"
                    placeholderTextColor="#999"
                  />
                  <Text style={styles.keywordsHelp}>
                    Enter words to match against product names and brands
                  </Text>
                </View>
              )}

              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Filter By Store</Text>
                {[
                  { value: 'all', label: 'All Stores' },
                  { value: 'walmart', label: 'Walmart' },
                  { value: 'target', label: 'Target' },
                  { value: 'costco', label: 'Costco' },
                  { value: 'samsClub', label: "Sam's Club" }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      currentFilter === option.value && styles.selectedOption
                    ]}
                    onPress={() => setCurrentFilter(option.value as any)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      currentFilter === option.value && styles.selectedOptionText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Add padding at the bottom for better scroll experience */}
              <View style={styles.scrollPadding} />
            </ScrollView>
            
            {/* Apply button stays fixed at bottom */}
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Cart Selection Modal */}
      <CartSelectionModal
        visible={showCartModal}
        onClose={() => setShowCartModal(false)}
        onSelectCart={handleCartSelection}
        onCreateNewCart={(name) => {
          setShowCartModal(false);
          setShowCartNameModal(true);
        }}
        userCarts={userCarts}
      />

      {/* Cart Name Input Modal */}
      <CartNameInputModal
        visible={showCartNameModal}
        onClose={() => setShowCartNameModal(false)}
        onCreateCart={handleCreateNewCart}
        isLoading={isSaving}
      />
    </SafeAreaView>
  );
}

// Styles remain the same as the original component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A1D96',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 12,
    backgroundColor: '#F59E0B', 
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    flexDirection: 'row', 
    marginBottom: 10,
  },
  backIcon:{
    color: 'white',
    marginRight: 8, 
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  filterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterBackButton: {
    padding: 12,
    backgroundColor: '#F59E0B', 
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    position: 'absolute',
    flexDirection: 'row',
    left: 0,
    top: 0,
  },
  filterInfo: {
    backgroundColor: '#6B46C1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 15,
  },
  filterInfoText: {
    color: 'white',
    fontSize: 12,
  },
  successBanner: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
    alignItems: 'center',
  },
  successText: {
    color: 'white',
    fontWeight: 'bold',
  },
  productsContainer: {
    paddingBottom: 80,
  },
  productCard: {
    backgroundColor:'rgb(224, 216, 245)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedProduct: {
    borderWidth: 2,
    borderColor: '#e63b60',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  storeLabel: {
    fontSize: 12,
    color: '#ffffff',
    backgroundColor: '#151a7b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e63b60',
  },
  relevanceContainer: {
    marginTop: 5,
  },
  relevanceText: {
    fontSize: 12,
    color: '#151a7b',
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  resetButton: {
    backgroundColor: '#151a7b',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addToCartButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 35 : 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  filterModalContent: {
    width: '90%',
    backgroundColor: 'rgb(224, 216, 245)',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
    flex: 0,
    marginVertical: 40,
  },
  filterScrollView: {
    maxHeight: Platform.OS === 'ios' ? 450 : 400,
  },
  scrollPadding: {
    height: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color:'#4A1D96',
    top: 8,
    left: 10,
  },
  filterSection: {
    marginBottom: 20,
  },
  keywordsSection: {
    marginBottom: 20,
  },
  keywordsInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    marginBottom: 5,
    backgroundColor:'white'
  },
  keywordsHelp: {
    fontSize: 12,
    color: '#669',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4A1D96',
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#e63b60',
  },
  filterOptionText: {
    color: '#333',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#F59E0B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10, 
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'rgb(224, 216, 245)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: "bold",
  },
  modalCancel: {
    marginTop: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 50,
  },
  modalCancelText: {
    color: '#4A1D96',
  },
});