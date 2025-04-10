import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { useCameraScan } from '../hooks/useCameraScan';
import CameraView from '../../components/camera/CameraView';
import CameraControls from '../../components/camera/CameraControls';
import ScanResults from '../../components/camera/ScanResults';
import ProductResultsScreen from '../../components/camera/ProductResults';
import { cameraStyles } from '../../components/styles/styles';
import { searchProducts, saveToCart } from '../services/scanService';

interface Product {
  id: string;
  thumbnail: string;
  price: number;
  name: string;
  brand: string;
  selected?: boolean;
}

export default function ScanScreen() {
  const [showResults, setShowResults] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
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
      const foundProducts = await searchProducts(item);
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

  if (!permission) {
    return <View style={cameraStyles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={cameraStyles.container}>
        <Text style={cameraStyles.resultText}>Need camera permission</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={cameraStyles.resultText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={cameraStyles.container}>
      <CameraView ref={cameraRef} facing="back" onFlip={toggleCameraFacing} />
      <ScanResults item={item} />
      
      <CameraControls 
        onCapture={captureImage}
        onSubmit={handleSubmit}
        loadingCapture={loading}
        loadingSubmit={isSearching}
      />

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
          />
        </View>
      </Modal>
    </View>
  );
}