import { useState } from 'react';
import { searchProducts } from '../services/productService'; 
import { getProductByBarcode, isBarcode } from '../services/barcodeService';
import { Product, Stores } from '../app/types';
import { Alert } from 'react-native';

// hook for managing product search functionality
export function useProductSearch() {
  // state for found products
  const [products, setProducts] = useState<Product[]>([]);
  // loading state during searches
  const [isSearching, setIsSearching] = useState(false);
  // control visibility of search results
  const [showResults, setShowResults] = useState(false);

  // search for products by text query
  const searchByText = async (query: string, stores: Stores) => {
    if (!query) {
      return;
    }

    setIsSearching(true);
    try {
      // if the query appears to be a barcode, use barcode lookup
      if (isBarcode(query)) {
        return await searchByBarcode(query, stores);
      }

      // search for products across selected stores
      const foundProducts = await searchProducts(query, stores);
      
      if (foundProducts.length > 0) {
        // update products state and show results
        setProducts(foundProducts);
        setShowResults(true);
        return foundProducts;
      } else {
        Alert.alert('No Products Found', 'No products found for this item.');
        return [];
      }
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Error', 'Failed to search products');
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // search for products by barcode
  const searchByBarcode = async (barcode: string, stores: Stores) => {
    if (!barcode) {
      return [];
    }

    setIsSearching(true);
    try {
      console.log("Searching for products with barcode:", barcode);
      
      // look up products using the barcode
      const foundProducts = await getProductByBarcode(barcode, stores);
      
      console.log(`Found ${foundProducts.length} products for barcode ${barcode}`);
      
      if (foundProducts.length > 0) {
        // update products state and show results
        setProducts(foundProducts);
        setShowResults(true);
        return foundProducts;
      } else {
        Alert.alert(
          'Invalid Barcode',
          `Couldn't identify a product with barcode ${barcode}. Please try scanning a different product.`
        );
        return [];
      }
    } catch (error) {
      console.error('Barcode lookup failed:', error);
      Alert.alert('Error', 'Failed to look up barcode information.');
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // close the results modal
  const closeResults = () => {
    setShowResults(false);
  };

  // clear search results and hide results modal
  const clearResults = () => {
    setProducts([]);
    setShowResults(false);
  };

  return {
    products,
    isSearching,
    showResults,
    searchByText,
    searchByBarcode,
    closeResults,
    clearResults
  };
}