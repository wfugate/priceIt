// // app/hooks/useModalManagement.ts
// import { useState } from 'react';
// import { Share, Alert } from 'react-native';
// import { Cart } from '../types';

// export function useModalManagement() {
//   const [compareModalVisible, setCompareModalVisible] = useState(false);
//   const [shareModalVisible, setShareModalVisible] = useState(false);
//   const [inspectModalVisible, setInspectModalVisible] = useState(false);
//   const [selectedCarts, setSelectedCarts] = useState<Cart[]>([]);

//   const handleComparePress = (carts: Cart[]) => {
//     const selected = carts.filter(cart => cart.selected);
    
//     if (selected.length !== 2) {
//       Alert.alert('Selection Error', 'Please select exactly 2 carts to compare.');
//       return;
//     }
    
//     setSelectedCarts(selected);
//     setCompareModalVisible(true);
//   };

//   const handleSharePress = (carts: Cart[]) => {
//     const selected = carts.filter(cart => cart.selected);

//     if (selected.length === 0) {
//       Alert.alert('Selection Error', 'Please select at least one cart to share.');
//       return;
//     }

//     setSelectedCarts(selected);
//     setShareModalVisible(true);
//   };

//   const handleExportPress = async (carts: Cart[]) => {
//     const selected = carts.filter(cart => cart.selected);
    
//     if (selected.length === 0) {
//       Alert.alert('Selection Error', 'Please select at least one cart to export.');
//       return;
//     }
    
//     try {
//       // Generate cart data for sharing
//       const cartData = selected.map(cart => {
//         const totalPrice = cart.products.reduce((sum, product) => sum + product.price, 0);
//         return `${cart.name}: $${totalPrice.toFixed(2)} (${cart.products.length} items)`;
//       }).join('\n\n');
      
//       await Share.share({
//         message: `My Shopping Carts:\n\n${cartData}`,
//         title: 'My Shopping Carts'
//       });
//     } catch (error) {
//       console.error('Error sharing carts:', error);
//       Alert.alert('Error', 'Failed to share carts. Please try again.');
//     }
//   };

//   const showInspectModal = (cart: Cart) => {
//     setSelectedCarts([cart]);
//     setInspectModalVisible(true);
//   };

//   return {
//     compareModalVisible,
//     shareModalVisible,
//     inspectModalVisible,
//     selectedCarts,
//     setCompareModalVisible,
//     setShareModalVisible,
//     setInspectModalVisible,
//     setSelectedCarts,
//     handleComparePress,
//     handleSharePress,
//     handleExportPress,
//     showInspectModal
//   };
// }