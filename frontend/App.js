import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { useAuthStore } from './src/store/authStore';
import Toast from 'react-native-toast-message';

export default function App() {
  const loadUser = useAuthStore((state) => state.loadUser);

  // Load persisted auth on app start
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <NavigationContainer>
      <AuthProvider>
        <RootNavigator />
        <Toast />
      </AuthProvider>
    </NavigationContainer>
  );
}
