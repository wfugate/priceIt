import React, { useState, useRef, useEffect } from 'react';
import { Platform, View, TouchableWithoutFeedback, Image, TextInput, Text, StyleSheet, TouchableOpacity, Keyboard, Animated, Alert } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './context/AuthContext';
import { router } from 'expo-router'; 
import { SafeAreaView } from 'react-native-safe-area-context';


//https://docs.expo.dev/versions/latest/sdk/video-av/
// I know it's depreciated, but after readin its documentation and
// playing around with expo-video and trying to use
// it to create a loading scree, I realize I couldn't close the video palyer
// so i'm defaulting to video-av instead after going through its documentation 
const Wrapper = Platform.OS === 'web' ? React.Fragment : TouchableWithoutFeedback;

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleLoginPress = () => {

    if (loading) return;

    if (email.length == 0){
      Alert.alert("Email Error","Email field is empty")
      return
    }
    else if (password.length ==0){
      Alert.alert("Password Error", "Password field is empty")
      return
    }

    setLoading(true);
    fadeIn(); // Start the fade-in animation
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setLoading(false);
    });
  };

  const handleVideoReady = async () => {
    //setVideoReady(true);
    setTimeout(async () => {
      try {
        
          await login(email, password);
          await AsyncStorage.setItem('@justLoggedIn', 'true');
        
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Login failed');
      } finally {
        fadeOut(); // Start fade-out after login attempt
      }
    }, 900); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Wrapper {...(Platform.OS === 'web' ? {} : { onPress: Keyboard.dismiss, accessible: false })}>
        <View style={{ flex: 1 }}>
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
              onPress={handleLoginPress}
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

          {/* Loading video overlay */}
          {loading && (
            <Animated.View style={[styles.loadingOverlay, { opacity: fadeAnim }]}>
              <Video
                source={require('./logo/priceIt_test2.mp4')}
                style={[styles.loadingVideo]}
                shouldPlay
                isLooping={true} 
                resizeMode={ResizeMode.COVER}
                isMuted
                onReadyForDisplay={handleVideoReady}
              />
            </Animated.View>
          )}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#7851A9', 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingVideo: {
    width: '100%',
    height: '100%',
  },
});
