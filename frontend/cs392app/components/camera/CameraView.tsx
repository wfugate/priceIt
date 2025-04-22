// components/camera/CameraView.tsx
import React from 'react';
import { CameraView as ExpoCameraView } from 'expo-camera';
import { View } from 'react-native';
import { cameraStyles } from '../styles/styles';

const CameraView = React.forwardRef<ExpoCameraView, {
  onBarCodeScanned?: (result: any) => void;
}>((props, ref) => (
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
    onBarcodeScanned={props.onBarCodeScanned}
  />
));

export default CameraView;