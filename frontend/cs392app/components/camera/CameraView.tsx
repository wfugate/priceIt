// components/camera/CameraView.tsx
import React from 'react';
import { CameraView as ExpoCameraView, BarcodeScanningResult } from 'expo-camera';
import { View, TouchableOpacity, Text } from 'react-native';
import { cameraStyles } from '../styles/styles';

interface CameraViewProps {
  onBarCodeScanned?: (result: BarcodeScanningResult) => void;
}

const CameraView = React.forwardRef<ExpoCameraView, CameraViewProps>(
  ({ onBarCodeScanned }, ref) => (
    <ExpoCameraView 
      style={cameraStyles.camera} 
      facing="back" 
      ref={ref}
      barcodeScannerSettings={{
        barcodeTypes: [
          'aztec',
          'codabar',
          'code39',
          'code93',
          'code128',
          'datamatrix',
          'ean13',
          'ean8',
          'itf14',
          'pdf417',
          'upc_a',
          'upc_e',
          'qr'
        ]
      }}
      onBarcodeScanned={onBarCodeScanned}
    />
  )
);

export default CameraView;