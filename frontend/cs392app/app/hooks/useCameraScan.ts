// // app/hooks/useCameraScan.ts
// import { useState, useRef, useEffect } from 'react';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import { scanImage } from '../services/scanService';
// import { BarcodeScanningResult } from 'expo-camera';

// export function useCameraScan() {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [loading, setLoading] = useState(false);
//   const [item, setItem] = useState<string | null>(null);
//   const [scanMode, setScanMode] = useState<'image' | 'barcode'>('image');
//   const [isBarcodeScanningActive, setIsBarcodeScanningActive] = useState(false);
//   const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
//   const cameraRef = useRef<CameraView>(null);

//   // Reset item when changing scan mode - use this only for initialization
//   // For switching modes, use toggleScanMode instead
//   useEffect(() => {
//     console.log(`Scan mode initialized to ${scanMode}`);
    
//     // Initial setup of barcode scanning based on mode
//     setIsBarcodeScanningActive(scanMode === 'barcode');
//   }, []); // Empty dependency array - run only once on mount

//   const captureImage = async () => {
//     if (!cameraRef.current || loading || scanMode !== 'image') return;
    
//     setLoading(true);
//     try {
//       const photo = await cameraRef.current.takePictureAsync({
//         quality: 0.8,
//         base64: true,
//         skipProcessing: true
//       });

//       if (!photo?.base64) throw new Error('Failed to capture photo');
      
//       const result = await scanImage(photo.base64);
//       setItem(result.item);
//     } catch (error) {
//       console.error('Error during image capture:', error);
//       setItem(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
//     // Don't process if scanning is inactive, loading, or we already scanned this barcode
//     if (!isBarcodeScanningActive || loading || data === lastScannedBarcode) {
//       return;
//     }
    
//     // Immediately disable scanning to prevent duplicate scans
//     setIsBarcodeScanningActive(false);
    
//     // Store barcode data and update UI
//     console.log(`Barcode detected and processing: ${type} - ${data}`);
//     setLoading(true);
//     setLastScannedBarcode(data);
//     setItem(data);
//     setLoading(false);
    
//     // We don't need a timeout here - scanning will be re-enabled 
//     // when the user closes the results modal
//   };

//   const toggleScanMode = (mode: 'image' | 'barcode') => {
//     console.log(`Setting scan mode to: ${mode}`);
//     // Set the mode first
//     setScanMode(mode);
    
//     // Clear previous data
//     setItem(null);
//     setLastScannedBarcode(null);
    
//     // Set barcode scanning state immediately
//     if (mode === 'barcode') {
//       console.log('Enabling barcode scanning');
//       setIsBarcodeScanningActive(true);
//     } else {
//       setIsBarcodeScanningActive(false);
//     }
//   };

//   return {
//     cameraRef,
//     item,
//     loading,
//     permission,
//     requestPermission,
//     captureImage,
//     scanMode,
//     isBarcodeScanningActive,
//     handleBarCodeScanned,
//     toggleScanMode
//   };
// }
// app/hooks/useCameraScan.ts
// app/hooks/useCameraScan.ts
// app/hooks/useCameraScan.ts
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
    // Prevent multiple simultaneous scans by checking:
    // 1. If scanning is active (hasn't been disabled)
    // 2. If we're not already loading
    // 3. This is a new barcode, not one we just scanned
    if (!isBarcodeScanningActive || loading || data === lastScannedBarcode) {
      console.log(`Barcode scan skipped: ${data} - active:${isBarcodeScanningActive}, loading:${loading}`);
      return;
    }
    
    // Immediately disable scanning to prevent duplicate scans
    setIsBarcodeScanningActive(false);
    
    console.log(`Barcode successfully detected once: ${type} - ${data}`);
    setLoading(true);
    
    // Important: First update lastScannedBarcode to prevent duplicate scans
    setLastScannedBarcode(data);
    
    // Then set item which will trigger the search in the parent component
    // This must happen AFTER loading and lastScannedBarcode are set
    setItem(data);
    
    // Change loading state after a short delay to ensure UI updates
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
    
    // Clear previous data first
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

  // Function to reset just the barcode scanner without mode changes
  const resetBarcodeScanner = () => {
    // Only applies to barcode mode
    if (scanMode !== 'barcode') return;
    
    console.log('Performing controlled reset of barcode scanner');
    
    // First disable scanning to prevent new detections during reset
    setIsBarcodeScanningActive(false);
    
    // Clear state in a controlled sequence
    setLoading(false);
    setLastScannedBarcode(null);
    
    // Clear item last to avoid triggering search effects
    setItem(null);
    
    // Re-enable scanning after a short delay to ensure clean state
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