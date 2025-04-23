// // hooks/useUserCarts.ts
// import { useEffect, useState } from 'react';
// import { getUserCarts, createNewUserCart } from '../services/scanService';

// interface Cart {
//   _id: string; // MongoDB ID
//   userId: string;
//   products: any[]; // Adjust this type based on your product structure
//   createdAt?: string;
// }

// export const useUserCarts = (userId: string) => {
//   const [carts, setCarts] = useState<Cart[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchCarts = async () => {
//     if (!userId) return;
    
//     setLoading(true);
//     try {
//       const userCarts = await getUserCarts(userId);
//       setCarts(userCarts);
//     } catch (err) {
//       setError('Failed to fetch carts');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createNewCart = async (): Promise<Cart> => {
//     try {
//       // This will be implemented in the service
//       const newCart = await createNewUserCart(userId);
//       setCarts(prev => [...prev, newCart]);
//       return newCart;
//     } catch (err) {
//       console.error(err);
//       throw err;
//     }
//   };

//   useEffect(() => {
//     fetchCarts();
//   }, [userId]);

//   return { carts, loading, error, refetch: fetchCarts, createNewCart };
// };


export default function removeWarning(){}