import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

import {API_BASE_URL} from '../config/apiConfig'

// user type definition
type User = {
    UserId: string;
    email: string;
    name?: string | null;
    age?: string | null;
};

// authentication context type definition
type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateProfile: (name: string, age: string) => Promise<void>;
};

// create context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// auth provider component to manage authentication state
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // state to store user data and loading status
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // load saved user from storage on component mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');

        if (storedUser) {
          // parse stored user JSON data
          const parsed: User = JSON.parse(storedUser);
          console.log('Stored User:', parsed);
      
          setUser(parsed);
        } else {
          // no user found in storage
          setUser(null);
        }
      } catch (error) {
        // handle error in loading user data
        console.error('Error loading user:', error);
        setUser(null);
      } finally {
        // update loading state when user data loading completes
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // function to update user profile information
  const updateProfile = async (name: string, age: string) => {
    try {
        // validate name length
        if (name.length > 30){
          Alert.alert("Name Too Long", "Name can only be 30 characters long.")
          return;
        }

        // make API request to update profile
        const res = await fetch(`${API_BASE_URL}/auth/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            email: user?.email,
            name,
            age,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text().catch(() => '');
            throw new Error(`Profile update failed: ${errorText || res.statusText}`);
        }
        
        // update local user state and storage with updated information
        if (user){
            const updatedUser = { ...user, name, age };
            setUser(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }
    } catch (error: any) {
        console.error('Profile update error:', error);
        throw error;
    }
  };

  // function to handle user login
  const login = async (email: string, password: string) => {
    try {
      // validate input data
      if ((!email || email.trim() === "") || (!password || password.trim() === ""))
        {
          console.log("Email or Password is blank")
          Alert.alert("Invalid","Blank email or password");
          return
        }

      // send login request to API
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // display error message to user
        console.log('Bad Request:', errorData.message || errorData);
        Alert.alert("Error", errorData.message || 'Something went wrong');
        
        return;
      }

      // parse user data from response
      const userData = await res.json();

      // format user data for state
      const tempData = {
        UserId: userData.id,
        email: userData.email,
        name: userData.name,
        age: userData.age
      }

      // update state and storage with user data
      setUser(tempData);
      await AsyncStorage.setItem('user', JSON.stringify(tempData));
      
      // navigate to main app screen
      router.replace('/');
      
      return;
      
    } catch (error: any) {
      Alert.alert("Server Error", 'The server is most likely down.\nPlease turn the backend on and check if the ngrok link is matching.');
    }
  };

  // function to handle user signup
  const signup = async (email: string, password: string) => {
    try {
      // validate input data
      if ((!email || email.trim() === "") || (!password || password.trim() === ""))
        {
          console.log("Email or Password is blank")
          Alert.alert("Invalid", "Blank email or password");
          return
        }

      // send signup request to API
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // display error message to user
        console.log('Bad Request:', errorData.message || errorData);
        Alert.alert("Error", errorData.message || 'Something went wrong');
        
        return;
      }

      // parse user data from response
      const userData = await res.json();

      // format user data for state
      const tempData = {
        UserId: userData.id,
        email: userData.email,
        name: userData.name,
        age: userData.age
      };

      // update state with user data
      setUser(tempData);

      // save user data to storage
      await AsyncStorage.setItem('user', JSON.stringify(tempData));
      
      console.log('Signup successful, redirecting to Main info page');
      
      // redirect to correct page based on user profile completeness
      if (!tempData.name || !tempData.age) {
        router.replace('../infoMain'); // go to profile completion page
      } else {
        router.replace('/'); // go to main app screen
      }
      return;
    } catch (error: any) {
      Alert.alert("Server Error", 'The server is most likely down.\nPlease turn the backend on and check if the ngrok link is matching.');
     
    }
  };

  // function to handle user logout
  const logout = async () => {
    // clear user data from state
    setUser(null);
    // remove user data from storage
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem(`@profileImageUri:${user?.UserId}`);
    // navigate to login screen
    router.replace('../login');
    return;
  };

  // provide auth context to child components
  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, updateProfile  }}>
      {children}
    </AuthContext.Provider>
  );
};

// hook to access auth context in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};