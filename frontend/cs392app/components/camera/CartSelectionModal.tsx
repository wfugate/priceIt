// components/camera/CartSelectionModal.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput } from 'react-native';

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
          <Text style={styles.title}>Select a Cart</Text>
          
          {/* Existing carts */}
          {userCarts.map(cart => (
            <TouchableOpacity
              key={cart.id}
              style={styles.cartButton}
              onPress={() => onSelectCart(cart.id)}
            >
              <Text>{cart.name}</Text>
            </TouchableOpacity>
          ))}
          
          {/* Create new cart */}
          <View style={styles.newCartContainer}>
            <TextInput
              style={styles.input}
              placeholder="New cart name"
              value={newCartName}
              onChangeText={setNewCartName}
            />
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => {
                onCreateNewCart(newCartName);
                setNewCartName('');
              }}
            >
              <Text>Create New Cart</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text>Cancel</Text>
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
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  cartButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  newCartContainer: {
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  createButton: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
});