import React from 'react';
import { View, Text } from 'react-native';
import { cameraStyles } from '../styles/styles';

// component to display the result of a scan operation
export default function ScanResults({ item }: { item: string | null }) {
  return (
    <View>
      <Text style={cameraStyles.resultText}>{item || ''}</Text>
    </View>
  );
}