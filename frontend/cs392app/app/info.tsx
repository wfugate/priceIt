import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Keyboard, TouchableWithoutFeedback, TextInput, Platform, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';  
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../config/apiConfig'; 


const Wrapper = Platform.OS === 'web' ? React.Fragment : TouchableWithoutFeedback;


export default function SetInfoScreen() {
  const { user, updateProfile } = useAuth(); // Accessing the updateProfile function in AuthContext
  const [name, setName] = useState(user?.name || ''); // Default to user's current name
  const [age, setAge] = useState(user?.age || ''); // Default to user's current age

  const router = useRouter();

  // Converting age to a string for TextInput field
  useEffect(() => {
    if (user?.age) {
      setAge(user.age.toString()); 
    }
  }, [user?.age]);
  

  const handleSave = async () => {
    try {
      // Ensure name and age are set
      if (!name || !age) {
        Alert.alert('Error', 'Please fill in both fields');
        return;
      }

      if (age.includes('.')) {
        Alert.alert('Invalid Input', 'The period (.) is not allowed.');
        return;
      } 
      

      // Send the data to the backend to update the profile
      await updateProfile(name, age);
      Alert.alert('Success', 'Profile updated successfully!');

      router.push('/');
      return;
    } catch (error) {
      
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  const handleDelete = () => {
  
    const confirmDelete = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/delete/${user?.UserId}`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          return;
        }
  
        await AsyncStorage.removeItem('user');
        router.push('./login');
      } catch (error) {
        
        Platform.OS === 'web'
          ? window.alert('Failed to delete account')
          : Alert.alert('Error', 'Failed to delete account');
      }
    };
  
    if (Platform.OS === 'web') {
      // Use native browser confirm dialog
      const confirmed = window.confirm(
        'Are you sure you want to permanently delete your account? This cannot be undone.'
      );
      if (confirmed) confirmDelete();
    } else {
      // Use native mobile alert
      Alert.alert(
        'Delete Account',
        'Are you sure you want to permanently delete your account? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes, Delete', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };
  
  
  
  return (
    <Wrapper {...(Platform.OS === 'web' ? {} : { onPress: Keyboard.dismiss, accessible: false })}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Complete Your Profile</Text>
  
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
  
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
  
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
  
          <View style={styles.deleteButtonWrapper}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Wrapper>
  );
  
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#7851A9',
  },
  // container: {
  //   flex: 1,
  //   paddingHorizontal: 20,
  // },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    marginTop: 200,
    backgroundColor: '#7851A9', // royal purple
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom:50,
    marginLeft:20,
    marginRight:20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#DC2626', 
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 200,
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButtonWrapper: {
    paddingBottom: 100,
  },
});
