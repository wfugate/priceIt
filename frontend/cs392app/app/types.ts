// app/types.ts
export interface Product {
    id: string;
    thumbnail: string;
    price: number;
    name: string;
    brand: string;
    store: string;
    relevanceScore?: number;
    selected?: boolean;
}
  
export interface Cart {
    id: string;
    name: string;
    userId: string;
    products: any[];
    createdAt?: string;
}
  
export interface Stores {
    walmart: boolean;
    target: boolean;
    costco: boolean;
    samsClub: boolean;
}
  
export interface CartProduct {
    productId: string;
    thumbnail: string;
    price: number;
    name: string;
    brand: string;
    store: string;
    quantity?: number;
}