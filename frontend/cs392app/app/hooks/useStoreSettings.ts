import { useState } from 'react';
import { Stores } from '../types';

// hook for managing store selection settings
export function useStoreSettings(initialStores?: Stores) {
  // state for tracking which stores are enabled for product searches
  const [stores, setStores] = useState<Stores>(initialStores || {
    walmart: true,
    target: true,
    costco: true,
    samsClub: true
  });

  // state for controlling store settings modal visibility
  const [showStoreSettings, setShowStoreSettings] = useState(false);

  // toggle enable/disable status for a specific store
  const toggleStore = (store: keyof Stores) => {
    setStores(prev => ({
      ...prev,
      [store]: !prev[store]
    }));
  };

  // toggle visibility of the store settings modal
  const toggleStoreSettings = () => {
    setShowStoreSettings(!showStoreSettings);
  };

  return {
    stores,
    showStoreSettings,
    toggleStore,
    toggleStoreSettings
  };
}