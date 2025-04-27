import React, {createContext, useState, useContext, useEffect, ReactNode, useRef} from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/apiConfig';
import { useAuth } from './AuthContext';

interface ProfileContextType {
    imageUri: string | null;
    imageLoading: boolean;
    profileImageKey: number;
    fetchProfilePic: () => Promise<void>;
    handleImagePick: () => Promise<void>;
    refreshProfileImage: () => void;
}
  
const ProfileContext = createContext<ProfileContextType>({
    imageUri: null,
    imageLoading: false,
    profileImageKey: 0,
    fetchProfilePic: async () => {},
    handleImagePick: async () => {},
    refreshProfileImage: () => {},
});
  
interface ProfileProviderProps {
    children: ReactNode;
}
  
export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const userId = user?.UserId;
  
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [profileImageKey, setProfileImageKey] = useState<number>(0);
  
    const storageKey = userId ? `@profileImageUri:${userId}` : '';
  
    useEffect(() => {
      if (userId) {
        fetchProfilePic();
      }
    }, [userId]);
  
    const fetchProfilePic = async (forceRefresh = false): Promise<void> => {
      if (!userId) return;
  
      setImageLoading(true);
  
      try {
        const cachedUri = await AsyncStorage.getItem(storageKey);
        if (cachedUri && !forceRefresh) {
          setImageUri(cachedUri);
          setImageLoading(false);
          return;
        }
  
        const timestamp = Date.now();
        const imageUrl = `${API_BASE_URL}/api/images/profile-image/${userId}?t=${timestamp}`;
        const response = await fetch(imageUrl);
  
        if (!response.ok) {
          if (response.status === 404) {
            setImageUri(null);
            await AsyncStorage.removeItem(storageKey);
            return;
          }
          throw new Error(`Failed to fetch profile image: ${response.status}`);
        }
  
        const blob = await response.blob();
  
        if (Platform.OS === 'web') {
          setImageUri(imageUrl);
          await AsyncStorage.setItem(storageKey, imageUrl);
        } else {
          const fileReader = new FileReader();
          fileReader.onload = async () => {
            try {
              const result = fileReader.result;
              if (typeof result === 'string') {
                const base64data = result.split(',')[1];
                const localPath = `${FileSystem.cacheDirectory}profile-${timestamp}.jpg`;
                await FileSystem.writeAsStringAsync(localPath, base64data, {
                  encoding: FileSystem.EncodingType.Base64,
                });
                setImageUri(localPath);
                await AsyncStorage.setItem(storageKey, localPath);
              }
            } catch (err) {
              console.log('Error saving image locally:', err);
            }
          };
          fileReader.readAsDataURL(blob);
        }
      } catch (error) {
        console.log('Error fetching profile image:', error);
      } finally {
        setImageLoading(false);
      }
    };
  
    const handleImagePick = async (): Promise<void> => {
        if (!userId) return Alert.alert('Error', 'User ID not available');
  
        try {
            if (Platform.OS !== 'web') {
                const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!granted) {
                    Alert.alert('Permission denied', 'Media access is required.');
                    return;
                }
            }
  
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });
  
            if (result.canceled || !result.assets?.[0]) return;
  
            const asset = result.assets[0];
            const originalUri = asset.uri;
  
            let finalUri = originalUri;
  
            // Save to cache for mobile
            if (Platform.OS !== 'web') {
                const fileName = `profile-${Date.now()}.jpg`;
                finalUri = `${FileSystem.cacheDirectory}${fileName}`;
                await FileSystem.copyAsync({ from: originalUri, to: finalUri });
            }
  
            setImageUri(finalUri);
            await AsyncStorage.setItem(storageKey, finalUri);
  
            // Upload image in background 
            const formData = new FormData();
            formData.append('userId', userId);
    
            if (Platform.OS === 'web') {
                const blob = await (await fetch(originalUri)).blob();
                formData.append('image', blob, 'profile.jpg');
            } else {
                formData.append('image', {
                    uri: originalUri,
                    name: 'profile.jpg',
                    type: 'image/jpeg',
                } as any);
            }
  
            setImageLoading(true);
  
            const uploadResponse = await fetch(`${API_BASE_URL}/api/images/upload`, {
                method: 'POST',
                body: formData,
                headers: Platform.OS === 'web' ? undefined : {
                    'Content-Type': 'multipart/form-data',
                },
            });
  
            if (!uploadResponse.ok) {
                const errText = await uploadResponse.text();
                throw new Error(`Upload failed: ${uploadResponse.status} - ${errText}`);
            }
    
            refreshProfileImage();
    
            Alert.alert('Success', 'Profile image updated.');
        
        } catch (error) {
        
        console.log('Error selecting or uploading image:', error);
        Alert.alert('Upload Failed', 'Something went wrong during upload.');
      
      } finally {
            setImageLoading(false);
        }
    };
  
    const refreshProfileImage = () => {
        setProfileImageKey((prev) => prev + 1);
        fetchProfilePic(true);
    };
  
    return (
        <ProfileContext.Provider
        value={{
            imageUri,
            imageLoading,
            profileImageKey,
            fetchProfilePic,
            handleImagePick,
            refreshProfileImage,
        }}
        >
        {children}
        </ProfileContext.Provider>
    );
};
  
export const useProfile = () => useContext(ProfileContext);
  