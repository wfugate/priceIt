// // components/home/DraggableItem.tsx
// import React from 'react';
// import { 
//   StyleSheet, 
//   View, 
//   Text, 
//   Image, 
//   TouchableOpacity, 
//   Animated,
//   PanResponder
// } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';

// interface Product {
//   productId: string;
//   thumbnail: string;
//   price: number;
//   name: string;
//   brand: string;
//   quantity?: number;
// }

// interface DraggableItemProps {
//   product: Product;
//   onMove: () => void;
//   direction: 'left' | 'right';
// }

// const DraggableItem: React.FC<DraggableItemProps> = ({
//   product,
//   onMove,
//   direction
// }) => {
//   // Create animated position value
//   const pan = React.useRef(new Animated.ValueXY()).current;
  
//   // Threshold distance to trigger the move
//   const moveThreshold = 100;
  
//   // Setup the panResponder
//   const panResponder = React.useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderGrant: () => {
//         pan.setOffset({
//           x: pan.x._value,
//           y: pan.y._value
//         });
//       },
//       onPanResponderMove: Animated.event(
//         [null, { dx: pan.x, dy: pan.y }],
//         { useNativeDriver: false }
//       ),
//       onPanResponderRelease: (_, gestureState) => {
//         // Reset offset
//         pan.flattenOffset();
        
//         // Check if dragged far enough in the correct direction
//         if ((direction === 'right' && gestureState.dx > moveThreshold) || 
//             (direction === 'left' && gestureState.dx < -moveThreshold)) {
//           // Execute the move function
//           onMove();
          
//           // Animate back to start
//           Animated.spring(pan, {
//             toValue: { x: 0, y: 0 },
//             useNativeDriver: false,
//             bounciness: 10
//           }).start();
//         } else {
//           // Not far enough, go back to start
//           Animated.spring(pan, {
//             toValue: { x: 0, y: 0 },
//             useNativeDriver: false,
//             friction: 5
//           }).start();
//         }
//       }
//     })
//   ).current;

//   return (
//     <Animated.View
//       style={[
//         styles.container,
//         { transform: [{ translateX: pan.x }, { translateY: pan.y }] }
//       ]}
//       {...panResponder.panHandlers}
//     >
//       <View style={styles.storeLabel}>
//         <Text style={styles.storeLabelText}>
//           {direction === 'right' ? 'Target' : 'Walmart'}
//         </Text>
//       </View>
      
//       <Image 
//         source={{ uri: product.thumbnail || 'https://via.placeholder.com/80' }}
//         style={styles.productImage}
//         resizeMode="contain"
//       />
      
//       <View style={styles.productInfo}>
//         <Text style={styles.productName} numberOfLines={2}>
//           {product.name}
//         </Text>
//         <Text style={styles.productBrand}>
//           {product.brand}
//         </Text>
//         <Text style={styles.productPrice}>
//           ${product.price.toFixed(2)}
//         </Text>
//       </View>
      
//       <TouchableOpacity style={styles.dragHandle} onPress={onMove}>
//         <FontAwesome 
//           name={direction === 'right' ? 'chevron-right' : 'chevron-left'} 
//           size={16} 
//           color="#666" 
//         />
//       </TouchableOpacity>
//     </Animated.View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     borderRadius: 8,
//     marginVertical: 5,
//     padding: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   storeLabel: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     borderTopLeftRadius: 8,
//     borderBottomRightRadius: 8,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//   },
//   storeLabelText: {
//     color: 'white',
//     fontSize: 10,
//   },
//   productImage: {
//     width: 50,
//     height: 50,
//     marginRight: 10,
//     backgroundColor: '#f9f9f9',
//     borderRadius: 4,
//   },
//   productInfo: {
//     flex: 1,
//   },
//   productName: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   productBrand: {
//     fontSize: 12,
//     color: '#666',
//     marginVertical: 2,
//   },
//   productPrice: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#e63b60',
//   },
//   dragHandle: {
//     padding: 10,
//   },
// });

// export default DraggableItem;