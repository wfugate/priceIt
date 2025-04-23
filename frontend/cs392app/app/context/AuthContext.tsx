import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        console.log('👤 Stored User (raw):', storedUser);

        if (storedUser) {
          const parsed: User = JSON.parse(storedUser);
          console.log('✅ Parsed Stored User:', parsed);
          setUser(parsed);
          //resetSessionTimer(logout); // Start session timer when user is loaded
        } else {
          console.log('❌ No stored user found');
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
            console.error('❌ Profile update error:', error);
            throw error;
        }
    };



  const login = async (email: string, password: string) => {
    try {
      console.log('🔑 Attempting login with:', email, password);

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(`Login failed: ${errorText || res.statusText}`);
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

      if (!tempData.name || !tempData.age) {
        router.replace('../info'); // <-- Go to the info page
      } else {
        router.replace('/'); // <-- Normal flow
      }
    
      return;
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      console.log('📨 Attempting signup with:', email);

      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(`Signup failed: ${errorText || res.statusText}`);
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
      console.log('✅ Signup successful, redirecting to home');
      console.log('🧪 Saving to AsyncStorage:', JSON.stringify(tempData));
      
      //resetSessionTimer(logout); // Start session timer on signup

      if (!tempData.name || !tempData.age) {
        router.replace('../info'); // <-- Go to the info page
      } else {
        router.replace('/'); // <-- Normal flow
      }
      return;
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    //clearTimeout(timeoutHandle); 
    setUser(null);
    await AsyncStorage.removeItem('user');
    router.replace('/login');
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