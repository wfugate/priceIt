import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter  } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ProfileProvider } from '../context/ProfileContxt';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null; // wait until fonts are ready
  }

  return (
    <AuthProvider>
      <ProfileProvider>
        <RootLayoutNav />
      </ProfileProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();


  // Hide splash screen once we've loaded auth state
  useEffect(() => {
    if (!loading) {

      SplashScreen.hideAsync().catch(console.error);
    }
  }, [loading]);

  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      {/* Use a conditional to switch between auth and non-auth layouts */}
      {user ? (
        // User is authenticated
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      ) : (
        // User is NOT authenticated
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="info" />
          {/* Redirect any attempts to access other screens */}
          <Stack.Screen name="index" redirect={true} />
          <Stack.Screen name="(tabs)" redirect={true} />

        </Stack>
      )}
    </ThemeProvider>
  );
}