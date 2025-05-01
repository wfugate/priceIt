// app/hooks/useProductSearch.ts
import { useState, useEffect } from 'react';
import { searchProducts } from '../services/productService'; // This will change when you refactor the service files
import { getProductByBarcode, isBarcode } from '../services/barcodeService';
import { Product, Stores } from '../types';
import { Alert } from 'react-native';

export function useProductSearch() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);


  const searchByText = async (query: string, stores: Stores) => {
    if (!query) {
      return;
    }

    setIsSearching(true);
    try {
      // If the query appears to be a barcode, use barcode lookup
      if (isBarcode(query)) {
        return await searchByBarcode(query, stores);
      }

      const foundProducts = await searchProducts(query, stores);
      
      if (foundProducts.length > 0) {
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

  const searchByBarcode = async (barcode: string, stores: Stores) => {
    if (!barcode) {
      return [];
    }

    setIsSearching(true);
    try {
      console.log("Searching for products with barcode:", barcode);
      
      const foundProducts = await getProductByBarcode(barcode, stores);
      
      console.log(`Found ${foundProducts.length} products for barcode ${barcode}`);
      
      if (foundProducts.length > 0) {
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

  const closeResults = () => {
    setShowResults(false);
  };

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