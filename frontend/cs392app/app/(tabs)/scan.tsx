// app/(tabs)/scan.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, Switch, StyleSheet, SafeAreaView } from 'react-native';
import { useCameraScan } from '../hooks/useCameraScan';
import CameraView from '../../components/camera/CameraView';
import CameraControls from '../../components/camera/CameraControls';
import ScanResults from '../../components/camera/ScanResults';
import { ScanModeToggle } from '../../components/camera/ScanModeToggle';
import ProductResultsScreen from '../../components/camera/ProductResults';
import { cameraStyles } from '../../components/styles/styles';
import { searchProducts, saveToCart } from '../services/scanService';
import { Product, Stores } from '../types';
import { getProductByBarcode, isBarcode } from '../services/barcodeService';
import { useAuth } from '../context/AuthContext'; 
export default function ScanScreen() {
  const [showResults, setShowResults] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showStoreSettings, setShowStoreSettings] = useState(false);
  const [realItem, setRealItem] = useState<string |'No Item'>();
  const [stores, setStores] = useState<Stores>({
    walmart: true,
    target: true,
    costco: true,
    samsClub: true
  });
  
  // Mock userId - In a real app, this would come from authentication
  const { user } = useAuth();
  const userId = user?.UserId;

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
  // In the useEffect block that handles barcode scanning in scan.tsx, 
// we need to update how the products and relevance keywords are set

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
      // First validate that the item looks like a barcode
      if (!isBarcode(currentItem)) {
        console.warn(`Scanned value "${currentItem}" doesn't look like a valid barcode`);
        Alert.alert(
          'Invalid Barcode',
          `"${currentItem}" doesn't appear to be a valid barcode.`,
          [{ 
            text: 'OK',
            onPress: () => {
              if (isCurrentEffect && scanMode === 'barcode') {
                resetBarcodeScanner();
              }
            }
          }]
        );
        return;
      }
      
      console.log("Searching for products with barcode:", currentItem);
      
      // Use our enhanced barcode service with the full barcode lookup flow
      const foundProducts = await getProductByBarcode(currentItem, stores);
      
      // Debug log to see what's happening
      console.log(`Found ${foundProducts.length} products for barcode ${currentItem}`);
      
      // Only update state if this is still the current effect and we're still in barcode mode
      if (!isCurrentEffect || scanMode !== currentMode) {
        console.log('Effect no longer relevant, cancelling product display');
        return;
      }
      
      // Handle the search results
      if (foundProducts.length > 0) {
        console.log('Setting products and showing results');
        setProducts(foundProducts);
        
        // FIX: Use the actual product name for the search query instead of the barcode
        // Get the first product name to use as search query for relevance
        const productName = foundProducts[0].name || currentItem;
        setShowResults(true);
        
        // Pass the product name as the searchQuery to ProductResultsScreen
        // This will be handled when rendering the modal with ProductResultsScreen
      } else {
        console.log('No products found for barcode, showing alert');
        Alert.alert(
          'No Products Found',
          `No products found for barcode ${currentItem}.`,
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
      if (isCurrentEffect) {
        setIsSearching(false);
      }
    }
  };
  
  // Run the search with a small delay to ensure UI updates first
  const searchTimeout = setTimeout(() => {
    searchForBarcodeProducts();
  }, 300);
  
  // Cleanup - mark this effect as no longer current if it unmounts
  return () => {
    isCurrentEffect = false;
    clearTimeout(searchTimeout);
  };
}, [item, scanMode]);
  
  // Also update the handleSubmit function to use our enhanced barcode service for image scans
  const handleSubmit = async () => {
    if (!item) {
      Alert.alert('Error', 'No item scanned yet');
      return;
    }
    
    setIsSearching(true);
    try {
      let foundProducts;
      
      // If the scanned item appears to be a barcode, use the special barcode handling
      if (isBarcode(item)) {
        console.log('Detected barcode in image scan, using barcode service');
        foundProducts = await getProductByBarcode(item, stores);
      } else {
        // Otherwise use regular search
        foundProducts = await searchProducts(item, stores);
      }
      
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
      if (!userId) return;
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
    return <SafeAreaView style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Need camera permission</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Scan mode toggle at the top */}
      <View style={styles.scanModeContainer}>
        <ScanModeToggle mode={scanMode} onToggle={handleScanModeToggle} />
      </View>

      {/* Camera view with barcode scanner overlay */}
      <CameraView 
        ref={cameraRef}
        onBarCodeScanned={scanMode === 'barcode' && isBarcodeScanningActive ? handleBarCodeScanned : undefined}
      />
      
      {/* Settings button */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={toggleStoreSettings}
        activeOpacity={0.7}
      >
        <Text style={styles.settingsButtonText}>Stores</Text>
      </TouchableOpacity>
      
      {/* Barcode scanner overlay */}
      {scanMode === 'barcode' && (
        <View style={styles.barcodeScanOverlay}>
          <Text style={styles.barcodeScanText}>
            {loading ? 'Processing...' : 'Position barcode here'}
          </Text>
          {item && scanMode === 'barcode' && (
            <Text style={[styles.barcodeScanText, {marginTop: 5}]}>
              Code: {realItem}
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
      searchQuery={scanMode === 'barcode' && products.length > 0 ? products[0].name : item || ""}
    />
  </View>
</Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A1D96', // Deep royal purple
    padding: 0,
    margin: 0,
  },
  scanModeContainer: {
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  settingsButton: {
    position: 'absolute',
    bottom: 190,
    left: 30,
    backgroundColor: 'rgba(255,255,255,0.2)', // Semi-transparent white
    padding: 12,
    borderRadius: 8,
    zIndex: 10,
  },
  settingsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  barcodeScanOverlay: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    height: 100,
    borderWidth: 2,
    borderColor: '#F59E0B', // Yellow/orange border
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
    backgroundColor: '#F59E0B', // Yellow/orange button
    padding: 14,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
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
    color: '#4A1D96', // Deep purple for title
  },
  storeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9D8FD', // Light purple border
  },
  storeText: {
    fontSize: 16,
    color: '#4A1D96', // Deep purple for text
  },
  closeButton: {
    backgroundColor: '#F59E0B', // Yellow/orange button
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