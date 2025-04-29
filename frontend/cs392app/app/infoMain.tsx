import React, { useState } from 'react';
import { Platform,View, SafeAreaView, TextInput, Text, Image, TouchableWithoutFeedback, Keyboard,TouchableOpacity, StyleSheet, Alert } from 'react-native';

import { useAuth } from './context/AuthContext';  
import { useRouter } from 'expo-router';
import { useProfile } from './context/ProfileContxt';


const Wrapper = Platform.OS === 'web' ? React.Fragment : TouchableWithoutFeedback;


export default function SetInfoScreenMain() {
  const { user, updateProfile } = useAuth();
  const { handleImagePick } = useProfile();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || '');

  const router = useRouter();

  const handleSave = async () => {
    try {
      if (!name || !age) {
        Alert.alert('Error', 'Please fill in both fields');
        return;
      }

      if (age.includes('.')) {
        Alert.alert('Invalid Input', 'The period (.) is not allowed.');
        return;
      } 

      await updateProfile(name, age);
      Alert.alert('Success', 'Profile setting up successfully!');
      router.push('/');
    } catch (error) {
      
      Alert.alert('Error', 'Failed to setting up profile');
    }
  };

  const handleDoLater = async () => {
      router.push('/');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Wrapper {...(Platform.OS === 'web' ? {} : { onPress: Keyboard.dismiss, accessible: false })}>
        <View style={styles.container}>
  
          {/* Header with Welcome To and Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>  
              <Image 
                source={require('./logo/priceIt_Welcome.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
  
          {/* Main content */}
          <View style={styles.content}>
            <Text style={styles.title}> Your Profile</Text>
  
            <TextInput
              placeholder="Name"
              placeholderTextColor="#ddd"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Age"
              placeholderTextColor="#ddd"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              style={styles.input}
            />

            <TouchableOpacity style={styles.profileButton} onPress={handleImagePick}>
              <Text style={styles.buttonText}>Set Profile Picture</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
  
          {/* Do Later button at the bottom */}
          <View>
            <TouchableOpacity style={styles.doLaterButton} onPress={handleDoLater}>
              <Text style={styles.doLaterText}>Do later</Text>
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
    marginTop: 10,
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
    width: '220%', 
    height: '220%', 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'rgba(0, 255, 255, 0.07)',
    borderBottomWidth: 1,
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
  profileButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 15,
    borderRadius: 50,
    marginLeft:50,
    marginRight:50,

    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 15,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  doLaterButton: {
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  doLaterText: {
    color: 'white',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
