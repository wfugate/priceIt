// components/camera/ScanModeToggle.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ScanModeToggleProps {
  mode: 'barcode' | 'image';
  onToggle: (mode: 'barcode' | 'image') => void;
}

export const ScanModeToggle: React.FC<ScanModeToggleProps> = ({ mode, onToggle }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, mode === 'image' && styles.activeButton]} 
        onPress={() => onToggle('image')}
      >
        <Text style={[styles.buttonText, mode === 'image' && styles.activeText]}>
          Image Scan
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, mode === 'barcode' && styles.activeButton]} 
        onPress={() => onToggle('barcode')}
      >
        <Text style={[styles.buttonText, mode === 'barcode' && styles.activeText]}>
          Barcode Scan
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(74, 29, 150, 0.7)', // Semi-transparent deep purple
    borderRadius: 25,
    padding: 5,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#F59E0B', // Yellow/orange for active button
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  activeText: {
    fontWeight: 'bold',
  }
});