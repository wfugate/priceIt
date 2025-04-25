import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from './context/AuthContext';
import { router } from 'expo-router'; 


console.log("🧪 Login screen loaded");
export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
        console.log('🔑 Attempting login with:', email);
        await login(email, password);
    } catch (err: any) {
        console.error('❌ Login error:', err);
      Alert.alert('Error', err.message || 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />


      <TouchableOpacity onPress={() => router.replace('/signup')}>
        <Text style={styles.link}>Don't have an account? Sign Up Here</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderBottomWidth: 1, marginBottom: 15, fontSize: 16 },
  link: { marginTop: 20, textAlign: 'center', color: 'blue' }
});