import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import { useCameraScan } from '../hooks/useCameraScan';
import CameraView from '../../components/camera/CameraView';
import CameraControls from '../../components/camera/CameraControls';
import ScanResults from '../../components/camera/ScanResults';
import { ScanModeToggle } from '../../components/camera/ScanModeToggle';
import ProductResultsScreen from '../../components/camera/ProductResults';
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
    scanMode,
    toggleScanMode,
    handleBarCodeScanned,
    isBarcodeScanningActive,
    resetBarcodeScanner
  } = useCameraScan();

  // Ensure we reset the item in the parent component when toggling modes
  const handleScanModeToggle = (mode: 'image' | 'barcode') => {
    // Clear any previous results
    setProducts([]);
    setShowResults(false);
    setIsSearching(false);
    
    // Toggle the mode
    toggleScanMode(mode);
    
    console.log(`Toggled to ${mode} mode, cleared previous results`);
  };

  // Reset UI state when scan mode changes
  useEffect(() => {
    setProducts([]);
    setShowResults(false);
    setIsSearching(false);
  }, [scanMode]);

  // Watch for barcode results and search for products
  useEffect(() => {
    // Skip the effect entirely if we're not in barcode mode
    if (scanMode !== 'barcode') return;
    
    // Skip if no item, or already searching/showing results
    if (!item || isSearching || showResults) return;
    
    console.log('Barcode detected, triggering search for:', item);
    
    // Store these values for the async function
    const currentItem = item;
    const currentMode = scanMode;
    
    // Use a flag to track if this effect instance is still the most recent
    let isCurrentEffect = true;
    
    // Define an async function to search for products
    const searchForBarcodeProducts = async () => {
      console.log('Processing barcode:', currentItem);
      
      setIsSearching(true);
      try {
        console.log("Searching for products with barcode:", currentItem);
        
        const foundProducts = await searchProducts(currentItem);
        
        // Debug log to see what's happening
        console.log(`Found ${foundProducts.length} products for barcode ${currentItem}`);
        
        // Only update state if this is still the current effect and we're still in barcode mode
        if (!isCurrentEffect || scanMode !== currentMode) {
          console.log('Effect no longer relevant, cancelling product display');
          return;
        }
        
        // Handle the search results - foundProducts will always be an array now
        if (foundProducts.length > 0) {
          console.log('Setting products and showing results');
          setProducts(foundProducts);
          setShowResults(true);
        } else {
          console.log('No products found for barcode, showing alert');
          // Handle no products case with a more controlled approach
          Alert.alert(
            'No Products Found',
            'No products found for this barcode.',
            [{ 
              text: 'OK',
              onPress: () => {
                // Only reset if we're still relevant
                if (isCurrentEffect && scanMode === 'barcode') {
                  console.log('Resetting scanner after no products found');
                  resetBarcodeScanner();
                }
              }
            }]
          );
        }
      } catch (error) {
        // Only show alert if still in barcode mode and this is the current effect
        if (isCurrentEffect && scanMode === currentMode) {
          console.error('Barcode lookup failed:', error);
          Alert.alert(
            'Error',
            'Failed to look up barcode information.',
            [{ 
              text: 'OK',
              onPress: () => {
                if (scanMode === 'barcode') {
                  resetBarcodeScanner();
                }
              }

              
            }]
          );
        }
      } finally {
        // Only update state if this is still the current effect
        if (isCurrentEffect) {
          setIsSearching(false);
        }
      }
    };
    
    // Important: Run the search with a small delay to ensure UI updates first
    const searchTimeout = setTimeout(() => {
      searchForBarcodeProducts();
    }, 300);
    
    // Cleanup - mark this effect as no longer current if it unmounts
    return () => {
      isCurrentEffect = false;
      clearTimeout(searchTimeout);
    };
  }, [item, scanMode]);

  const handleSubmit = async () => {
    if (!item) {
      Alert.alert('Error', 'No item scanned yet');
      return;
    }
    
    setIsSearching(true);
    try {
      const foundProducts = await searchProducts(item);
      
      if (foundProducts.length > 0) {
        setProducts(foundProducts);
        setShowResults(true);
      } else {
        Alert.alert('No Products Found', 'No products found for this item.');
      }
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
    
    // Reset the state and re-enable scanning when returning to the scanner
    if (scanMode === 'barcode') {
      console.log('Re-enabling barcode scanning after closing results');
      resetBarcodeScanner();
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Need camera permission</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Scan mode toggle at the top */}
      <View style={styles.scanModeContainer}>
        <ScanModeToggle mode={scanMode} onToggle={handleScanModeToggle} />
      </View>

      {/* Camera view with barcode scanner overlay */}
      <CameraView 
        ref={cameraRef}
        onBarCodeScanned={scanMode === 'barcode' && isBarcodeScanningActive ? handleBarCodeScanned : undefined}
      />
      
      {/* Barcode scanner overlay */}
      {scanMode === 'barcode' && (
        <View style={styles.barcodeScanOverlay}>
          <Text style={styles.barcodeScanText}>
            {loading ? 'Processing...' : 'Position barcode here'}
          </Text>
          {item && scanMode === 'barcode' && (
            <Text style={[styles.barcodeScanText, {marginTop: 5}]}>
              Code: {item}
            </Text>
          )}
        </View>
      )}
      
      {/* Display the item that was recognized */}
      {scanMode === 'image' && <ScanResults item={item} />}
      
      {/* Camera controls - different for each mode */}
      <CameraControls 
        onCapture={captureImage}
        onSubmit={handleSubmit}
        loadingCapture={loading}
        loadingSubmit={isSearching}
        scanMode={scanMode}
      />

      {/* Product results modal */}
      <Modal
        visible={showResults}
        animationType="slide"
        transparent={false}
        onRequestClose={closeResultsModal}
      >
        <View style={{ flex: 1 }}>
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

// Local styles to ensure we have everything needed
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#223bc9',
    padding: 0,
    margin: 0,
  },
  scanModeContainer: {
    position: 'absolute',
    top: 40, // Increased to avoid notch on newer phones
    left: 10,
    right: 10,
    zIndex: 10,
  },
  barcodeScanOverlay: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    height: 100,
    borderWidth: 2,
    borderColor: '#e63b60',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodeScanText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  text: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#e63b60',
    padding: 14,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  }
});