import { useState, useEffect } from 'react';
import { Product } from '../types';
import { searchProducts, getProductByBarcode } from '../services/productService';
import { Alert } from 'react-native';

// define sort and filter option types
export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
export type FilterOption = 'all' | 'walmart' | 'target' | 'costco' | 'samsClub';

// extend the Product type to include relevance scoring and selection state
interface ProductWithRelevance extends Product {
  relevanceScore?: number;
  selected?: boolean;
}

// enhanced product search hook with advanced filtering, sorting, and UI management
export function useEnhancedProductSearch(initialProducts: Product[], initialSearchQuery: string = '') {
  // product state with source products and filtered display products
  const [products, setProducts] = useState<ProductWithRelevance[]>(
    initialProducts.map(p => ({ 
      ...p, 
      selected: p.selected || false, 
      relevanceScore: p.relevanceScore || 0 
    }))
  );
  const [displayedProducts, setDisplayedProducts] = useState<ProductWithRelevance[]>(products);
  // product detail viewing state
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelevance | null>(null);
  
  // UI state management
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  
  // search configuration state
  const [relevanceKeywords, setRelevanceKeywords] = useState<string>(initialSearchQuery);
  
  // filter and sort state
  const [currentSort, setCurrentSort] = useState<SortOption>('relevance');
  const [currentFilter, setCurrentFilter] = useState<FilterOption>('all');
  
  // success message state for feedback after operations
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // calculate relevance scores based on search keywords when component mounts
  useEffect(() => {
    if (initialSearchQuery) {
      calculateRelevanceScores(initialSearchQuery);
    }
  }, []);

  // apply filters and sorting whenever they change
  useEffect(() => {
    applyFiltersAndSort();
  }, [products, currentSort, currentFilter, relevanceKeywords]);

  // auto-hide success message after delay
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  // calculate relevance scores for products based on matching keywords
  const calculateRelevanceScores = (query: string) => {
    if (!query) return;

    const keywords = query.toLowerCase().split(/\s+/);
    
    setProducts(prev => 
      prev.map(product => {
        let score = 0;
        const productText = (product.name + ' ' + product.brand).toLowerCase();
        
        keywords.forEach(keyword => {
          if (productText.includes(keyword)) {
            // more weight for exact matches
            if (productText.includes(` ${keyword} `)) {
              score += 3;
            } else {
              score += 1;
            }
          }
        });
        
        return { ...product, relevanceScore: score };
      })
    );
  };

  // apply filters and sorting to products for display
  const applyFiltersAndSort = () => {
    // first filter by store
    let filtered = [...products];
    if (currentFilter !== 'all') {
      filtered = filtered.filter(p => {
        if (currentFilter === 'walmart') return p.store === 'Walmart';
        if (currentFilter === 'target') return p.store === 'Target';
        if (currentFilter === 'costco') return p.store === 'Costco';
        if (currentFilter === 'samsClub') return p.store === "Sam's Club";
        return true;
      });
    }

    // then sort the filtered results
    let sorted = [...filtered];
    if (currentSort === 'relevance') {
      sorted.sort((a, b) => {
        const scoreCompare = (b.relevanceScore || 0) - (a.relevanceScore || 0);
        return scoreCompare !== 0 ? scoreCompare : a.price - b.price;
      });
    } else if (currentSort === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'name-desc') {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    }

    setDisplayedProducts(sorted);
  };

  // toggle selection state of a product
  const toggleProductSelection = (productId: string) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, selected: !p.selected } : p
      )
    );
  };

  // get array of currently selected products
  const getSelectedProducts = () => {
    return products.filter(p => p.selected);
  };

  // reset all product selections
  const clearSelections = () => {
    setProducts(prev => prev.map(p => ({ ...p, selected: false })));
  };

  // search for products by text query
  const searchByText = async (query: string, stores: any) => {
    if (!query) {
      return [];
    }

    setIsSearching(true);
    try {
      const foundProducts = await searchProducts(query, stores);
      
      if (foundProducts.length > 0) {
        // initialize products with relevance scores
        setProducts(foundProducts.map(p => ({ ...p, selected: false, relevanceScore: 0 })));
        calculateRelevanceScores(query);
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
  const searchByBarcode = async (barcode: string, stores: any) => {
    if (!barcode) {
      return [];
    }
  
    setIsSearching(true);
    try {
      const foundProducts = await getProductByBarcode(barcode, stores);
      
      if (foundProducts.length > 0) {
        // initialize products with relevance scores
        setProducts(foundProducts.map(p => ({ ...p, selected: false, relevanceScore: 0 })));
        
        // use product name for relevance if available
        if (foundProducts[0].name) {
          calculateRelevanceScores(foundProducts[0].name);
        }
        
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
    setDisplayedProducts([]);
    setShowResults(false);
  };

  // show a success message temporarily
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
  };

  // get display label for current sort option
  const getSortLabel = (sort: SortOption): string => {
    switch (sort) {
      case 'relevance': return 'Most Relevant';
      case 'price-asc': return 'Price: Low to High';
      case 'price-desc': return 'Price: High to Low';
      case 'name-asc': return 'Name: A to Z';
      case 'name-desc': return 'Name: Z to A';
      default: return 'Sort';
    }
  };

  // get display label for current filter option
  const getFilterLabel = (filter: FilterOption): string => {
    switch (filter) {
      case 'all': return 'All Stores';
      case 'walmart': return 'Walmart';
      case 'target': return 'Target';
      case 'costco': return 'Costco';
      case 'samsClub': return "Sam's Club";
      default: return 'Filter';
    }
  };

  // update relevance keywords and recalculate scores
  const handleRelevanceKeywordsChange = (text: string) => {
    setRelevanceKeywords(text);
    calculateRelevanceScores(text);
  };

  // show product details modal for a product
  const viewProductDetails = (product: ProductWithRelevance) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // close the product details modal
  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  return {
    // state
    products,
    displayedProducts,
    isSearching,
    showResults,
    currentSort,
    currentFilter,
    showSuccessMessage,
    successMessage,
    relevanceKeywords,
    selectedProduct,
    showProductModal,
    
    // actions
    setCurrentSort,
    setCurrentFilter,
    toggleProductSelection,
    getSelectedProducts,
    clearSelections,
    searchByText,
    searchByBarcode,
    closeResults,
    clearResults,
    showSuccess,
    getSortLabel,
    getFilterLabel,
    handleRelevanceKeywordsChange,
    viewProductDetails,
    closeProductModal
  };
}