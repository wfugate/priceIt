// app/types.ts
export interface Product {
    id: string;
    thumbnail: string;
    price: number;
    name: string;
    brand: string;
    url: string;
    store: string;
    relevanceScore?: number;
    selected?: boolean;
    quantity?: number;
    
    //needs a feilds called, url
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
    productUrl: string;
}

export default function removeWarning(){}