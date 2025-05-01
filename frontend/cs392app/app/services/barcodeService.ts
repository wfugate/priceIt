// app/services/barcodeService.ts
import { searchProducts } from './productService'
import { Product, Stores } from '../types';

/**
 * check if a string appears to be a barcode
 * @param input String to check
 * @returns true if the input appears to be a barcode
 */
export const isBarcode = (input: string): boolean => {
  // remove common barcode separators like dashes and spaces
  const cleaned = input.replace(/[-\s]/g, '');
  
  // most barcodes are 8-14 digits
  return /^\d{8,14}$/.test(cleaned);
};

/**
 * clean a barcode by removing non-digit characters
 */
export const cleanBarcode = (barcode: string): string => {
  return barcode.replace(/\D/g, '');
};

/**
 * look up products by barcode
 * first gets product info from barcode API, then searches stores with that product name
 */
export const getProductByBarcode = async (
  barcode: string,
  stores: Stores = { walmart: true, target: true, costco: true, samsClub: true }
): Promise<Product[]> => {
  // validate barcode input
  if (!barcode || typeof barcode !== 'string' || barcode.trim() === '') {
    console.warn('getProductByBarcode called with invalid barcode');
    return [];
  }
  
  // clean barcode of unwanted characters
  const cleanedBarcode = cleanBarcode(barcode.trim());
  console.log(`Looking up products for barcode: ${cleanedBarcode}`);
  
  try {
    // step 1: get product name from barcode using lookup API
    const productInfo = await lookupBarcodeInfo(cleanedBarcode);
    
    if (productInfo && productInfo.name) {
      console.log(`Barcode lookup successful. Product name: "${productInfo.name}"`);
      
      // step 2: search using the product name from barcode lookup
      const results = await searchProducts(productInfo.name, stores);
      
      if (results && results.length > 0) {
        console.log(`Found ${results.length} results using product name from barcode lookup`);
        return results;
      } else {
        console.log('No results found with product name, trying brand name');
        
        // step 3: try searching with brand name if available and product name failed
        if (productInfo.brand) {
          const brandResults = await searchProducts(productInfo.brand, stores);
          if (brandResults && brandResults.length > 0) {
            console.log(`Found ${brandResults.length} results using brand name from barcode lookup`);
            return brandResults;
          }
        }
      }
    }
    
    // if barcode lookup failed or returned no results, return empty array
    console.log('Barcode lookup failed or returned no results');
    return [];
    
  } catch (error) {
    console.error('Error in getProductByBarcode:', error);
    // return empty array on error
    return [];
  }
};

/**
 * look up product information by barcode using a dedicated barcode API
 * uses the free UPCitemdb API to get product details
 */
async function lookupBarcodeInfo(barcode: string): Promise<{name: string, brand?: string} | null> {
  try {
    console.log(`Looking up barcode info for: ${barcode}`);
    
    // call UPCitemdb API (free, no API key required for basic usage)
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
    
    // check if we got valid results
    if (data && data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        name: item.title || item.description || '',
        brand: item.brand || ''
      };
    }
        
    // no valid results from API
    console.warn(`No product info found for barcode: ${barcode}`);
    return null;
    
  } catch (error) {
    console.error('Error in barcode lookup:', error);
    return null;
  }
}

export default {
  getProductByBarcode,
  isBarcode,
  cleanBarcode
};