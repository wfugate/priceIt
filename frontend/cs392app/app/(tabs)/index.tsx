import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import axios from 'axios';
import { useEffect } from 'react';
import { AxiosError } from 'axios';

export default function TabOneScreen() {

  const testConnection = async () => {
    try {
      const response = await axios.get(
        'https://4c21-128-197-28-168.ngrok-free.app/api/ImageProcessing/test',
        { timeout: 5000 } // 5 second timeout
      );
      console.log('Connection test success:', response.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('API Error:', {
        message: axiosError.message,
        code: axiosError.code,
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        timeout: axiosError.config?.timeout,
        response: axiosError.response?.data
      });
      
    }
  };
  
  // Call this when your app loads
  useEffect(() => {
    testConnection();
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Page</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
