// app/context/ScanContext.tsx
import React, { createContext, useState } from 'react';
interface Product {
    id: string; // We'll generate this
    imageUrl: string;
    price: string;
    title: string;
    selected?: boolean; // For UI selection state
  }
export const ScanContext = createContext({
  showResults: false,
  setShowResults: (show: boolean) => {},
  products: [] as Product[],
  setProducts: (products: Product[]) => {}
});

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [showResults, setShowResults] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  return (
    <ScanContext.Provider value={{ showResults, setShowResults, products, setProducts }}>
      {children}
    </ScanContext.Provider>
  );
}