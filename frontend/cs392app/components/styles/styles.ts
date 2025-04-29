import { StyleSheet } from 'react-native';

// Updated styles for cameraStyles in styles.ts - for CameraControls.tsx
export const cameraStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A1D96', // Deep royal purple
    padding: 0,
    margin: 0,
  },
  camera: {
    flex: 0.80,
    width: '100%',
  },
  bottomContainer: {
    flex: 0.20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: '#4A1D96', // Deep royal purple
  },
  submitContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: 'transparent', // Transparent
  },
  buttonContainer: {
    padding: 0,
    alignItems: 'center',
    flexDirection: 'row',
    width: '80%',
    backgroundColor: 'transparent', // Transparent
  },
  button: {
    backgroundColor: '#F59E0B', // Yellow/orange button
    padding: 14,
    borderRadius: 5,
    width: '80%',
    marginBottom: 20,
    alignItems: 'center'
  },
  buttontwo: {
    backgroundColor: '#F59E0B', // Yellow/orange button
    padding: 14,
    borderRadius: 5,
    marginBottom: 10,
    width: '30%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    alignItems: 'center',
  },
  scannedText: {
    fontWeight: "bold",
    fontSize: 24,
    color: 'white'
  },
  resultText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
  },
});