// // components/camera/CameraControls.tsx
// import React from 'react';
// import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
// import { cameraStyles } from '../styles/styles';

// interface Props {
//   onCapture: () => void;
//   onSubmit: (query: string) => void;
//   loadingCapture: boolean;
//   loadingSubmit: boolean;
//   isProcessing?: boolean;
// }

// export default function CameraControls({
//   onCapture,
//   onSubmit,
//   loadingCapture,
//   loadingSubmit,
//   isProcessing = false
// }: Props) {
//   // Combine loading and processing states for UI
//   const isButtonDisabled = loadingCapture || loadingSubmit || isProcessing;
  
//   return (
//     <View style={cameraStyles.bottomContainer}>
//       <TouchableOpacity 
//         style={[
//           cameraStyles.button, 
//           isButtonDisabled && cameraStyles.disabledButton
//         ]} 
//         onPress={() => onSubmit("")}
//         disabled={isButtonDisabled}
//       >
//         {loadingSubmit ? (
//           <ActivityIndicator color="white" size="small" />
//         ) : (
//           <Text style={cameraStyles.buttonText}>
//             Submit
//           </Text>
//         )}
//       </TouchableOpacity>
      
//       <TouchableOpacity 
//         style={[
//           cameraStyles.button, 
//           isButtonDisabled && cameraStyles.disabledButton
//         ]} 
//         onPress={onCapture}
//         disabled={isButtonDisabled}
//       >
//         {loadingCapture ? (
//           <ActivityIndicator color="white" size="small" />
//         ) : (
//           <Text style={cameraStyles.buttonText}>
//             {isProcessing ? 'Processing...' : 'Capture'}
//           </Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }
// components/camera/CameraControls.tsx
import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { cameraStyles } from '../styles/styles';

interface Props {
  onCapture: () => void;
  onSubmit: (query: string) => void;
  loadingCapture: boolean;
  loadingSubmit: boolean;
  scanMode: 'image' | 'barcode';
}

export default function CameraControls({
  onCapture,
  onSubmit,
  loadingCapture,
  loadingSubmit,
  scanMode
}: Props) {
  // Only render controls for the active scan mode
  if (scanMode === 'image') {
    return (
      <View style={cameraStyles.bottomContainer}>
        <TouchableOpacity 
          style={cameraStyles.button} 
          onPress={() => onSubmit("")}
          disabled={loadingCapture || loadingSubmit}
        >
          <Text style={cameraStyles.buttonText}>
            {loadingSubmit ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              "Submit"
            )}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={cameraStyles.button} 
          onPress={onCapture}
          disabled={loadingCapture || loadingSubmit}
        >
          <Text style={cameraStyles.buttonText}>
            {loadingCapture ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              "Capture"
            )}
          </Text>
        </TouchableOpacity>
      </View>
    );
  } else if (scanMode === 'barcode') {
    // For barcode mode, only show a status indicator
    return (
      <View style={cameraStyles.bottomContainer}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: 'white', marginBottom: 10 }}>
            Position barcode in the center of the screen
          </Text>
          {loadingCapture && (
            <ActivityIndicator color="white" size="large" style={{ marginTop: 10 }} />
          )}
        </View>
      </View>
    );
  }
  
  // Fallback empty view
  return <View style={cameraStyles.bottomContainer} />;
}