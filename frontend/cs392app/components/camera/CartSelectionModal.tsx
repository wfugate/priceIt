// components/camera/CartSelectionModal.tsx
import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Modal, StyleSheet, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface Cart {
  id: string;
  name: string;
}

interface CartSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCart: (cartId: string) => void;
  onCreateNewCart: (name: string) => void;
  userCarts: Cart[];
}

export const CartSelectionModal: React.FC<CartSelectionModalProps> = ({
  visible,
  onClose,
  onSelectCart,
  onCreateNewCart,
  userCarts,
}) => {
  const [newCartName, setNewCartName] = useState('');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <FontAwesome name="arrow-left" size={16} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Select a Cart</Text>
            <View style={styles.spacer} />
          </View>
          
          {/* Existing carts */}
          {userCarts.length > 0 ? (
            <ScrollView style={styles.cartsContainer}>
              {userCarts.map(cart => (
                <TouchableOpacity
                  key={cart.id}
                  style={styles.cartButton}
                  onPress={() => onSelectCart(cart.id)}
                >
                  <FontAwesome name="shopping-cart" size={16} color="#666" style={styles.cartIcon} />
                  <Text style={styles.cartName}>{cart.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noCarts}>You don't have any carts yet.</Text>
          )}
          
          {/* Create new cart button */}
          <TouchableOpacity
            style={styles.createNewCartButton}
            onPress={() => {
              onClose(); // Close the current modal
              onCreateNewCart(''); // Open the cart name input modal
            }}
          >
            <FontAwesome name="plus" size={16} color="#fff" style={styles.cartIcon} />
            <Text style={styles.createNewCartText}>Create New Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20, // Add extra space at the top
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: '#4A1D96', // Deep purple for text
  },
  backButton: {
    padding: 8,
  },
  spacer: {
    width: 24, // Same width as the back button for alignment
  },
  cartsContainer: {
    maxHeight: 200,
  },
  cartButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9D8FD', // Light purple border
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIcon: {
    marginRight: 10,
    color: '#4A1D96', // Deep purple for icon
  },
  cartName: {
    fontSize: 16,
    color: '#4A1D96', // Deep purple for text
  },
  noCarts: {
    textAlign: 'center',
    color: '#6B46C1', // Lighter purple
    fontStyle: 'italic',
    marginVertical: 15,
  },
  createNewCartButton: {
    backgroundColor: '#F59E0B', // Yellow/orange button
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  createNewCartText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9D8FD', // Light purple border
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#4A1D96', // Deep purple for text
  },
});