import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, Switch, StyleSheet, SafeAreaView } from 'react-native';
import { useCameraScan } from '../hooks/useCameraScan';
import CameraView from '../../components/camera/CameraView';
import CameraControls from '../../components/camera/CameraControls';
import ScanResults from '../../components/camera/ScanResults';
import ProductResultsScreen from '../../components/camera/ProductResults';
import { cameraStyles } from '../../components/styles/styles';
import { searchProducts, saveToCart } from '../services/scanService';
import { Product, Stores } from '../types'; // Import shared types

export default function ScanScreen() {
  const [showResults, setShowResults] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showStoreSettings, setShowStoreSettings] = useState(false);
  const [stores, setStores] = useState<Stores>({
    walmart: true,
    target: true,
    costco: true,
    samsClub: true
  });
  
  // Mock userId - In a real app, this would come from authentication
  const userId = '123';

  const {
    cameraRef,
    item,
    loading,
    permission,
    requestPermission,
    captureImage,
    toggleCameraFacing
  } = useCameraScan();

  const handleSubmit = async () => {
    if (!item) {
      Alert.alert('Error', 'No item scanned yet');
      return;
    }
    
    setIsSearching(true);
    try {
      // Pass selected stores to search function
      const foundProducts = await searchProducts(item, stores);
      // Add IDs to products if they don't exist
      const productsWithIds = foundProducts.map(p => ({
        ...p,
        id: p.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));
      
      setProducts(productsWithIds);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Error', 'Failed to search products');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCart = async (selectedProducts: Product[], cartId: string) => {
    try {
      await saveToCart(selectedProducts, userId, cartId);
      return Promise.resolve();
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert('Error', 'Failed to save items to cart');
      return Promise.reject(error);
    }
  };

  const closeResultsModal = () => {
    setShowResults(false);
  };

  const toggleStoreSettings = () => {
    setShowStoreSettings(!showStoreSettings);
  };

  const toggleStore = (store: keyof Stores) => {
    setStores(prev => ({
      ...prev,
      [store]: !prev[store]
    }));
  };

  if (!permission) {
    return <SafeAreaView style={cameraStyles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={cameraStyles.container}>
        <Text style={cameraStyles.resultText}>Need camera permission</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={cameraStyles.resultText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={cameraStyles.container}>
      <CameraView ref={cameraRef} facing="back" onFlip={toggleCameraFacing} />
      
      {/* Settings button */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={toggleStoreSettings}
        activeOpacity={0.7}
      >
        <Text style={styles.settingsButtonText}>Stores</Text>
      </TouchableOpacity>
      
      <ScanResults item={item} />
      
      <CameraControls 
        onCapture={captureImage}
        onSubmit={handleSubmit}
        loadingCapture={loading}
        loadingSubmit={isSearching}
      />

      {/* Store Settings Modal */}
      <Modal
        visible={showStoreSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleStoreSettings}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Stores</Text>
            
            <View style={styles.storeOption}>
              <Text style={styles.storeText}>Walmart</Text>
              <Switch
                value={stores.walmart}
                onValueChange={() => toggleStore('walmart')}
                trackColor={{ false: "#767577", true: "#e63b60" }}
                thumbColor={stores.walmart ? "#f4f3f4" : "#f4f3f4"}
              />
            </View>
            
            <View style={styles.storeOption}>
              <Text style={styles.storeText}>Target</Text>
              <Switch
                value={stores.target}
                onValueChange={() => toggleStore('target')}
                trackColor={{ false: "#767577", true: "#e63b60" }}
                thumbColor={stores.target ? "#f4f3f4" : "#f4f3f4"}
              />
            </View>
            
            <View style={styles.storeOption}>
              <Text style={styles.storeText}>Costco</Text>
              <Switch
                value={stores.costco}
                onValueChange={() => toggleStore('costco')}
                trackColor={{ false: "#767577", true: "#e63b60" }}
                thumbColor={stores.costco ? "#f4f3f4" : "#f4f3f4"}
              />
            </View>
            
            <View style={styles.storeOption}>
              <Text style={styles.storeText}>Sam's Club</Text>
              <Switch
                value={stores.samsClub}
                onValueChange={() => toggleStore('samsClub')}
                trackColor={{ false: "#767577", true: "#e63b60" }}
                thumbColor={stores.samsClub ? "#f4f3f4" : "#f4f3f4"}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={toggleStoreSettings}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showResults}
        animationType="slide"
        transparent={false}
        onRequestClose={closeResultsModal}
      >
        <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
          <ProductResultsScreen 
            products={products}
            onAddToCart={handleAddToCart}
            userId={userId}
            onClose={closeResultsModal}
            searchQuery={item || ""} // Pass the scanned item as search query
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  settingsButton: {
    position: 'absolute',
    top: 50,  // Increased to avoid status bar
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,  // Increased for better touch target
    borderRadius: 8,
    zIndex: 10,
  },
  settingsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  storeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  storeText: {
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#e63b60',
    padding: 12,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});