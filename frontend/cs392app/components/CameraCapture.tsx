// import React, { useState, useRef } from 'react';
// import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
// import { CameraView, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
// import axios from 'axios';

// export default function CameraCapture() {
//   const [facing, setFacing] = useState<'back' | 'front'>('back');
//   const [permission, requestPermission] = useCameraPermissions();
//   const [loading, setLoading] = useState(false);
//   const [item, setItem] = useState<string | null>("");
//   const cameraRef = useRef<CameraView>(null);

//   if (!permission) {
//     return <View style={styles.container} />;
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text>Need camera permission</Text>
//         <TouchableOpacity onPress={requestPermission}>
//           <Text>Grant Permission</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const captureImage = async () => {
//     if (!cameraRef.current || loading) return;
    
//     setLoading(true);
//     setItem(null);

//     try {
//       const photo: CameraCapturedPicture | undefined = await cameraRef.current.takePictureAsync({
//         quality: 0.8,
//         base64: true,
//         skipProcessing: true
//       });

//       if (!photo?.base64) {
//         throw new Error('Failed to capture photo');
//       }

//       const response = await axios.post(
//         'https://746d-2600-387-f-7818-00-4.ngrok-free.app/api/ImageProcessing/process',
//         { image: `data:image/jpeg;base64,${photo.base64}` },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'ngrok-skip-browser-warning': 'true'
//           },
//           timeout: 30000
//         }
//       );

//       console.log("API Response:", response.data);
//       setItem(response.data.item);
//     } catch (error) {
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleCameraFacing = () => {
//     setFacing(current => (current === 'back' ? 'front' : 'back'));
//   };

//   return (
//     <View style={styles.container}>
//       <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
//         <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
//           <Text style={styles.buttonText}>Flip</Text>
//         </TouchableOpacity>
//       </CameraView>

//       <View style={styles.bottomContainer}>
//         <View style={styles.buttonContainer}>
//         <TouchableOpacity style={styles.buttontwo} onPress={captureImage}>
//           <Text style={styles.buttonText}>Submit</Text>
//         </TouchableOpacity>
//         <View style={styles.submitContainer}>
//         <Text>Item Scanned:</Text>
//         <Text style={styles.resultText}>{item}</Text>
//         </View>

//         </View>
//         <TouchableOpacity style={styles.button} onPress={captureImage}>
//           <Text style={styles.buttonText}>{loading ? 'Loading' : 'Capture'}</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   camera: {
//     flex: 1,
//     width: '100%',
//   },
//   bottomContainer: {
//     padding: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'column'
//   },
//   submitContainer: {
//     padding: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'column'
//   },
//   buttonContainer: {
//     padding: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row'
//   },
//   button: {
//     backgroundColor: 'blue',
//     padding: 20,
//     borderRadius: 5,
//     width: '80%',
//     marginBottom: 4,
//     alignItems: 'center'
//   },
//   buttontwo: {
//     backgroundColor: 'blue',
//     padding: 15,
//     borderRadius: 5,
//     width: '28%',
//     marginBottom: 10,
//     alignItems: 'center',
//   },
//   flipButton: {
//     position: 'absolute',
//     right: 20,
//     top: 20,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     padding: 10,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     alignItems: 'center',
//   },
//   result: {
//     backgroundColor: '#0000',
//     padding: 15,
//     borderRadius: 5,
//     width: '100%',
//     alignItems: 'center',
//   },
//   resultText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//   },
// });
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import axios from 'axios';

export default function CameraCapture() {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<string | null>("");
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Need camera permission</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const captureImage = async () => {
    if (!cameraRef.current || loading) return;
    
    setLoading(true);
    setItem(null);

    try {
      const photo: CameraCapturedPicture | undefined = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: true
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture photo');
      }

      const response = await axios.post(
        'https://746d-2600-387-f-7818-00-4.ngrok-free.app/api/ImageProcessing/process',
        { image: `data:image/jpeg;base64,${photo.base64}` },
        {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          timeout: 30000
        }
      );

      console.log("API Response:", response.data);
      setItem(response.data.item);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
          <Text style={styles.buttonText}>Flip</Text>
        </TouchableOpacity>
      </CameraView>

      <View style={styles.bottomContainer}>
      <Text style={styles.scannedText}>Item</Text>
        <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttontwo} onPress={captureImage}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
        <View style={styles.submitContainer}>
        <Text style={styles.resultText}>{item ? item : ''}</Text>
        </View>

        </View>
        <TouchableOpacity style={styles.button} onPress={captureImage}>
          <Text style={styles.buttonText}>{loading ? 'Loading' : 'Capture'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  submitContainer: {
    padding: 20,
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