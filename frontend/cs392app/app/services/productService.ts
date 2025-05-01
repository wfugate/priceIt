import { API_ENDPOINTS, COMMON_HEADERS } from '../config/apiConfig';
import { Product, Stores } from '../types';

// search for products across multiple store APIs based on query text and selected stores
export const searchProducts = async function(query: string, stores: Stores = { walmart: true, target: true, costco: true, samsClub: true }): Promise<Product[]> { 
  try {
    const results: Product[] = [];
    
    // search Target if selected
    if (stores.target) {
      try {
        // construct API endpoint URL with encoded query
        const targetUrl = `${API_ENDPOINTS.products.target}?query=${encodeURIComponent(query)}`;
        const targetResponse = await fetch(targetUrl, {
          method: 'GET',
          headers: COMMON_HEADERS,
        });
        
        // handle unsuccessful response
        if (!targetResponse.ok) {
          console.error(`Target search error: ${targetResponse.status}`);
          throw new Error(`Target API returned status ${targetResponse.status}`);
        }
        
        // parse response data
        const targetData = await targetResponse.json();
        
        // map API response to standardized Product format
        const targetProducts = targetData.map((item: any) => ({
          id: item.productId || `target-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          thumbnail: item.thumbnail,
          price: typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.price === 'number' ? item.price : 0),
          name: item.name,
          brand: item.brand || 'Target',
          store: 'Target', // mark source store
          url: item.productUrl || 'https://target.com',
        }));
        
        // add products to results array
        results.push(...targetProducts);
      } catch (error) {
        console.error('Target search error:', error);
      }
    }

    // search Walmart if selected
    if (stores.walmart) {
      try {
        // construct API endpoint URL with encoded query
        const walmartUrl = `${API_ENDPOINTS.products.walmart}?query=${encodeURIComponent(query)}`;
        const walmartResponse = await fetch(walmartUrl, {
          method: 'GET',
          headers: COMMON_HEADERS,
        });
        
        if (walmartResponse.ok) {
          const walmartData = await walmartResponse.json();
          
          // map API response to standardized Product format
          const walmartProducts = walmartData.map((item: any) => ({
            id: item.productId || `walmart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            thumbnail: item.thumbnail,
            price: typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.price === 'number' ? item.price : 0),
            name: item.name,
            brand: item.brand || 'Walmart',
            store: 'Walmart',
            url: item.productUrl
          }));
          
          // add products to results array
          results.push(...walmartProducts);
        } 
      } catch (error) {
        console.error('Walmart search error:', error);
      }
    }
    
    // search Costco if selected
    if (stores.costco) {
      try {
        // construct API endpoint URL with encoded query
        const costcoUrl = `${API_ENDPOINTS.products.costco}?query=${encodeURIComponent(query)}`;
        const costcoResponse = await fetch(costcoUrl, {
          method: 'GET',
          headers: COMMON_HEADERS,
        });
        
        if (costcoResponse.ok) {
          const costcoData = await costcoResponse.json();
          
          // map API response to standardized Product format
          const costcoProducts = costcoData.map((item: any) => ({
            id: item.productId || `costco-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            thumbnail: item.thumbnail,
            price: typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.price === 'number' ? item.price : 0),
            name: item.name, 
            brand: item.brand || 'Costco',
            store: 'Costco',
            url: item.productUrl
          }));
          
          // add products to results array
          results.push(...costcoProducts);
        }
      } catch (error) {
        console.error('Costco search error:', error);
      }
    }
    
    // search Sam's Club if selected
    if (stores.samsClub) {
      try {
        // construct API endpoint URL with encoded query
        const samsClubUrl = `${API_ENDPOINTS.products.samsClub}?query=${encodeURIComponent(query)}`;
        const samsClubResponse = await fetch(samsClubUrl, {
          method: 'GET',
          headers: COMMON_HEADERS,
        });
        
        if (samsClubResponse.ok) {
          const samsClubData = await samsClubResponse.json();
          
          console.log(`samsClubData: ${JSON.stringify(samsClubData, null, 2)}`);

          // map API response to standardized Product format
          const samsClubProducts = samsClubData.map((item: any) => ({
            id: item.productId || `samsclub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            thumbnail: item.thumbnail,
            price: typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.price === 'number' ? item.price : 0),
            name: item.name,
            brand: item.brand || "Sam's Club",
            store: "Sam's Club",
            url: item.productUrl
          }));
          
          console.log(`samsClubResponse mapped: ${samsClubProducts[0].name} ${samsClubProducts[0].url}`);
          // add products to results array
          results.push(...samsClubProducts);
        } 
      } catch (error) {
        console.error("Sam's Club search error:", error);
      }
    }
    
    // sort all results by price before returning
    return results.sort((a, b) => a.price - b.price);
  } catch (error) {
    console.error('Search products error:', error);
    return [];
  }
};

// search for products using a barcode
export const getProductByBarcode = async (barcode: string, stores: Stores = { walmart: true, target: true, costco: true, samsClub: true }) => {
  if (!barcode || typeof barcode !== 'string' || barcode.trim() === '') {
    console.warn('getProductByBarcode called with invalid barcode');
    return [];
  }
  
  try {
    const cleanBarcode = barcode.trim();
    console.log(`Looking up products for barcode: ${cleanBarcode}`);
    
    // use the standard searchProducts function with the barcode as the query
    return await searchProducts(cleanBarcode, stores);
  } catch (error) {
    console.error('Error in getProductByBarcode:', error);
    return [];
  }
};