// app/hooks/useStoreSettings.ts
import { useState } from 'react';
import { Stores } from '../types';

export function useStoreSettings(initialStores?: Stores) {
  const [stores, setStores] = useState<Stores>(initialStores || {
    walmart: true,
    target: true,
    costco: true,
    samsClub: true
  });

  const [showStoreSettings, setShowStoreSettings] = useState(false);

  const toggleStore = (store: keyof Stores) => {
    setStores(prev => ({
      ...prev,
      [store]: !prev[store]
    }));
  };

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