// components/home/CompareCartsModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { updateCart} from '../../app/services/scanService';
import { Cart } from '../../app/types';

// Update the prop interface to include the callback
interface CompareCartsModalProps {
  visible: boolean;
  cartA: Cart | undefined;
  cartB: Cart | undefined;
  onClose: () => void;
  onCartsUpdated?: (updatedCartA: Cart, updatedCartB: Cart) => void;
}

const { width } = Dimensions.get('window');

const CompareCartsModal: React.FC<CompareCartsModalProps> = ({
  visible,
  cartA,
  cartB,
  onClose,
  onCartsUpdated
}) => {
  // Log cart structures received from props to diagnose the issue
  //console.log("RAW CART A:", JSON.stringify(cartA, null, 2));
  //console.log("RAW CART B:", JSON.stringify(cartB, null, 2));
  
  // State for each cart
  const [leftCart, setLeftCart] = useState<Cart | undefined>(undefined);
  const [rightCart, setRightCart] = useState<Cart | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Deep clone utility function with additional product property fixes
  const deepCloneCart = (cart: Cart | undefined): Cart | undefined => {
    if (!cart) return undefined;
    
    // Create a complete clone with new arrays for products
    return {
      ...cart,
      products: cart.products ? cart.products.map(product => {
        // Examine each product for structure issues
        //console.log("EXAMINING PRODUCT:", JSON.stringify(product, null, 2));
        
        // Return a fixed product object with both id and productId for compatibility
        return {
          //id: product.id || product.productId || `product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          productId: product.productId || product.id || `product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          thumbnail: product.thumbnail || 'https://via.placeholder.com/80',
          price: typeof product.price === 'number' ? product.price : 0,
          name: product.name || 'Product',
          brand: product.brand || 'Brand',
          quantity: product.quantity || 1,
          store: product.store || product.Store,
          productUrl: product.productUrl
        };
      }) : []
    };
  };
  
  // Initialize carts when props change
  useEffect(() => {
    if (visible) {
      console.log("EFFECT RUNNING - Setting initial cart state");
      
      // Deep clone both carts to ensure isolation
      const clonedCartA = deepCloneCart(cartA);
      const clonedCartB = deepCloneCart(cartB);
      
      console.log("**************************************Original Cart B:*******************************************");
      console.log(JSON.stringify(cartB, null, 2))
      console.log("**************************************Clone Cart B:*******************************************");
      //console.log("CART A:", JSON.stringify(clonedCartA, null, 2));
      console.log("CART B:", JSON.stringify(clonedCartB, null, 2));
      
      // Set cart state with cloned objects
      setLeftCart(clonedCartA);
      setRightCart(clonedCartB);
      setHasChanges(false);
    }
  }, [cartA, cartB, visible]);

  // Check if we have valid carts to compare
  if (!visible || !leftCart || !rightCart) {
    console.log('CompareCartsModal render conditions not met:', { 
      visible, 
      leftCartExists: !!leftCart, 
      rightCartExists: !!rightCart 
    });
    return null;
  }
  
  // Handle moving an item from left to right cart
  const moveItemLeftToRight = (productId: string) => {
    console.log("MOVING LEFT TO RIGHT:", { productId });
    
    if (!leftCart || !rightCart) {
      console.log("MOVE FAILED: Carts undefined");
      return;
    }
    
    // Find the product in the left cart - try both id and productId
    let productIndex = leftCart.products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      productIndex = leftCart.products.findIndex(p => p.productId === productId);
    }
    
    if (productIndex === -1) {
      console.log("MOVE FAILED: Product not found with id", productId);
      console.log("Available product IDs:", leftCart.products.map(p => ({id: p.id, productId: p.productId})));
      return;
    }
    
    // Get a deep clone of the product
    const productToMove = {...leftCart.products[productIndex]};
    console.log("PRODUCT TO MOVE:", JSON.stringify(productToMove, null, 2));
    
    // Create completely new cart objects with new product arrays
    const updatedLeftProducts = leftCart.products.filter(p => 
      (p.id !== productId) && (p.productId !== productId)
    );
    const updatedRightProducts = [...rightCart.products, productToMove];
    
    const newLeftCart = {
      ...leftCart,
      products: updatedLeftProducts
    };
    
    const newRightCart = {
      ...rightCart,
      products: updatedRightProducts
    };
    
    // Set the new cart states with a slight delay to ensure React processes them correctly
    setTimeout(() => {
      setLeftCart(newLeftCart);
      setTimeout(() => {
        setRightCart(newRightCart);
        setHasChanges(true);
      }, 50);
    }, 50);
  };
  
  // Handle moving an item from right to left cart
  const moveItemRightToLeft = (productId: string) => {
    console.log("MOVING RIGHT TO LEFT:", { productId });
    
    if (!leftCart || !rightCart) {
      console.log("MOVE FAILED: Carts undefined");
      return;
    }
    
    // Find the product in the right cart - try both id and productId
    let productIndex = rightCart.products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      productIndex = rightCart.products.findIndex(p => p.productId === productId);
    }
    
    if (productIndex === -1) {
      console.log("MOVE FAILED: Product not found with id", productId);
      console.log("Available product IDs:", rightCart.products.map(p => ({id: p.id, productId: p.productId})));
      return;
    }
    
    // Get a deep clone of the product
    const productToMove = {...rightCart.products[productIndex]};
    console.log("PRODUCT TO MOVE:", JSON.stringify(productToMove, null, 2));
    
    // Create completely new cart objects with new product arrays
    const updatedRightProducts = rightCart.products.filter(p => 
      (p.id !== productId) && (p.productId !== productId)
    );
    const updatedLeftProducts = [...leftCart.products, productToMove];
    
    const newRightCart = {
      ...rightCart,
      products: updatedRightProducts
    };
    
    const newLeftCart = {
      ...leftCart,
      products: updatedLeftProducts
    };
    
    // Set the new cart states with a slight delay to ensure React processes them correctly
    setTimeout(() => {
      setRightCart(newRightCart);
      setTimeout(() => {
        setLeftCart(newLeftCart);
        setHasChanges(true);
      }, 50);
    }, 50);
  };

  // Save changes to both carts
  const saveChanges = async () => {
    if (!leftCart || !rightCart || !hasChanges) return;
    
    setSaving(true);
    try {
      // We need to send updates for both carts to the backend
      console.log("Saving done here...")
      const updates = [
        updateCart(leftCart.id, leftCart.userId, leftCart.products, leftCart.name),
        updateCart(rightCart.id, rightCart.userId, rightCart.products, rightCart.name)
      ];

      const [updatedLeftCart, updatedRightCart] = await Promise.all(updates);
      
      Alert.alert(
        'Success',
        'Changes to both carts have been saved.',
        [{ text: 'OK', onPress: () => {
          // Notify the parent component about the updates before closing
          if (onCartsUpdated) {
            onCartsUpdated(updatedLeftCart, updatedRightCart);
          }
          onClose();
        }}]
      );
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving cart changes:', error);
      Alert.alert(
        'Error',
        'Failed to save changes. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals
  const leftTotal = leftCart.products.reduce((sum, product) => sum + product.price, 0);
  const rightTotal = rightCart.products.reduce((sum, product) => sum + product.price, 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onClose}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>COMPARE CARTS</Text>
          <TouchableOpacity style={styles.deleteButton}>
            <FontAwesome name="trash" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Cart titles */}
        <View style={styles.cartTitlesContainer}>
          <View style={styles.cartTitleLeft}>
            <Text style={styles.cartTitleText}>{leftCart.name}</Text>
            <Text style={styles.cartItemCount}>({leftCart.products.length} items)</Text>
          </View>
          <View style={styles.cartTitleRight}>
            <Text style={styles.cartTitleText}>{rightCart.name}</Text>
            <Text style={styles.cartItemCount}>({rightCart.products.length} items)</Text>
          </View>
        </View>

        {/* Cart contents */}
        <View style={styles.cartsContainer}>
          {/* Left cart */}
          <ScrollView style={styles.cartColumn}>
            {leftCart.products.length > 0 ? (
              leftCart.products.map((product, index) => (
                <View key={`left-${product.id || product.productId}-${index}`} style={styles.productCard}>
                  <View style={[styles.storeLabel, styles.leftStoreLabel]}>
                    <Text style={styles.storeLabelText}>Target</Text>
                  </View>
                  
                  <Image 
                    source={{ uri: product.thumbnail || 'https://via.placeholder.com/80' }}
                    style={styles.productImage}
                    resizeMode="contain"
                  />
                  
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.productBrand}>
                      {product.brand}
                    </Text>
                    <Text style={styles.productPrice}>
                      ${product.price.toFixed(2)}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.moveButton}
                    onPress={() => moveItemLeftToRight(product.id || product.productId)}
                  >
                    <FontAwesome name="chevron-right" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyCartMessage}>
                <Text style={styles.emptyCartText}>No items in this cart</Text>
              </View>
            )}
          </ScrollView>

          {/* Right cart */}
          <ScrollView style={styles.cartColumn}>
            {rightCart.products.length > 0 ? (
              rightCart.products.map((product, index) => (
                <View key={`right-${product.id || product.productId}-${index}`} style={styles.productCard}>
                  <View style={[styles.storeLabel, styles.rightStoreLabel]}>
                    <Text style={styles.storeLabelText}>Walmart</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.moveButton, styles.leftMoveButton]}
                    onPress={() => moveItemRightToLeft(product.id || product.productId)}
                  >
                    <FontAwesome name="chevron-left" size={16} color="#666" />
                  </TouchableOpacity>
                  
                  <Image 
                    source={{ uri: product.thumbnail || 'https://via.placeholder.com/80' }}
                    style={styles.productImage}
                    resizeMode="contain"
                  />
                  
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.productBrand}>
                      {product.brand}
                    </Text>
                    <Text style={styles.productPrice}>
                      ${product.price.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCartMessage}>
                <Text style={styles.emptyCartText}>No items in this cart</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Save Changes Button */}
        {hasChanges && (
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={saveChanges}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Cart totals */}
        <View style={styles.totalContainer}>
          <View style={styles.totalLeft}>
            <Text style={styles.totalPrice}>${leftTotal.toFixed(2)}</Text>
            <Text style={styles.totalItems}>{leftCart.products.length} items</Text>
          </View>
          <View style={styles.totalRight}>
            <Text style={styles.totalPrice}>${rightTotal.toFixed(2)}</Text>
            <Text style={styles.totalItems}>{rightCart.products.length} items</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    backgroundColor: '#e63b60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 10,
  },
  cartTitlesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  cartTitleLeft: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 8,
  },
  cartTitleRight: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 8,
  },
  cartTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cartsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  cartColumn: {
    flex: 1,
    padding: 8,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 5,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  storeLabel: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderBottomRightRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  leftStoreLabel: {
    left: 0,
    borderTopLeftRadius: 8,
  },
  rightStoreLabel: {
    left: 0,
    borderTopLeftRadius: 8,
  },
  storeLabelText: {
    color: 'white',
    fontSize: 10,
  },
  productImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
  },
  productBrand: {
    fontSize: 12,
    color: '#666',
    marginVertical: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e63b60',
  },
  moveButton: {
    padding: 10,
  },
  leftMoveButton: {
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: '#e63b60',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#e63b60',
  },
  totalLeft: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)',
  },
  totalRight: {
    flex: 1,
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  totalItems: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  emptyCartMessage: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartText: {
    color: '#999',
    fontStyle: 'italic',
  }
});

export default CompareCartsModal;