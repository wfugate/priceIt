import React, {createContext, useState, useContext, useEffect, ReactNode, useRef} from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/apiConfig';
import { useAuth } from './AuthContext';

// interface for profile context type
interface ProfileContextType {
    imageUri: string | null;
    imageLoading: boolean;
    profileImageKey: number;
    fetchProfilePic: () => Promise<void>;
    handleImagePick: () => Promise<void>;
    refreshProfileImage: () => void;
}

// create context with default values
const ProfileContext = createContext<ProfileContextType>({
    imageUri: null,
    imageLoading: false,
    profileImageKey: 0,
    fetchProfilePic: async () => {},
    handleImagePick: async () => {},
    refreshProfileImage: () => {},
});

// interface for profile provider props
interface ProfileProviderProps {
    children: ReactNode;
}

// profile provider component to manage user profile image
export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
    // get user from auth context
    const { user } = useAuth();
    const userId = user?.UserId;
  
    // state for profile image and loading status
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [profileImageKey, setProfileImageKey] = useState<number>(0);
  
    // storage key for caching profile image URI
    const storageKey = userId ? `@profileImageUri:${userId}` : '';
  
    // fetch profile image when user ID changes
    useEffect(() => {
      if (userId) {
        fetchProfilePic();
      }
    }, [userId]);
  
    // function to fetch the user's profile picture
    const fetchProfilePic = async (forceRefresh = false): Promise<void> => {
      if (!userId) return;
  
      setImageLoading(true);
  
      try {
        // try to get cached image URI first
        const cachedUri = await AsyncStorage.getItem(storageKey);
        if (cachedUri && !forceRefresh) {
          setImageUri(cachedUri);
          setImageLoading(false);
          return;
        }
  
        // add timestamp to prevent caching issues
        const timestamp = Date.now();
        const imageUrl = `${API_BASE_URL}/api/images/profile-image/${userId}?t=${timestamp}`;
        const response = await fetch(imageUrl);
  
        if (!response.ok) {
          if (response.status === 404) {
            // no profile image found
            setImageUri(null);
            await AsyncStorage.removeItem(storageKey);
            return;
          }
          throw new Error(`Failed to fetch profile image: ${response.status}`);
        }
  
        // get image data as blob
        const blob = await response.blob();
  
        // handle image differently for web vs. native platforms
        if (Platform.OS === 'web') {
          // web platform: use URL directly
          setImageUri(imageUrl);
          await AsyncStorage.setItem(storageKey, imageUrl);
        } else {
          // native platforms: save blob to file system
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
  
    // function to handle picking a new profile image
    const handleImagePick = async (): Promise<void> => {
        if (!userId) return Alert.alert('Error', 'User ID not available');
  
        try {
            // request media library permission on native platforms
            if (Platform.OS !== 'web') {
                const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!granted) {
                    Alert.alert('Permission denied', 'Media access is required.');
                    return;
                }
            }
  
            // launch image picker
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
  
            // for mobile platforms, save to local filesystem
            if (Platform.OS !== 'web') {
                const fileName = `profile-${Date.now()}.jpg`;
                finalUri = `${FileSystem.cacheDirectory}${fileName}`;
                await FileSystem.copyAsync({ from: originalUri, to: finalUri });
            }
  
            // update local image state and cache
            setImageUri(finalUri);
            await AsyncStorage.setItem(storageKey, finalUri);
  
            // prepare form data for upload
            const formData = new FormData();
            formData.append('userId', userId);
    
            // attach image differently for web vs. native
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
  
            // upload image to server
            const uploadResponse = await fetch(`${API_BASE_URL}/api/images/upload`, {
                method: 'POST',
                body: formData,
                headers: Platform.OS === 'web' ? undefined : {
                    'Content-Type': 'multipart/form-data',
                },
            });
  
            if (!uploadResponse.ok) {
                const errText = await uploadResponse.text().catch(() => '');
                throw new Error(`Upload failed: ${uploadResponse.status} - ${errText}`);
            }
    
            // refresh profile image to show uploaded version
            refreshProfileImage();
    
            Alert.alert('Success', 'Profile image updated.');
        
        } catch (error) {
        
        console.log('Error selecting or uploading image:', error);
        Alert.alert('Upload Failed', 'Something went wrong during upload.');
      
      } finally {
            setImageLoading(false);
        }
    };
  
    // function to refresh the profile image
    const refreshProfileImage = () => {
        // increment key to force re-render of image component
        setProfileImageKey((prev) => prev + 1);
        // fetch fresh image from server
        fetchProfilePic(true);
    };
  
    // provide profile context to child components
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
  
// hook to access profile context in components
export const useProfile = () => useContext(ProfileContext);