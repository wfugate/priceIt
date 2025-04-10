// app/components/camera/CameraView.tsx
import React from 'react';
import { CameraView, CameraCapturedPicture } from 'expo-camera';
import { View, TouchableOpacity, Text } from 'react-native';
import { cameraStyles } from '../styles/styles';

export default React.forwardRef<CameraView, {
  facing: 'back' | 'front';
  onFlip: () => void;
}>(({ facing, onFlip }, ref) => (
  <CameraView style={cameraStyles.camera} facing={facing} ref={ref}>
    <TouchableOpacity onPress={onFlip}>
      <Text style={cameraStyles.buttonText}>Flip</Text>
    </TouchableOpacity>
  </CameraView>
));