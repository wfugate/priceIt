import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform, View, TouchableWithoutFeedback, Image, TextInput, Text, StyleSheet, TouchableOpacity, Keyboard, KeyboardAvoidingView, Alert } from 'react-native';
import { useAuth } from './context/AuthContext';
import { router } from 'expo-router'; 
import { SafeAreaView } from 'react-native-safe-area-context';

const Wrapper = Platform.OS === 'web' ? React.Fragment : TouchableWithoutFeedback;

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // NEW

  const handleLogin = async () => {
    if (loading) return; // prevent double taps
    setLoading(true);
    try {
      
      await login(email, password);
      await AsyncStorage.setItem('@justLoggedIn', 'true');
    } catch (err: any) {
      
      Alert.alert('Error', err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Wrapper {...(Platform.OS === 'web' ? {} : { onPress: Keyboard.dismiss, accessible: false })}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('./logo/priceIt_login.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.title}>Login</Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#ddd"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#ddd"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.6 }]} 
            onPress={handleLogin} 
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Logging In...' : 'Login'}</Text>
          </TouchableOpacity>

          <View style={styles.bottomLink}>
            <TouchableOpacity onPress={() => router.push('./signup')}>
              <Text style={styles.link}>Don't have an account? Sign Up Here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Wrapper>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#7851A9',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  header: {
    marginTop: 70,
    alignItems: 'center',
    marginBottom: 0,
  },
  logoContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '200%',  
    height: '200%', 
  },
  input: {
    backgroundColor: 'rgba(0, 255, 255, 0.07)',
    borderBottomWidth: 2,
    paddingHorizontal:15,
    borderBottomColor: '#ccc',
    marginBottom: 50,
    marginLeft: 10,
    marginRight: 10,
    height: 40,
    fontSize: 16,
    color: 'white',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginLeft:10,
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomLink: {
    marginBottom: 20,
    alignItems: 'center',
  },
  link: {
    marginTop: 50,
    textAlign: 'center',
    color: '#F59E0B',
    fontWeight: '500',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },

});