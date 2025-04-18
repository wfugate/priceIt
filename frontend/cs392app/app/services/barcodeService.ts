// app/services/barcodeService.ts
/**
 * Optimized barcode service that handles API limitations
 * Simply passes barcode queries to the searchProducts function
 * with proper error handling
 */

import { searchProducts } from './scanService';

/**
 * Get products by barcode
 * Designed to be resilient to API failures
 */
export const getProductByBarcode = async (barcode: string) => {
  // Ensure barcode is valid
  if (!barcode || typeof barcode !== 'string' || barcode.trim() === '') {
    console.warn('getProductByBarcode called with invalid barcode');
    return [];
  }
  
  try {
    // Clean barcode of any unwanted characters
    const cleanBarcode = barcode.trim();
    console.log(`Looking up products for barcode: ${cleanBarcode}`);
    
    // Simply delegate to the standard searchProducts function
    const results = await searchProducts(cleanBarcode);
    
    // Ensure we always return an array
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error('Error in getProductByBarcode:', error);
    // Return an empty array on error to prevent undefined errors
    return [];
  }
};

export default {}; 