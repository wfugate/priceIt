// app/components/camera/CameraControls.tsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { cameraStyles } from '../styles/styles';

interface Props {
  onCapture: () => void;
  onSubmit: () => void; // Updated to match expected function signature
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
        onPress={onSubmit} // Now simply calls onSubmit with no parameters
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