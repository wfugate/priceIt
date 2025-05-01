// app/hooks/useCameraScan.ts
import { useState, useRef, useEffect } from 'react';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { scanImage } from '../services/imageProcessingService';

export function useCameraScan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'image' | 'barcode'>('image');
  const [isBarcodeScanningActive, setIsBarcodeScanningActive] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Initialize barcode scanning based on mode
  useEffect(() => {
    console.log(`Scan mode initialized to ${scanMode}`);
    setIsBarcodeScanningActive(scanMode === 'barcode');
  }, []); 

  const captureImage = async () => {
    if (!cameraRef.current || loading || scanMode !== 'image') return;
    
    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: true
      });

      if (!photo?.base64) throw new Error('Failed to capture photo');
      
      const result = await scanImage(photo.base64);
      setItem(result.item);
    } catch (error) {
      console.error('Error during image capture:', error);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    // Prevent multiple scans
    if (!isBarcodeScanningActive || loading || data === lastScannedBarcode) {
      console.log(`Barcode scan skipped: ${data} - active:${isBarcodeScanningActive}, loading:${loading}`);
      return;
    }
    
    // Disable scanning to prevent duplicate scans
    setIsBarcodeScanningActive(false);
    
    console.log(`Barcode detected: ${type} - ${data}`);
    setLoading(true);
    
    // Update lastScannedBarcode to prevent duplicate scans
    setLastScannedBarcode(data);
    
    // Set the detected barcode as the item
    setItem(data);
    
    // Change loading state after a short delay
    setTimeout(() => {
      setLoading(false);
    }, 100);
  };

  const toggleScanMode = (mode: 'image' | 'barcode') => {
    // Don't do anything if we're already in this mode
    if (mode === scanMode) {
      console.log(`Already in ${mode} mode, no change needed`);
      return;
    }
    
    console.log(`Setting scan mode to: ${mode}`);
    
    // Clear previous data
    setItem(null);
    setLastScannedBarcode(null);
    setLoading(false);
    
    // Update the scan mode
    setScanMode(mode);
    
    // Set barcode scanning state based on the mode
    if (mode === 'barcode') {
      console.log('Enabling barcode scanning');
      // Short delay to ensure clean state before enabling
      setTimeout(() => {
        setIsBarcodeScanningActive(true);
      }, 100);
    } else {
      setIsBarcodeScanningActive(false);
    }
  };

  // Function to reset barcode scanner without mode changes
  const resetBarcodeScanner = () => {
    // Only applies to barcode mode
    if (scanMode !== 'barcode') return;
    
    console.log('Performing controlled reset of barcode scanner');
    
    // Disable scanning to prevent new detections during reset
    setIsBarcodeScanningActive(false);
    
    // Clear state in a controlled sequence
    setLoading(false);
    setLastScannedBarcode(null);
    setItem(null);
    
    // Re-enable scanning after a delay
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


export default function removeWarning(){}