import { StyleSheet } from 'react-native';

export const cameraStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#223bc9',
        padding: 0,
        margin: 0,
      },
      camera: {
        flex: 0.80,
        width: '100%',
      },
      bottomContainer: {
        flex: 0.20,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      },
      submitContainer: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      },
      buttonContainer: {
        padding: 0,
        alignItems: 'center',
        flexDirection: 'row',
        width: '80%',
      },
      // components/styles/styles.ts
// Add these to your cameraStyles object:

errorContainer: {
  marginVertical: 10,
  paddingHorizontal: 20,
  paddingVertical: 10,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: 5,
  alignSelf: 'center',
},
errorText: {
  color: '#e63b60',
  fontWeight: 'bold',
  textAlign: 'center',
  fontSize: 14,
},
disabledButton: {
  opacity: 0.6,
},
      // Add these to cameraStyles in styles.ts
      fullScreenResults: {
        flex: 1,
        backgroundColor: '#223bc9',
        padding: 20,
      },
      backButton: {
        backgroundColor: '#e63b60',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        alignSelf: 'flex-start',
      },
      resultsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',
      },
      resultsContainer: {
        paddingBottom: 20,
      },
      productCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
      },
      selectedProduct: {
        borderWidth: 2,
        borderColor: '#e63b60',
      },
      productImage: {
        width: 80,
        height: 80,
        borderRadius: 5,
        marginRight: 15,
      },
      productInfo: {
        flex: 1,
        justifyContent: 'center',
      },
      productName: {
        fontSize: 16,
        color: 'white',
        marginBottom: 5,
      },
      productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
      },
      saveButton: {
        marginTop: 20,
        width: '100%',
      },
      button: {
        backgroundColor: '#e63b60',
        padding: 14,
        borderRadius: 5,
        width: '80%',
        marginBottom: 20,
        alignItems: 'center'
      },
      buttontwo: {
        backgroundColor: '#e63b60',
        padding: 14,
        borderRadius: 5,
        marginBottom: 10,
        width: '30%',
        alignItems: 'center',
      },
      flipButton: {
        position: 'absolute',
        right: 20,
        top: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 5,
      },
      buttonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
        alignItems: 'center',
      },
      scannedText:{
        fontWeight: "bold",
        fontSize: 24,
        color: 'white'
      },
      result: {
        backgroundColor: '#0000',
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
      },
      resultText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
      },

});

// app/components/styles/styles.ts
// import { StyleSheet } from 'react-native';

// export const cameraStyles = StyleSheet.create({
//   // Original styles
//   container: {
//     flex: 1,
//     backgroundColor: '#223bc9',
//     padding: 0,
//     margin: 0,
//   },
//   camera: {
//     flex: 0.80,
//     width: '100%',
//   },
//   bottomContainer: {
//     flex: 0.20,
//     padding: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'column'
//   },
//   buttonContainer: {
//     padding: 0,
//     alignItems: 'center',
//     flexDirection: 'row',
//     width: '80%',
//   },
//   button: {
//     backgroundColor: '#e63b60',
//     padding: 14,
//     borderRadius: 5,
//     width: '80%',
//     marginBottom: 20,
//     alignItems: 'center'
//   },
//   buttontwo: {
//     backgroundColor: '#e63b60',
//     padding: 14,
//     borderRadius: 5,
//     width: '30%',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   buttonText: {
//     fontSize: 16,
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   resultText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   scannedText: {
//     fontWeight: "bold",
//     fontSize: 24,
//     color: 'white'
//   },

//   // New product results styles
//   fullScreenResults: {
//     flex: 1,
//     backgroundColor: '#223bc9',
//     padding: 20,
//   },
//   productCard: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 15,
//     flexDirection: 'row',
//   },
//   productImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 5,
//     marginRight: 15,
//   },
//   productInfo: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   productName: {
//     fontSize: 16,
//     color: 'white',
//   },
//   productPrice: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: 'white',
//   },
// });