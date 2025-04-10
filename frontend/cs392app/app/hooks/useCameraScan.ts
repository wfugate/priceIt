// app/hooks/useCameraScan.ts
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { scanImage } from '../services/scanService';

export function useCameraScan() {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const captureImage = async () => {
    if (!cameraRef.current || loading) return;
    
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
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return {
    cameraRef,
    facing,
    item,
    loading,
    permission,
    requestPermission,
    captureImage,
    toggleCameraFacing
  };
}

// app/hooks/useCameraScan.ts
// interface Product {
//     id: string;
//     name: string;
//     price: string;
//     image: string;
//     // Add any additional fields you need
//   };
// import { useState, useRef } from 'react';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import { scanImage, searchProducts, saveToMongoDB } from '../services/scanService';

// export function useCameraScan() {
//   const [facing, setFacing] = useState<'back' | 'front'>('back');
//   const [permission, requestPermission] = useCameraPermissions();
//   const [loading, setLoading] = useState(false);
//   const [scrapingLoading, setScrapingLoading] = useState(false);
//   const [item, setItem] = useState<string | null>(null);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
//   const [showResults, setShowResults] = useState(false);
//   const cameraRef = useRef<CameraView>(null);

//   const captureImage = async () => {
//     if (!cameraRef.current || loading) return;
    
//     setLoading(true);
//     setItem(null);
//     setProducts([]);
//     setSelectedProduct(null);
//     setShowResults(false);

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
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!item) return;
    
//     setScrapingLoading(true);
//     try {
//       const foundProducts = await searchProducts(item);
//       setProducts(foundProducts);
//       setShowResults(true);
//     } catch (error) {
//       console.error('Error searching products:', error);
//     } finally {
//       setScrapingLoading(false);
//     }
//   };

//   const handleBackToCamera = () => {
//     setShowResults(false);
//   };

//   const handleProductSelect = (product: Product) => {
//     setSelectedProduct(product);
//   };

//   const saveSelectedProduct = async () => {
//     if (!selectedProduct) return;
//     try {
//       await saveToMongoDB(selectedProduct);
//       setSelectedProduct(null);
//       setShowResults(false);
//     } catch (error) {
//       console.error('Error saving product:', error);
//     }
//   };

//   const toggleCameraFacing = () => {
//     setFacing(current => (current === 'back' ? 'front' : 'back'));
//   };

//   return {
//     cameraRef,
//     facing,
//     item,
//     products,
//     loading,
//     scrapingLoading,
//     selectedProduct,
//     showResults,
//     permission,
//     requestPermission,
//     captureImage,
//     handleSubmit,
//     handleBackToCamera,
//     toggleCameraFacing,
//     handleProductSelect,
//     saveSelectedProduct
//   };
// }