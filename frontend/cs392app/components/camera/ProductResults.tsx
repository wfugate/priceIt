// components/camera/ProductResults.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { CartSelectionModal } from './CartSelectionModal';
import { CartNameInputModal } from './CartNameInputModal';
import { getUserCarts, createNewUserCart } from '../../app/services/scanService';
import { FontAwesome } from '@expo/vector-icons';

interface Product {
  id: string;
  thumbnail: string;
  price: number;
  name: string;
  brand: string;
  selected?: boolean;
}

interface Cart {
  id: string;
  name: string;
}

interface ProductResultsProps {
  products: Product[];
  onAddToCart: (selectedProducts: Product[], cartId: string) => Promise<void>;
  userId: string;
  onClose: () => void;
}

export default function ProductResultsScreen({ 
  products = [], 
  onAddToCart,
  userId,
  onClose
}: ProductResultsProps) {
  const [localProducts, setLocalProducts] = useState<Product[]>(
    products.map(p => ({ ...p, selected: p.selected || false }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userCarts, setUserCarts] = useState<Cart[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCartNameModal, setShowCartNameModal] = useState(false);

  useEffect(() => {
    // Load user carts when component mounts
    fetchUserCarts();
  }, []);

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
      Alert.alert('Success', 'Products added to cart successfully!', [
        { text: 'OK', onPress: onClose }
      ]);
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
      // Create new cart
      const newCart = await createNewUserCart(userId, name);
      
      // Add products to the new cart
      const selectedProducts = localProducts.filter(p => p.selected);
      await onAddToCart(selectedProducts, newCart.id);
      
      // Close modals and show success message
      setShowCartNameModal(false);
      Alert.alert('Success', 'Products added to your new cart!', [
        { text: 'OK', onPress: onClose }
      ]);
    } catch (error) {
      console.error('Failed to create cart:', error);
      Alert.alert('Error', 'Failed to create new cart. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (products.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.title}>No products found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Back to Scanner</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back button at the top */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onClose}
      >
        <FontAwesome name="arrow-left" size={16} color="white" style={{marginRight: 8}} />
        <Text style={styles.buttonText}>Back to Scanner</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Select Products</Text>
      
      <ScrollView contentContainerStyle={styles.productsContainer}>
        {localProducts.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={[
              styles.productCard,
              product.selected && styles.selectedProduct
            ]}
            onPress={() => toggleProductSelection(product.id)}
          >
            <Image 
              source={{ uri: product.thumbnail }} 
              style={styles.productImage}
              resizeMode="contain"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productBrand}>{product.brand}</Text>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.addToCartButton,
          { backgroundColor: localProducts.some(p => p.selected) ? '#e63b60' : '#ccc' }
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#223bc9', // Using the same blue background as the main app
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  productsContainer: {
    paddingBottom: 80,
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  productInfo: {
    flex: 1,
  },
  productBrand: {
    fontSize: 14,
    color: '#bbdefb',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    marginBottom: 5,
    color: 'white',
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e63b60',
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 20,
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
  backButton: {
    backgroundColor: '#e63b60',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: 40, // Add padding from top of screen
  },
});