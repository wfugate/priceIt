// app/(tabs)/scan.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, Switch, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useCameraScan } from '../hooks/useCameraScan';
import CameraView from '../../components/camera/CameraView';
import CameraControls from '../../components/camera/CameraControls';
import ScanResults from '../../components/camera/ScanResults';
import { ScanModeToggle } from '../../components/camera/ScanModeToggle';
import ProductResultsScreen from '../../components/camera/ProductResults';
import { saveToCart } from '../services/cartService';
import { Product } from '../types';
import { isBarcode } from '../services/barcodeService';
import { useAuth } from '../context/AuthContext'; 
import { useStoreSettings } from '../hooks/useStoreSettings';
import { useProductSearch } from '../hooks/useProductSearch';

export default function ScanScreen() {
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Mock userId - In a real app, this would come from authentication
  const { user } = useAuth();
  const userId = user?.UserId;

  const {
    cameraRef,
    item,
    loading: cameraLoading,
    permission,
    requestPermission,
    captureImage: originalCaptureImage,
    scanMode,
    toggleScanMode,
    handleBarCodeScanned: originalHandleBarCodeScanned,
    isBarcodeScanningActive,
    resetBarcodeScanner
  } = useCameraScan();

  const { 
    stores, 
    showStoreSettings, 
    toggleStore, 
    toggleStoreSettings 
  } = useStoreSettings();

  const { 
    products, 
    isSearching, 
    showResults, 
    searchByText,
    searchByBarcode,
    closeResults,
    clearResults
  } = useProductSearch();

  useEffect(() => {
    clearResults(); // Clear results when scan mode changes
  }, [scanMode]);

  // Animation functions
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };
  
  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setLoading(false);
    });
  };

  // Function to handle video ready event
  const handleVideoReady = async (callback: () => Promise<void>) => {
    setTimeout(async () => {
      try {
        await callback();
      } catch (error) {
        console.error('Operation failed:', error);
        Alert.alert('Error', 'An error occurred during the operation');
      } finally {
        fadeOut();
      }
    }, 900); // Minimum 0.9 seconds delay
  };

  // Wrapped handleBarCodeScanned with loading screen
  const handleBarCodeScanned = (data: any) => {
    if (loading) return; // Prevent processing while loading
    
    setLoading(true);
    fadeIn();
    
    const barcodeCallback = async () => {
      originalHandleBarCodeScanned(data);
    };
    
    handleVideoReady(barcodeCallback);
  };

  // Wrapped captureImage with loading screen
  const captureImage = async () => {
    if (loading) return; // Prevent double taps
    
    setLoading(true);
    fadeIn();
    
    const captureCallback = async () => {
      await originalCaptureImage();
    };
    
    handleVideoReady(captureCallback);
  };

  // Ensure we reset the item in the parent component when toggling modes
  const handleScanModeToggle = (mode: 'image' | 'barcode') => {
    clearResults(); // Use the hook function
    toggleScanMode(mode);
    console.log(`Toggled to ${mode} mode, cleared previous results`);
  };
  // Reset UI state when scan mode change

  useEffect(() => {
    // Skip the effect entirely if we're not in barcode mode
    if (scanMode !== 'barcode') return;
    
    // Skip if no item, or already searching/showing results
    if (!item || isSearching || showResults) return;
    
    console.log('Barcode detected, triggering search for:', item);
    
    // Set loading state and start animation
    setLoading(true);
    fadeIn();
    
    // Define an async function to search for products
    const searchForBarcodeProducts = async () => {
      try {
        await searchByBarcode(item, stores);
      } catch (error) {
        console.error('Barcode search failed:', error);
        // Alert user of the error
        Alert.alert('Error', 'Failed to process barcode. Please try again.');
      } finally {
        fadeOut();
        // Reset the scanner even if there was an error
        setTimeout(() => {
          resetBarcodeScanner();
        }, 1000);
      }
    };
    
    // Run the search with a delay to ensure minimum display time
    const searchTimeout = setTimeout(() => {
      searchForBarcodeProducts();
    }, 900);
    
    return () => {
      clearTimeout(searchTimeout);
    };
  }, [item, scanMode]);
  // Updated handleSubmit function with loading screen
  const handleSubmit = async () => {
    if (!item) {
      Alert.alert('Error', 'No item scanned yet');
      return;
    }
    
    if (loading) return; // Prevent double taps
    
    setLoading(true);
    fadeIn();
    
    const submitCallback = async () => {
      try {
        // Use the hook's function instead of inline logic
        if (isBarcode(item)) {
          await searchByBarcode(item, stores);
        } else {
          await searchByText(item, stores);
        }
      } finally {
        // The isSearching state is managed by the hook now
      }
    };
    
    handleVideoReady(submitCallback);
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
    closeResults(); // Use the hook function
    
    if (scanMode === 'barcode') {
      console.log('Re-enabling barcode scanning after closing results');
      resetBarcodeScanner();
    }
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
        style={[styles.settingsButton,
          scanMode === 'image' && item ? { marginBottom: 8 } : {}]} 
        onPress={toggleStoreSettings}
        activeOpacity={0.7}
      >
        <Text style={styles.settingsButtonText}>Stores</Text>
      </TouchableOpacity>
      
      {/* Barcode scanner overlay */}
      {scanMode === 'barcode' && (
        <View style={styles.barcodeScanOverlay}>
          <Text style={styles.barcodeScanText}>
            {cameraLoading || loading ? 'Processing...' : 'Position barcode here'}
          </Text>
          {item && scanMode === 'barcode' && !loading && (
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
        loadingCapture={loading || cameraLoading}
        loadingSubmit={loading || isSearching}
        scanMode={scanMode}
      />

      {/* Store Settings Modal */}
      <Modal
        visible={showStoreSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleStoreSettings}
      >
        <SafeAreaView style = {styles.modalOverlay}>
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

      {/* Loading video overlay */}
      {(loading || isSearching)  && (
        <Animated.View style={[styles.loadingOverlay, { opacity: fadeAnim }]}>
          <Video
                source={require('../logo/priceIt_test2.mp4')}
                style={styles.loadingVideo}
            shouldPlay
            isLooping={true} 
            resizeMode={ResizeMode.STRETCH}
            isMuted
            onReadyForDisplay={() => {}}
          />
        </Animated.View>
      )}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#7851A9', 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingVideo: {
    width: '100%',
    height: '100%',
  },
});