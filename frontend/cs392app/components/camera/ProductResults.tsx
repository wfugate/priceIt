// components/camera/ProductResults.tsx
import React, { useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons'

import { 
  Share,
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
import { getUserCarts, createNewUserCart } from '../../app/services/scanService';
import { Product } from '../../app/types'; // Import Product from types.ts

// Extended product interface with guaranteed relevanceScore
interface ProductWithRelevance extends Product {
  relevanceScore: number;
}

interface Cart {
  id: string;
  name: string;
}

interface ProductResultsProps {
  products: Product[];
  onAddToCart: (selectedProducts: Product[], cartId: string) => Promise<void>;
  userId: string | undefined;
  onClose: () => void;
  searchQuery?: string; // The original search query
}

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
type FilterOption = 'all' | 'walmart' | 'target' | 'costco' | 'samsClub';

export default function ProductResultsScreen({ 
  products = [], 
  onAddToCart,
  userId,
  onClose,
  searchQuery = ''
}: ProductResultsProps) {
  // Initialize products with relevance scores
  const [localProducts, setLocalProducts] = useState<ProductWithRelevance[]>(
    products.map(p => ({ 
      ...p, 
      selected: p.selected || false, 
      relevanceScore: p.relevanceScore || 0 
    }))
  );
  
  const [displayedProducts, setDisplayedProducts] = useState<ProductWithRelevance[]>(localProducts);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userCarts, setUserCarts] = useState<Cart[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCartNameModal, setShowCartNameModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortOption>('relevance');
  const [currentFilter, setCurrentFilter] = useState<FilterOption>('all');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [relevanceKeywords, setRelevanceKeywords] = useState<string>(searchQuery);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelevance | null>(null);


  useEffect(() => {
    // Load user carts when component mounts
    fetchUserCarts();
    
    // Calculate initial relevance scores based on the search query
    calculateRelevanceScores(searchQuery);
  }, []);

  useEffect(() => {
    // Apply sorting and filtering whenever they change
    applyFiltersAndSort();
  }, [localProducts, currentSort, currentFilter, relevanceKeywords]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

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

  const calculateRelevanceScores = (query: string) => {
    if (!query) return;

    const keywords = query.toLowerCase().split(/\s+/);
    
    // Update local products with relevance scores
    setLocalProducts(prev => 
      prev.map(product => {
        // Calculate relevance score based on how many keywords match the product name and brand
        let score = 0;
        const productText = (product.name + ' ' + product.brand).toLowerCase();
        
        keywords.forEach(keyword => {
          if (productText.includes(keyword)) {
            // More weight for exact matches
            if (productText.includes(` ${keyword} `)) {
              score += 3;
            } else {
              score += 1;
            }
          }
        });
        
        return { ...product, relevanceScore: score };
      })
    );
  };

  const toggleProductSelection = (productId: string) => {
    setLocalProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const handleAddToCartPress = async () => {
    const selectedProducts = localProducts.filter(p => p.selected);
    
    if (selectedProducts.length === 0) {
      Alert.alert('No Products Selected', 'Please select at least one product to add to your cart.');
      return;
    }
    
    // Follow the flowchart logic:
    // 1. Get user carts
    setIsLoading(true);
    try {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      const carts = await getUserCarts(userId);
      setUserCarts(carts);
      
      // 2. Check if user has carts
      if (carts && carts.length > 0) {
        // User has carts - show cart selection modal
        setShowCartModal(true);
      } else {
        // User has no carts - show cart name input modal
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
      const selectedProducts = localProducts.filter(p => p.selected);
      await onAddToCart(selectedProducts, cartId);
      setShowCartModal(false);
      
      // Instead of closing the page with an alert, show a success message
      const count = selectedProducts.length;
      setSuccessMessage(`${count} ${count === 1 ? 'product' : 'products'} added to cart`);
      setShowSuccessMessage(true);
      
      // Clear selections after adding to cart
      setLocalProducts(prev => prev.map(p => ({ ...p, selected: false })));
      
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
      const newCart = await createNewUserCart(userId, name);
      
      // Add products to the new cart
      const selectedProducts = localProducts.filter(p => p.selected);
      await onAddToCart(selectedProducts, newCart.id);
      
      // Close modal and show success message
      setShowCartNameModal(false);
      
      // Instead of closing the page with an alert, show a success message
      const count = selectedProducts.length;
      setSuccessMessage(`${count} ${count === 1 ? 'product' : 'products'} added to new cart: ${name}`);
      setShowSuccessMessage(true);
      
      // Clear selections after adding to cart
      setLocalProducts(prev => prev.map(p => ({ ...p, selected: false })));
      
    } catch (error) {
      console.error('Failed to create cart:', error);
      Alert.alert('Error', 'Failed to create new cart. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRelevanceKeywordsChange = (text: string) => {
    setRelevanceKeywords(text);
    calculateRelevanceScores(text);
  };

  const applyFiltersAndSort = () => {
    // First filter by store
    let filtered = [...localProducts];
    if (currentFilter !== 'all') {
      filtered = filtered.filter(p => {
        if (currentFilter === 'walmart') return p.store === 'Walmart';
        if (currentFilter === 'target') return p.store === 'Target';
        if (currentFilter === 'costco') return p.store === 'Costco';
        if (currentFilter === 'samsClub') return p.store === "Sam's Club";
        return true;
      });
    }

    // Then sort
    let sorted = [...filtered];
    if (currentSort === 'relevance') {
      sorted.sort((a, b) => {
        // First sort by relevance score (descending)
        const scoreCompare = b.relevanceScore - a.relevanceScore;
        // If scores are equal, sort by price (ascending) as a tiebreaker
        return scoreCompare !== 0 ? scoreCompare : a.price - b.price;
      });
    } else if (currentSort === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'name-desc') {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    }

    setDisplayedProducts(sorted);
  };

  const getSortLabel = (sort: SortOption): string => {
    switch (sort) {
      case 'relevance': return 'Most Relevant';
      case 'price-asc': return 'Price: Low to High';
      case 'price-desc': return 'Price: High to Low';
      case 'name-asc': return 'Name: A to Z';
      case 'name-desc': return 'Name: Z to A';
      default: return 'Sort';
    }
  };

  const getFilterLabel = (filter: FilterOption): string => {
    switch (filter) {
      case 'all': return 'All Stores';
      case 'walmart': return 'Walmart';
      case 'target': return 'Target';
      case 'costco': return 'Costco';
      case 'samsClub': return "Sam's Club";
      default: return 'Filter';
    }
  };

  // Close filter modal and apply the current filters
  const applyFilters = () => {
    setShowFilterModal(false);
  };

  if (products.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.title}>No products found</Text>
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
          <Text style={styles.successText}> {successMessage}</Text>
        </View>
      )}
      
      <ScrollView contentContainerStyle={styles.productsContainer}>
        {displayedProducts.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={[
              styles.productCard,
              product.selected && styles.selectedProduct
            ]}
            onPress={() => toggleProductSelection(product.id)}
            onLongPress={() => {
              setSelectedProduct(product);
              setModalVisible(true);
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
              {currentSort === 'relevance' && product.relevanceScore > 0 && (
                <View style={styles.relevanceContainer}>
                  <Text style={styles.relevanceText}>
                    Relevance: {product.relevanceScore > 3 ? 'High' : 'Medium'}
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
          { backgroundColor: localProducts.some(p => p.selected) ? '#F59E0B' : '#ccc' }
        ]}
        onPress={handleAddToCartPress}
        disabled={isLoading || isSaving || !localProducts.some(p => p.selected)}
      >
        {isLoading || isSaving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>
            Add to Cart ({localProducts.filter(p => p.selected).length}) 
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

            <Text style={styles.modalTitle}> Would You Like To See The Product At Its Store ?</ Text>

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
                    onPress={() => setCurrentSort(option.value as SortOption)}
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
                    onPress={() => setCurrentFilter(option.value as FilterOption)}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A1D96', //rgb(167, 143, 223)
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
    backgroundColor: '#4CAF50', // Green color for success
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
    backgroundColor:'rgb(224, 216, 245)', //#4A1D96
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
    color: '#4A1D96',
    marginBottom: 10,
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
    // Add flex to make the inner content more manageable
    flex: 0,
    // Position the modal to leave space at top and bottom
    marginVertical: 40,
  },
  filterScrollView: {
    maxHeight: Platform.OS === 'ios' ? 450 : 400, // Limit height for scrolling
  },
  scrollPadding: {
    height: 20, // Add padding at the bottom of scroll content
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