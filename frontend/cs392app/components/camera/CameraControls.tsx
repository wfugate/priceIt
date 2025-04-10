// // app/components/camera/CameraControls.tsx
// import React from 'react';
// import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
// import { cameraStyles } from '../styles/styles';

// interface Props {
//     onCapture: () => void;
//     onSubmit: () => void;
//     loading: boolean;
//   }
// export default function CameraControls({
//     onCapture,
//     onSubmit,
//     loading,
//   }: Props) {
//   return (
//     <View style={cameraStyles.bottomContainer}>
//         <TouchableOpacity style={cameraStyles.button} onPress={onCapture}>
//           <Text style={cameraStyles.buttonText} onPress={onSubmit}>Submit</Text>
//         </TouchableOpacity>
//       <TouchableOpacity 
//         style={cameraStyles.button} 
//         onPress={onCapture}
//         disabled={loading}
//       >
//         <Text style={cameraStyles.buttonText}>
//           {loading ? 'Loading' : 'Capture'}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// app/components/camera/CameraControls.tsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { cameraStyles } from '../styles/styles';

interface Props {
  onCapture: () => void;
  onSubmit: (query: string) => void; // Updated to accept a string parameter
  loadingCapture: boolean;
  loadingSubmit: boolean;
}

export default function CameraControls({
  onCapture,
  onSubmit,
  loadingCapture,
  loadingSubmit
}: Props) {
  return (
    <View style={cameraStyles.bottomContainer}>
      <TouchableOpacity 
        style={cameraStyles.button} 
        onPress={() => onSubmit("")} // Pass empty string or get query from state
        disabled={loadingCapture || loadingSubmit}
      >
        <Text style={cameraStyles.buttonText}>
          {loadingSubmit ? 'Loading' : 'Submit'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={cameraStyles.button} 
        onPress={onCapture}
        disabled={loadingCapture || loadingSubmit}
      >
        <Text style={cameraStyles.buttonText}>
          {loadingCapture ? 'Loading' : 'Capture'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}