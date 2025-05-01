import React from 'react';
import { CameraView as ExpoCameraView } from 'expo-camera';
import { cameraStyles } from '../styles/styles';

// camera view component that wraps expo-camera with barcode scanning configuration
const CameraView = React.forwardRef<ExpoCameraView, {
  onBarCodeScanned?: (result: any) => void;
}>((props, ref) => (
  <ExpoCameraView 
    style={cameraStyles.camera} 
    facing="back" 
    ref={ref}
    // barcode scanning configuration with supported barcode types
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