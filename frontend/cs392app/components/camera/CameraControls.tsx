import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { cameraStyles } from '../styles/styles';

// interface for camera controls props
interface Props {
  onCapture: () => void;
  onSubmit: () => void; 
  loadingCapture: boolean;
  loadingSubmit: boolean;
  scanMode: 'image' | 'barcode';
}

// camera controls component with different UI based on scan mode
export default function CameraControls({
  onCapture,
  onSubmit,
  loadingCapture,
  loadingSubmit,
  scanMode
}: Props) {
  // only render controls for image scan mode
  if (scanMode === 'image') {
    return (
      <View style={cameraStyles.bottomContainer}>
        <TouchableOpacity 
          style={cameraStyles.button} 
          onPress={onSubmit}
          disabled={loadingCapture || loadingSubmit}
        >
          {loadingSubmit ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={cameraStyles.buttonText}>Submit</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={cameraStyles.button} 
          onPress={onCapture}
          disabled={loadingCapture || loadingSubmit}
        >
          {loadingCapture ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={cameraStyles.buttonText}>Capture</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  } 
  // render barcode scanner status indicator for barcode scan mode
  else if (scanMode === 'barcode') {
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
  
  // fallback empty view if no scan mode matches
  return <View style={cameraStyles.bottomContainer} />;
}