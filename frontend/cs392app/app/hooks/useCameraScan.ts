// app/hooks/useCameraScan.ts
import { useState, useRef, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { scanImage } from '../services/scanService';
import { BarcodeScanningResult } from 'expo-camera';

export function useCameraScan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'image' | 'barcode'>('image');
  const [isBarcodeScanningActive, setIsBarcodeScanningActive] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Reset item when changing scan mode - use this only for initialization
  // For switching modes, use toggleScanMode instead
  useEffect(() => {
    console.log(`Scan mode initialized to ${scanMode}`);
    
    // Initial setup of barcode scanning based on mode
    setIsBarcodeScanningActive(scanMode === 'barcode');
  }, []); // Empty dependency array - run only once on mount

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
    // Don't process if scanning is inactive, loading, or we already scanned this barcode
    if (!isBarcodeScanningActive || loading || data === lastScannedBarcode) {
      return;
    }
    
    // Immediately disable scanning to prevent duplicate scans
    setIsBarcodeScanningActive(false);
    
    // Store barcode data and update UI
    console.log(`Barcode detected and processing: ${type} - ${data}`);
    setLoading(true);
    setLastScannedBarcode(data);
    setItem(data);
    setLoading(false);
    
    // We don't need a timeout here - scanning will be re-enabled 
    // when the user closes the results modal
  };

  const toggleScanMode = (mode: 'image' | 'barcode') => {
    console.log(`Setting scan mode to: ${mode}`);
    // Set the mode first
    setScanMode(mode);
    
    // Clear previous data
    setItem(null);
    setLastScannedBarcode(null);
    
    // Set barcode scanning state immediately
    if (mode === 'barcode') {
      console.log('Enabling barcode scanning');
      setIsBarcodeScanningActive(true);
    } else {
      setIsBarcodeScanningActive(false);
    }
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
    toggleScanMode
  };
}