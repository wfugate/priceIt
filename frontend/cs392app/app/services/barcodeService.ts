// app/services/barcodeService.ts
import { searchProducts } from './scanService';
import { Product, Stores } from '../types';
import { API_ENDPOINTS, COMMON_HEADERS } from '../config/apiConfig';

/**
 * Check if input is likely a barcode
 * @param input String to check
 * @returns true if the input appears to be a barcode
 */
export const isBarcode = (input: string): boolean => {
  // Remove common barcode separators
  const cleaned = input.replace(/[-\s]/g, '');
  
  // Most barcodes are 8-14 digits
  return /^\d{8,14}$/.test(cleaned);
};

/**
 * Clean a barcode by removing non-digit characters
 */
export const cleanBarcode = (barcode: string): string => {
  return barcode.replace(/\D/g, '');
};

/**
 * Main function to search products using a barcode
 * First looks up product info via barcode API, then searches with that product name
 */
export const getProductByBarcode = async (
  barcode: string,
  stores: Stores = { walmart: true, target: true, costco: true, samsClub: true }
): Promise<Product[]> => {
  // Ensure barcode is valid
  if (!barcode || typeof barcode !== 'string' || barcode.trim() === '') {
    console.warn('getProductByBarcode called with invalid barcode');
    return [];
  }
  
  // Clean barcode of any unwanted characters
  const cleanedBarcode = cleanBarcode(barcode.trim());
  console.log(`Looking up products for barcode: ${cleanedBarcode}`);
  
  try {
    // Step 1: Get product name from barcode using a barcode lookup API
    const productInfo = await lookupBarcodeInfo(cleanedBarcode);
    
    if (productInfo && productInfo.name) {
      console.log(`Barcode lookup successful. Product name: "${productInfo.name}"`);
      
      // Step 2: Search using the product name from the barcode lookup
      const results = await searchProducts(productInfo.name, stores);
      
      if (results && results.length > 0) {
        console.log(`Found ${results.length} results using product name from barcode lookup`);
        return results;
      } else {
        console.log('No results found with product name, trying brand name');
        
        // Try searching with brand name if available and product name failed
        if (productInfo.brand) {
          const brandResults = await searchProducts(productInfo.brand, stores);
          if (brandResults && brandResults.length > 0) {
            console.log(`Found ${brandResults.length} results using brand name from barcode lookup`);
            return brandResults;
          }
        }
      }
    }
    
    // If barcode lookup failed or returned no results, try direct search with the barcode
    console.log('Barcode lookup failed or returned no results, trying direct search with barcode');
    const directResults = await searchProducts(cleanedBarcode, stores);
    
    if (directResults && directResults.length > 0) {
      console.log(`Found ${directResults.length} results using direct barcode search`);
      return directResults;
    }
    
    // If all else fails, return placeholder results
    console.log('All search attempts failed, generating placeholder results');
    return generatePlaceholderResults(cleanedBarcode, stores);
    
  } catch (error) {
    console.error('Error in getProductByBarcode:', error);
    // Return fallback products on error
    return generatePlaceholderResults(cleanedBarcode, stores);
  }
};

/**
 * Look up product information by barcode using a dedicated barcode API
 * Uses the free UPCitemdb API to get product details
 */
async function lookupBarcodeInfo(barcode: string): Promise<{name: string, brand?: string} | null> {
  try {
    console.log(`Looking up barcode info for: ${barcode}`);
    
    // Option 1: UPCitemdb API (free, no API key required for basic usage)
    const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`UPCitemdb API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we got valid results
    if (data && data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        name: item.title || item.description || '',
        brand: item.brand || ''
      };
    }
        
    // No valid results from any API
    console.warn(`No product info found for barcode: ${barcode}`);
    return null;
    
  } catch (error) {
    console.error('Error in barcode lookup:', error);
    return null;
  }
}

/**
 * Generate placeholder results when all lookup methods fail
 */
function generatePlaceholderResults(barcode: string, stores: Stores): Product[] {
  const results: Product[] = [];
  
  if (stores.walmart) {
    results.push({
      id: `walmart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      thumbnail: 'https://via.placeholder.com/150?text=Walmart',
      price: 19.99,
      name: `Scanned Item (Barcode: ${barcode})`,
      brand: 'Walmart',
      store: 'Walmart',
      url: 'https://walmart.com'
    });
  }
  
  if (stores.target) {
    results.push({
      id: `target-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      thumbnail: 'https://via.placeholder.com/150?text=Target',
      price: 21.99,
      name: `Scanned Item (Barcode: ${barcode})`,
      brand: 'Target',
      store: 'Target',
      url: 'https://target.com'
    });
  }
  
  if (stores.costco) {
    results.push({
      id: `costco-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      thumbnail: 'https://via.placeholder.com/150?text=Costco',
      price: 18.99,
      name: `Scanned Item (Barcode: ${barcode})`,
      brand: 'Costco',
      store: 'Costco',
      url: 'https://costco.com'
    });
  }
  
  if (stores.samsClub) {
    results.push({
      id: `samsclub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      thumbnail: 'https://via.placeholder.com/150?text=SamsClub',
      price: 17.99,
      name: `Scanned Item (Barcode: ${barcode})`,
      brand: "Sam's Club",
      store: "Sam's Club",
      url: 'https://samsclub.com'
    });
  }
  
  return results.sort((a, b) => a.price - b.price);
}

export default {
  getProductByBarcode,
  isBarcode,
  cleanBarcode
};