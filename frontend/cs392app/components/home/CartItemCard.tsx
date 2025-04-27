// components/home/CartItemCard.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';

interface Product {
  productId: string;
  thumbnail: string;
  price: number;
  name: string;
  brand: string;
  quantity?: number;
}

interface Cart {
  id: string;
  name: string;
  userId: string;
  products: Product[];
  selected: boolean;
}

interface CartItemCardProps {
  cart: Cart;
  onSelect: () => void;
  onDelete: () => void;
  onInspect: () => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  cart,
  onSelect,
  onDelete,
  onInspect
}) => {
  // Calculate total price of all products in the cart
  const totalPrice = cart.products.reduce((sum, product) => sum + product.price, 0);
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={onSelect}
      >
        <View style={[
          styles.checkbox,
          cart.selected && styles.checkboxSelected
        ]}>
          {cart.selected && (
            <FontAwesome name="check" size={14} color="white" />
          )}
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.cartInfo}
        onPress={onInspect}
      >
        <Text style={styles.cartName} numberOfLines={1}>
          {cart.name}
        </Text>
        <Text style={styles.cartPrice}>
          Price: ${totalPrice.toFixed(2)}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}
      >
        <FontAwesome name="trash" size={18} color="#888" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: 'white',
  },
  checkboxContainer: {
    marginRight: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#e63b60',
    borderColor: '#e63b60',
  },
  cartInfo: {
    flex: 1,
  },
  cartName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  cartPrice: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 10,
  },
});

export default CartItemCard;