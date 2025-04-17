// components/camera/CameraControls.tsx
import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { cameraStyles } from '../styles/styles';
import { FontAwesome } from '@expo/vector-icons';

interface Props {
  onCapture: () => void;
  onSubmit: (query: string) => void;
  loadingCapture: boolean;
  loadingSubmit: boolean;
  scanMode: 'image' | 'barcode'; // Added scanMode property
}

export default function CameraControls({
  onCapture,
  onSubmit,
  loadingCapture,
  loadingSubmit,
  scanMode
}: Props) {
  return (
    <View style={cameraStyles.bottomContainer}>
      {scanMode === 'image' && (
        <>
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
        </>
      )}
      
      {scanMode === 'barcode' && (
        <View style={{ alignItems: 'center' }}>
          <Text>
            Position barcode in the center of the screen
          </Text>
          {loadingCapture && (
            <ActivityIndicator color="white" size="large" style={{ marginTop: 10 }} />
          )}
        </View>
      )}
    </View>
  );
}