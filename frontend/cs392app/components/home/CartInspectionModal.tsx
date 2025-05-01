import React, { useState } from 'react';
import { 
  StyleSheet, 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Cart, CartProduct } from '../../app/types';
import { useCartManagement } from '../../app/hooks/useCartManagement';

// interface for cart inspection modal props
interface CartInspectionModalProps {
  visible: boolean;
  cart: Cart | null;
  onClose: () => void;
  userId: string | undefined;
  onDeleteItem: (cartId: string, productId: string) => Promise<void>; // Add this prop
}

// modal for viewing and managing cart contents
const CartInspectionModal: React.FC<CartInspectionModalProps> = ({
  visible,
  cart,
  onClose,
  userId = '',
  onDeleteItem, 
}) => {
  // state for tracking loading states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingCart, setIsDeletingCart] = useState(false);
  // state for store redirect modal
  const [isStoreModalVisible, setIsStoreModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CartProduct | null>(null);

  // use cart management hook for delete operations
  const { deleteCartById, deleteCartItem } = useCartManagement(userId);

  // guard clause if no cart provided
  if (!cart) return null;

  // calculate total cart price
  const totalPrice = cart.products.reduce((sum, product) => {
    const price = typeof product.price === 'number' ? product.price : 
                  (typeof product.price === 'string' ? parseFloat(product.price) : 0);
    return sum + price;
  }, 0);

  // handle deleting a product from the cart
  const handleDeleteItem = async (productId: string) => {
    if (!cart || !userId) return;
    
    try {
      // Call the parent component's deletion handler
      await onDeleteItem(cart.id, productId);
      // No need to close modal, just let the parent update the state
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  // handle deleting the entire cart
  const handleDeleteCart = () => {
    Alert.alert(
      'Delete Cart',
      'Are you sure you want to delete this entire cart? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Cart', 
          style: 'destructive',
          onPress: async () => {
            setIsDeletingCart(true);
            try {
              // call cart management hook to delete cart
              const success = await deleteCartById(cart.id);
              if (success) {
                onClose(); // close modal after successful deletion
              }
            } catch (error) {
              console.error('Error deleting cart:', error);
              Alert.alert('Error', 'Failed to delete cart. Please try again.');
            } finally {
              setIsDeletingCart(false);
            }
          }
        }
      ]
    );
  };

  // handle long press on product to show store redirect option
  const handleLongPress = (product: CartProduct) => {
    setSelectedProduct(product);
    setIsStoreModalVisible(true);
  };

  // handle redirect to store website
  const handleRedirectToStore = () => {
    if (selectedProduct && selectedProduct.productUrl) {
      Linking.openURL(selectedProduct.productUrl);
      setIsStoreModalVisible(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{cart.name}</Text>
          <View style={styles.spacer} />
        </View>

        {/* Cart summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {cart.products.length} {cart.products.length === 1 ? 'item' : 'items'} · Total: ${totalPrice.toFixed(2)}
          </Text>
        </View>

        {/* Products list */}
        {isDeleting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e63b60" />
            <Text style={styles.loadingText}>Updating cart...</Text>
          </View>
        ) : (
          <ScrollView style={styles.productList}>
            {cart.products.length > 0 ? (
              cart.products.map((product, index) => {
                const productId = product.id || product.productId || `product-${index}`;
                return (
                  <TouchableOpacity
                    key={`${productId}-${index}`}
                    style={styles.productCard}
                    onLongPress={() => handleLongPress(product)} // long press to show store redirect option
                  >
                    <Image 
                      source={{ uri: product.thumbnail || 'https://via.placeholder.com/80' }}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.storeLabel}>{product.store || "Store"}</Text>
                      <Text style={styles.productBrand}>{product.brand || "Brand"}</Text>
                      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                      <Text style={styles.productPrice}>
                        ${typeof product.price === 'number' 
                          ? product.price.toFixed(2) 
                          : (typeof product.price === 'string' 
                              ? parseFloat(product.price).toFixed(2) 
                              : '0.00')}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteItem(productId)}
                    >
                      <FontAwesome name="times" size={20} color="#e63b60" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyCartMessage}>
                <Text style={styles.emptyCartText}>This cart is empty</Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Delete cart button */}
        <TouchableOpacity style={styles.deleteCartButton} onPress={handleDeleteCart} disabled={isDeletingCart}>
          {isDeletingCart ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.deleteCartButtonText}>DELETE CART</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Store redirect modal */}
      {isStoreModalVisible && selectedProduct && (
        <Modal visible={isStoreModalVisible} animationType="fade" transparent={true} onRequestClose={() => setIsStoreModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Visit Product Store</Text>
              <Text style={styles.modalDescription}>
                Would you like to visit the store for "{selectedProduct.name}"?
              </Text>
              <TouchableOpacity style={styles.modalButton} onPress={handleRedirectToStore}>
                <Text style={styles.modalButtonText}>Yes, Go to Store</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setIsStoreModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomColor: '#ddd',
    backgroundColor: '#4A1D96',
  },
  backButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: "white",
  },
  spacer: {
    width: 60,
  },
  summary: {
    padding: 16,
    backgroundColor: '#6B46C1',
    borderBottomColor: '#eee',
  },
  summaryText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  productList: {
    flex: 1,
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(224, 216, 245)',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 15,
    backgroundColor: '#f9f9f9',
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
  deleteButton: {
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartMessage: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartText: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: 16,
  },
  deleteCartButton: {
    backgroundColor: '#F59E0B',
    padding: 16,
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
  },
  deleteCartButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)' 
  },
  modalContent: { 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 10, 
    width: '80%' 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  modalDescription: { 
    fontSize: 16, 
    marginVertical: 10 
  },
  modalButton: { 
    backgroundColor: '#e63b60', 
    padding: 10, 
    borderRadius: 5, 
    alignItems: 'center' 
  },
  modalButtonText: { 
    color: 'white', 
    fontSize: 16 
  },
  modalCancelButton: { 
    padding: 10, 
    alignItems: 'center', 
    marginTop: 10 
  },
  modalCancelText: { 
    fontSize: 16, 
    color: 'gray' 
  },
});

export default CartInspectionModal;