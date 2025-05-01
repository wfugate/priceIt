import React, { useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video, ResizeMode } from 'expo-av';
import { Platform, View, Image, SafeAreaView, TextInput, Keyboard, Text, StyleSheet, Animated, Alert, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useAuth } from './context/AuthContext';
import { router } from 'expo-router'; 


const Wrapper = Platform.OS === 'web' ? React.Fragment : TouchableWithoutFeedback;

// signup screen component for user registration
export default function SignupScreen() {
  // get signup function from auth context
  const { signup } = useAuth();
  // state for form inputs and loading status
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // loading state for showing animation
  const [loading, setLoading] = useState(false); 
  
  // reference for fade animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // handle signup button press
  const handleSignup = async () => {
    // prevent multiple submits when loading
    if (loading) return;

    // validate input fields
    if (email.length == 0){
      Alert.alert("Email Error","Email field is empty")
      return
    }
    else if (password.length ==0){
      Alert.alert("Password Error", "Password field is empty")
      return
    }
    else if (password.length < 6 ){
      Alert.alert("Password Length", "The password length has to be more than 6 charachters long.")
      return
    }
    else if(password.length >12){
      Alert.alert("Password Length", "The password length cannot excede 12 characters.")
      return
    }
    
    // start loading animation
    setLoading(true);
    fadeIn(); // Start the fade-in animation
  };

  // fade in animation for loading screen
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  // fade out animation for loading screen
  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setLoading(false);
    });
  };

  // function to handle video ready event during loading animation
  const handleVideoReady = async () => {
    //setVideoReady(true);
    setTimeout(async () => {
      try {
        // attempt signup with entered credentials
        await signup(email, password);
        await AsyncStorage.setItem('@justLoggedIn', 'true');
        
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Signup failed');
      } finally {
        fadeOut(); // Start fade-out after signup attempt
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
                  source={require('./logo/priceIt_signup.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>

            <Text style={styles.title}>Sign Up</Text>

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
              onPress={handleSignup} 
              disabled={loading} // Disable when loading
            >
              <Text style={styles.buttonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <View style={styles.bottomLink}>
              <TouchableOpacity onPress={() => router.push('./login')}>
                <Text style={styles.link}>Already have an account? Login Here</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Loading video overlay */}
          {loading && (
            <Animated.View style={[styles.loadingOverlay, { opacity: fadeAnim }]}>
              <Video
                source={require('./logo/priceIt_test2.mp4')}
                style={styles.loadingVideo}
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
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