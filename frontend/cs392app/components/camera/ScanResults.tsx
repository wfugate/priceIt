// app/components/camera/ScanResults.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { cameraStyles } from '../styles/styles';

export default function ScanResults({ item }: { item: string | null }) {
  return (
    <View>
      <Text style={cameraStyles.resultText}>{item || ''}</Text>
    </View>
  );
}