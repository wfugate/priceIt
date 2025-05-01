import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { Cart } from '../../app/types';

// interface for cart item card props
interface CartItemCardProps {
  cart: Cart;
  onSelect: () => void;
  onDelete: (cartId: string) => void;
  onInspect: () => void;
  isSelected: boolean;
}

// component to render a single cart item in the home screen list
const CartItemCard: React.FC<CartItemCardProps> = ({
  cart,
  onSelect,
  onDelete,
  onInspect,
  isSelected
}) => {
  // calculate total price of all products in the cart
  const totalPrice = cart.products.reduce((sum, product) => sum + product.price, 0);

  return (
    <View style={styles.container}>
      {/* checkbox for selecting cart for multi-cart operations */}
      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={onSelect}
      >
        <View style={[
          styles.checkbox,
          isSelected && styles.checkboxSelected
        ]}>
          {isSelected && (
            <FontAwesome name="check" size={14} color="white" />
          )}
        </View>
      </TouchableOpacity>
      
      {/* main cart info area (clickable to inspect cart) */}
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
      
      {/* delete button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(cart.id)}
      >
        <FontAwesome name="trash" size={18} color="#cad3e0" />
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
    backgroundColor: '#4A1D96',
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
    backgroundColor: 'white'
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
    color: 'white'
  },
  cartPrice: {
    fontSize: 14,
    color: 'white',
  },
  deleteButton: {
    padding: 10,
  },
});

export default CartItemCard;