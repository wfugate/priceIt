// components/camera/CartNameInputModal.tsx
import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator
} from 'react-native';

interface CartNameInputModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateCart: (name: string) => Promise<void>;
  isLoading: boolean;
}

export const CartNameInputModal: React.FC<CartNameInputModalProps> = ({
  visible,
  onClose,
  onCreateCart,
  isLoading
}) => {
  const [cartName, setCartName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!cartName.trim()) {
      setError('Please enter a cart name');
      return;
    }
    
    setError('');
    try {
      await onCreateCart(cartName);
      setCartName(''); // Reset the input
    } catch (error) {
      setError('Failed to create cart');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Create a New Cart</Text>
          
          <Text style={styles.subtitle}>
            You don't have any carts yet. Create your first cart!
          </Text>
          
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Enter cart name"
            value={cartName}
            onChangeText={setCartName}
            autoFocus={true}
          />
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.createButton]} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Cart</Text>
              )}
            </TouchableOpacity>
          </View>
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
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e63b60',
  },
  errorText: {
    color: '#e63b60',
    marginTop: 5,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  createButton: {
    backgroundColor: '#e63b60',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});