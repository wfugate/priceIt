import { useState, useRef, useEffect } from 'react';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { scanImage } from '../services/imageProcessingService';

// hook for managing camera functionality including image scanning and barcode detection
export function useCameraScan(focused: boolean = true) {
  // camera permissions management
  const [permission, requestPermission] = useCameraPermissions();
  // loading state for async operations
  const [loading, setLoading] = useState(false);
  // state for storing scan result (product name or barcode value)
  const [item, setItem] = useState<string | null>(null);
  // state for tracking current scan mode
  const [scanMode, setScanMode] = useState<'image' | 'barcode'>('image');
  // state for controlling barcode scanner activity
  const [isBarcodeScanningActive, setIsBarcodeScanningActive] = useState(false);
  // track last scanned barcode to prevent duplicate scans
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  // reference to camera component
  const cameraRef = useRef<CameraView>(null);

  // initialize barcode scanning based on selected mode
  useEffect(() => {
    console.log(`Scan mode: ${scanMode}, focused: ${focused}`);
    setIsBarcodeScanningActive(scanMode === 'barcode' && focused);
  }, [scanMode, focused]);


  // function to capture and process an image
  const captureImage = async () => {
    if (!cameraRef.current || loading || scanMode !== 'image') return;
    
    setLoading(true);
    try {
      // step 1: take a photo with the camera
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: true
      });

      if (!photo?.base64) throw new Error('Failed to capture photo');
      
      // step 2: send the image to the backend for processing
      const result = await scanImage(photo.base64);
      // step 3: update state with the recognized item
      setItem(result.item);
    } catch (error) {
      console.error('Error during image capture:', error);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  // function to handle barcode scanning
  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    // prevent multiple scans of the same barcode or when scanner is disabled
    if (!isBarcodeScanningActive || loading || data === lastScannedBarcode) {
      console.log(`Barcode scan skipped: ${data} - active:${isBarcodeScanningActive}, loading:${loading}`);
      return;
    }
    
    // disable scanner to prevent duplicate scans
    setIsBarcodeScanningActive(false);
    
    console.log(`Barcode detected: ${type} - ${data}`);
    setLoading(true);
    
    // store scanned barcode to prevent duplicates
    setLastScannedBarcode(data);
    
    // set the detected barcode as the item
    setItem(data);
    
    // change loading state after a short delay
    setTimeout(() => {
      setLoading(false);
    }, 100);
  };

  // function to toggle between image and barcode scanning modes
  const toggleScanMode = (mode: 'image' | 'barcode') => {
    // don't do anything if already in the selected mode
    if (mode === scanMode) {
      console.log(`Already in ${mode} mode, no change needed`);
      return;
    }
    
    console.log(`Setting scan mode to: ${mode}`);
    
    // clear previous scan results
    setItem(null);
    setLastScannedBarcode(null);
    setLoading(false);
    
    // update the scan mode
    setScanMode(mode);
    
    // enable or disable barcode scanning based on mode
    if (mode === 'barcode') {
      console.log('Enabling barcode scanning');
      // short delay to ensure clean state before enabling
      setTimeout(() => {
        setIsBarcodeScanningActive(true);
      }, 100);
    } else {
      setIsBarcodeScanningActive(false);
    }
  };

  // function to reset barcode scanner without changing mode
  const resetBarcodeScanner = () => {
    // only applies to barcode mode
    if (scanMode !== 'barcode') return;
    
    console.log('Performing controlled reset of barcode scanner');
    
    // disable scanning during reset to prevent new detections
    setIsBarcodeScanningActive(false);
    
    // clear state in a controlled sequence
    setLoading(false);
    setLastScannedBarcode(null);
    setItem(null);
    
    // re-enable scanning after a delay
    setTimeout(() => {
      console.log('Re-enabling barcode scanning after reset');
      setIsBarcodeScanningActive(true);
    }, 500);
  };

  return {
    cameraRef,
    item,
    loading,
    permission,
    requestPermission,
    captureImage,
    scanMode,
    isBarcodeScanningActive,
    handleBarCodeScanned,
    toggleScanMode,
    resetBarcodeScanner
  };
}