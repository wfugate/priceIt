import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

import {API_BASE_URL} from '../config/apiConfig'




type User = {
    UserId: string;
    email: string;
    name?: string | null;
    age?: string | null;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateProfile: (name: string, age: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


// const SESSION_TIMEOUT_MS = 1 * 60 * 1000; // 30 minutes
// let timeoutHandle: NodeJS.Timeout;

// // Function to start the session timer
// const resetSessionTimer = (logout: () => void) => {
//     clearTimeout(timeoutHandle);
//     timeoutHandle = setTimeout(() => {
//       console.log('⏳ Session expired. Logging out...');
//       logout();
//     }, SESSION_TIMEOUT_MS);
//   };
  
// Function to set up activity listeners
// const setupActivityListeners = (logout: () => void) => {
//     const resetTimer = () => resetSessionTimer(logout);

//     // Listen for user activity (touch or keyboard events)
//     const events = ['mousemove', 'touchstart', 'keydown'];
//     events.forEach(event => {
//         window.addEventListener(event, resetTimer);
// });

// return () => {
//     // Cleanup event listeners on component unmount
//     events.forEach(event => {
//     window.removeEventListener(event, resetTimer);
//     });
// };
// };
  


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');

        if (storedUser) {

          const parsed: User = JSON.parse(storedUser);
          console.log('Stored User:', parsed);
      
          setUser(parsed);
          //resetSessionTimer(logout); // Start session timer when user is loaded
        } else {

          setUser(null);
        }
      } catch (error) {

        console.error('Error loading user:', error);
        setUser(null);

      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Add activity listeners when the user is logged in
//   useEffect(() => {
//     if (user) {
//       // Set up activity listeners and reset the session timer on activity
//       const cleanupListeners = setupActivityListeners(logout);

//       // Clean up listeners when the component is unmounted
//       return () => {
//         cleanupListeners();
//       };
//     }
//   }, [user]);

  const updateProfile = async (name: string, age: string) => {
    try {
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
        if (user){
            const updatedUser = { ...user, name, age };
            setUser(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }} catch (error: any) {
        console.error('Profile update error:', error);
        throw error;
    }
  };



  const login = async (email: string, password: string) => {
    try {
      if ((!email || email.trim() === "") || (!password || password.trim() === ""))
        {
          console.log("Email or Password is blank")
          Alert.alert("Invalid","Blank email or password");
          return
        }

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();

        console.log('Bad Request:', errorData.message || errorData);
        Alert.alert("Error", errorData.message || 'Something went wrong');
        
        return;
      }

      const userData = await res.json();

      const tempData = {
        UserId: userData.id,
        email: userData.email,
        name: userData.name,
        age: userData.age
        }

      setUser(tempData);
      await AsyncStorage.setItem('user', JSON.stringify(tempData));
      
      //resetSessionTimer(logout); // Start session timer on login

      
      router.replace('/'); // Normal flow into index page
      
    
      return;
      
    } catch (error: any) {
      Alert.alert("Server Error", 'The server is most likely down.\nPlease turn the backend on and check if the ngrok link is matching.');
    }
  };

  const signup = async (email: string, password: string) => {
    try {

      if ((!email || email.trim() === "") || (!password || password.trim() === ""))
        {
          console.log("Email or Password is blank")
          Alert.alert("Invalid", "Blank email or password");
          return
        }

      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        
        console.log('Bad Request:', errorData.message || errorData);
        Alert.alert("Error", errorData.message || 'Something went wrong');
        
        return;
      }

      const userData = await res.json();

      const tempData = {
        UserId: userData.id,
        email: userData.email,
        name: userData.name,
        age: userData.age
      };

      setUser(tempData);

      await AsyncStorage.setItem('user', JSON.stringify(tempData));
      
      console.log('Signup successful, redirecting to Main info page');
      
      //resetSessionTimer(logout); // Start session timer on signup

      if (!tempData.name || !tempData.age) {
        router.replace('../infoMain'); // <-- Go to the info page
      } else {
        router.replace('/'); // <-- Normal flow
      }
      return;
    } catch (error: any) {
      Alert.alert("Server Error", 'The server is most likely down.\nPlease turn the backend on and check if the ngrok link is matching.');
     
    }
  };

  const logout = async () => {
    //clearTimeout(timeoutHandle); 
    setUser(null);
    await AsyncStorage.removeItem('user')
    await AsyncStorage.removeItem(`@profileImageUri:${user?.UserId}`);;
    router.replace('../login');
    return;
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, updateProfile  }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};