import React, { useState } from 'react';
import { View, TextInput, Platform, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './context/AuthContext';  
import { useRouter } from 'expo-router';
import { API_BASE_URL } from './config/apiConfig'; 

export default function SetInfoScreen() {
  const { user, updateProfile } = useAuth(); // Accessing the updateProfile function in AuthContext
  const [name, setName] = useState(user?.name || ''); // Default to user's current name
  const [age, setAge] = useState(user?.age || ''); // Default to user's current age

  const router = useRouter();

  const handleSave = async () => {
    try {
      // Ensure name and age are set
      if (!name || !age) {
        Alert.alert('Error', 'Please fill in both fields');
        return;
      }

      // Send the data to the backend to update the profile
      await updateProfile(name, age);
      Alert.alert('Success', 'Profile updated successfully!');

      router.replace('/');
      return;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    router.replace('/');
  };

  const handleDelete = () => {
    console.log('Delete Button Clicked');
  
    const confirmDelete = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/delete/${user?.UserId}`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to delete account');
        }
  
        await AsyncStorage.removeItem('user');
        router.replace('/login');
      } catch (error) {
        console.error('❌ Error deleting account:', error);
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
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Age"
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

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
      <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderBottomWidth: 1, marginBottom: 15, fontSize: 16 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20},
  cancelButton: { flex: 1, backgroundColor: '#e63b60', paddingVertical: 10, borderRadius: 20, marginRight: 10, alignItems: 'center'},
  saveButton: { flex: 1, backgroundColor: '#e63b60', paddingVertical: 10, borderRadius: 20, marginLeft: 10, alignItems: 'center'},
  buttonText: { color: 'white', fontWeight: 'bold'},
  deleteButton: {backgroundColor: '#e63b60', paddingVertical: 12, borderRadius: 20, marginTop: 40, alignItems: 'center'},
  deleteButtonText: { color: 'white', fontWeight: 'bold'},
  

});
