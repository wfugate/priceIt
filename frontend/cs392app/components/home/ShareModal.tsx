import React from 'react';
import { 
  StyleSheet, 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  Share
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// interface for product data
interface Product {
  productId: string;
  thumbnail: string;
  price: number;
  name: string;
  brand: string;
  quantity?: number;
}

// interface for cart data
interface Cart {
  id: string;
  name: string;
  userId: string;
  products: Product[];
  selected?: boolean;
}

// interface for share modal props
interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  carts: Cart[];
}

// modal for sharing cart information
const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  carts
}) => {
  // generate text summary of carts for sharing
  const generateCartSummary = (): string => {
    if (!carts || carts.length === 0) return '';
    
    return carts.map(cart => {
      // calculate total price for each cart
      const totalPrice = cart.products.reduce((sum, product) => sum + product.price, 0);
      // format product list with names and prices
      const productList = cart.products.map(product => 
        `- ${product.name} ($${product.price.toFixed(2)})`
      ).join('\n');
      
      return `Cart: ${cart.name}\nTotal: $${totalPrice.toFixed(2)}\nItems: ${cart.products.length}\n\n${productList}`;
    }).join('\n\n----------\n\n');
  };

  // share cart information using native share functionality
  const shareToSocial = async (platform: string) => {
    const summary = generateCartSummary();
    try {
      await Share.share({
        message: `My Shopping Cart Summary:\n\n${summary}`,
        title: 'My Shopping Carts'
      });
      onClose();
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={[styles.shareButton, styles.moreButton]} 
            onPress={() => shareToSocial('more')}
          >
            <FontAwesome name="ellipsis-h" size={20} color="white" style={styles.shareIcon} />
            <Text style={styles.shareText}>More</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b5998', // Facebook blue
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
  },
  twitterButton: {
    backgroundColor: '#1DA1F2', // Twitter blue
  },
  pinterestButton: {
    backgroundColor: '#E60023', // Pinterest red
  },
  moreButton: {
    backgroundColor: '#555', // Dark gray
  },
  shareIcon: {
    marginRight: 10,
  },
  shareText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginTop: 10,
  },
  cancelText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default ShareModal;